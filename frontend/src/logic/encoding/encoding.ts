import { get } from "svelte/store";
import { STAT_KEYS, type StatKey, type Stats } from "../../types/stats";
import { decodeStatIndexes, encodeStatValues } from "./valueEncoding";
import {
    automaticWeights,
    exoAp,
    exoMp,
    exoRange,
    level,
    maxStats,
    maxStatsIndex,
    minStats,
    minStatsIndex,
    weights,
    weightsIndex,
} from "../../stores/builder";
import { partial } from "zod/v4-mini";
import {
    // copyDefaultWeights,
    defaultMaxIndex,
    defaultMinIndex,
    // getDefaultWeight,
} from "../../types/statWeights";

export const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-" as const;

// Maps each stat to its position
export const STAT_INDEX = {
    // 🟩 Utility (0–15)
    health: 0,
    ap: 1,
    mp: 2,
    range: 3,
    summon: 4,
    initiative: 5,
    wisdom: 6,
    prospecting: 7,
    lock: 8,
    dodge: 9,
    mpReduction: 10,
    apReduction: 11,
    mpResist: 12,
    apResist: 13,
    heal: 14,
    pods: 15,

    // 🟥 Offense (16–36)
    strength: 16,
    agility: 17,
    chance: 18,
    intelligence: 19,
    power: 20,

    neutralDamage: 21,
    earthDamage: 22,
    fireDamage: 23,
    waterDamage: 24,
    airDamage: 25,

    damage: 26,
    criticalDamage: 27,
    criticalChance: 28,
    pushbackDamage: 29,
    trapDamage: 30,
    trapPower: 31,

    spellDamagePer: 32,
    rangedDamagePer: 33,
    meleeDamagePer: 34,
    weaponDamagePer: 35,
    // finalDamagePer: 51,

    // 🛡️ Defense (36–51)
    neutralResistPer: 36,
    earthResistPer: 37,
    fireResistPer: 38,
    waterResistPer: 39,
    airResistPer: 40,

    rangedResistPer: 41,
    meleeResistPer: 42,

    neutralResist: 43,
    earthResist: 44,
    fireResist: 45,
    waterResist: 46,
    airResist: 47,

    criticalResist: 48,
    pushbackResist: 49,
    reflect: 50,
} as const;
export const STAT_INDEX_KEYS = Object.keys(STAT_INDEX) as StatKey[];
export const INDEX_TO_KEY = STAT_INDEX_KEYS.sort((a, b) => STAT_INDEX[a] - STAT_INDEX[b]);

export function binomial(n: number, k: number): bigint {
    if (k < 0 || k > n) return 0n;
    if (k === 0 || k === n) return 1n;

    // Use symmetry to reduce calculations
    k = Math.min(k, n - k);

    let result = 1n;
    for (let i = 0; i < k; i++) {
        result = (result * BigInt(n - i)) / BigInt(i + 1);
    }
    return result;
}

export function rankCombination(positions: number[]): bigint {
    let rank = 0n;
    for (let i = 0; i < positions.length; i++) {
        rank += binomial(positions[i]!, i + 1);
    }
    return rank;
}
export function unrankCombination<T>(rank: bigint, k: number, allElements: T[]): T[] {
    const n = allElements.length;
    const positions: number[] = [];
    let remainingRank = rank;

    for (let i = k - 1; i >= 0; i--) {
        let pos = n - 1;

        // Find largest pos such that C(pos, i + 1) <= remainingRank
        while (pos >= i && binomial(pos, i + 1) > remainingRank) {
            pos--;
        }
        positions.push(pos);
        // positions.unshift(pos);
        remainingRank -= binomial(pos, i + 1);
    }
    // positions.reverse();
    return positions.map((pos) => allElements[pos]!);
}

// Convert a bigint to base64 string using our alphabet
export function encodeBase64(num: bigint): string {
    if (num === 0n) return ALPHABET[0]!;

    let result = "";
    while (num > 0n) {
        const remainder = Number(num % 64n);
        result = ALPHABET[remainder] + result;
        num = num / 64n;
    }
    return result;
}

// Convert a base64 string back to bigint
export function decodeBase64(str: string): bigint {
    let result = 0n;
    for (const char of str) {
        const value = ALPHABET.indexOf(char);
        if (value === -1) throw new Error(`Invalid character in base64 string: ${char}`);
        result = result * 64n + BigInt(value);
    }
    return result;
}
function compressRepeats(arr: string[]): string[] {
    if (arr.length === 0) return [];

    const result: string[] = [];
    let count = 1;

    for (let i = 1; i <= arr.length; i++) {
        if (arr[i] === arr[i - 1]) {
            count++;
        } else {
            // push previous element
            result.push(arr[i - 1]!);
            if (count > 1) {
                result.push(`+${ALPHABET[count - 1]}`);
            }
            count = 1;
        }
    }

    return result;
}
function decompressRepeats(arr: string[]): string[] {
    const result: string[] = [];

    for (let i = 0; i < arr.length; i++) {
        const value = arr[i]!;

        // check if it's a "+N" entry
        if (value.startsWith("+")) {
            const count = ALPHABET.indexOf(value.slice(1));
            const last = result[result.length - 1]!;
            // repeat the last value 'count' more times
            for (let j = 0; j < count; j++) {
                result.push(last);
            }
        } else {
            result.push(value);
        }
    }
    return result;
}

export function encodeStats(): string {
    const statsToEncode = new Set<StatKey>();

    const weightsToEncode = get(weightsIndex);
    const minStatsToEncode = get(minStatsIndex);
    const maxStatsToEncode = get(maxStatsIndex);
    Object.entries(weightsToEncode)
        .filter(([_, value]) => value > 0)
        .forEach(([key]) => statsToEncode.add(key as StatKey));

    Object.entries(minStatsToEncode)
        .filter(([_, value]) => value > 0)
        .forEach(([key]) => statsToEncode.add(key as StatKey));

    // Add stats with max values that differ from defaults
    Object.entries(maxStatsToEncode)
        .filter(([key, value]) => {
            const defaultIndex = defaultMaxIndex[key as StatKey];
            return defaultIndex === undefined || value !== defaultIndex;
        })
        .forEach(([key]) => statsToEncode.add(key as StatKey));

    // console.log("statsToEncode", statsToEncode);
    const encodedStats = encodeStatsKeys([...statsToEncode]);
    // console.log("encoded", encodedStats);
    const encodedExosAndlevel = encodeExosAndLevel(
        get(automaticWeights),
        get(exoAp),
        get(exoMp),
        get(exoRange),
        get(level),
    );
    return encodedExosAndlevel.concat("|", encodedStats);
}

function encodeStatsKeys(statKeys: StatKey[]): string {
    if (statKeys.length === 0) {
        return "";
    }
    // console.log("statKeys", statKeys);
    const positions = statKeys.map((id) => STAT_INDEX[id]).sort((a, b) => a - b);
    // console.log("positions", positions);

    const rank = rankCombination(positions);

    // First character encodes the number of stats

    const statsWeight = get(weightsIndex);
    const statsMin = get(minStatsIndex);
    const statsMax = get(maxStatsIndex);

    let encodedStats: string[] = [];
    for (const statIndex of positions) {
        // if (statKeys.includes(statKey)) {
        const statKey = INDEX_TO_KEY[statIndex] as StatKey;
        const encodedValues = encodeStatValues(
            // statKey,
            statsWeight[statKey],
            statsMin[statKey],
            statsMax[statKey],
        );
        // console.log("statKey", statKey);
        // console.log("encodedValues", encodedValues);
        encodedStats.push(encodedValues);
        // }
    }
    encodedStats = compressRepeats(encodedStats);
    return encodeBase64(rank).concat("|", encodedStats.join(""));
}

export function decodeStats(encoded: string) {
    // if (encoded.length === 0) return [];

    const encodedSplit = encoded.split("|");

    if (encodedSplit[0]) {
        decodeExosAndLevel(encodedSplit[0]);
    } else {
        return;
    }

    if (!encodedSplit[1] || !encodedSplit[2]) {
        return;
    }
    const rank = decodeBase64(encodedSplit[1]);

    let encodedStats: string[] = [];
    const encodedStatsStr = encodedSplit[2]!;
    let previousEncodedStr = "";
    for (let i = 0; i < encodedStatsStr.length; i += 1) {
        if (encodedStatsStr[i] == "+") {
            const repeats = ALPHABET.indexOf(encodedStatsStr[i + 1]!);
            for (let j = 0; j < repeats; j += 1) {
                encodedStats.push(previousEncodedStr);
            }
            i += 1;
        } else {
            previousEncodedStr = encodedStatsStr.slice(i, i + 3);
            encodedStats.push(previousEncodedStr);
            i += 2;
        }
    }
    encodedStats = decompressRepeats(encodedStats);
    // console.log("encodedStats", encodedStats);
    // const rank = decodeBase64(encoded.slice(1));
    // console.log("Decoded RANK :", rank, encodedStats.length);
    const statKeys = unrankCombination(rank, encodedStats.length, INDEX_TO_KEY).reverse();
    // console.log("statKeys", statKeys);

    let decodedWeights: Partial<Stats> = {};
    let decodedMin: Partial<Stats> = {};
    let decodedMax: Partial<Stats> = { ...defaultMaxIndex };
    let i = 0;
    for (const statKey of statKeys) {
        // if (statKeys.includes(statKey)) {
        // console.log("i", i);
        // console.log("encodedStats[i]!", encodedStats[i]!);
        const { weight, min, max } = decodeStatIndexes(encodedStats[i]!);
        i++;
        if (weight != 0) decodedWeights[statKey] = weight;
        if (min != 0) decodedMin[statKey] = min;
        if (max != 0) decodedMax[statKey] = max;
        // }
    }
    weightsIndex.set(decodedWeights);
    minStatsIndex.set(decodedMin);
    maxStatsIndex.set(decodedMax);
}

export function encodeExosAndLevel(
    automaticWeights: boolean,
    exoAp: boolean,
    exoMp: boolean,
    exoRange: boolean,
    level: number,
): string {
    // pack bits: 4 bits for booleans + 8 bits for level
    let bits =
        (automaticWeights ? 1 : 0) |
        ((exoAp ? 1 : 0) << 1) |
        ((exoMp ? 1 : 0) << 2) |
        ((exoRange ? 1 : 0) << 3) |
        ((level & 0xff) << 4); // 8 bits for level

    // split into 2 groups of 6 bits
    const c1 = bits & 0b111111;
    const c2 = (bits >> 6) & 0b111111;

    return ALPHABET[c1]! + ALPHABET[c2]!;
}
export function decodeExosAndLevel(encoded: string) {
    const c1 = ALPHABET.indexOf(encoded[0]!);
    const c2 = ALPHABET.indexOf(encoded[1]!);

    const bits = c1 | (c2 << 6);

    const decodedAutomaticWeights = !!(bits & 1);
    const decodedExoAp = !!(bits & 2);
    const decodedExoMp = !!(bits & 4);
    const decodedExoRange = !!(bits & 8);
    const decodedLevel = Math.min(200, (bits >> 4) & 0xff);

    automaticWeights.set(decodedAutomaticWeights);
    exoAp.set(decodedExoAp);
    exoMp.set(decodedExoMp);
    exoRange.set(decodedExoRange);
    // console.log("DECODED LEVEL", decodedLevel);
    level.set(decodedLevel);
}
