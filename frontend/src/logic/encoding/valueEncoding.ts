import type { StatKey } from "../../types/stats";
import { ALPHABET } from "./encoding";

// Weight encoding table - 128 values (7 bits)
// Values represent the actual weight value for each encoded index
export const WEIGHT_ENCODING: number[] = [
    0, 0.001, 0.002, 0.003, 0.004, 0.005, 0.006, 0.007, 0.008, 0.009, 0.01, 0.02, 0.03, 0.04, 0.05,
    0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.2, 0.21,
    0.22, 0.23, 0.24, 0.25, 0.26, 0.27, 0.28, 0.29, 0.3, 0.31, 0.32, 0.33, 0.34, 0.35, 0.36, 0.37,
    0.38, 0.39, 0.4, 0.41, 0.42, 0.43, 0.44, 0.45, 0.46, 0.47, 0.48, 0.49, 0.5, 0.51, 0.52, 0.53,
    0.54, 0.55, 0.56, 0.57, 0.58, 0.59, 0.6, 0.61, 0.62, 0.63, 0.64, 0.65, 0.66, 0.67, 0.68, 0.69,
    0.7, 0.71, 0.72, 0.73, 0.74, 0.75, 0.76, 0.77, 0.78, 0.79, 0.8, 0.81, 0.82, 0.83, 0.84, 0.85,
    0.86, 0.87, 0.88, 0.89, 0.9, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 1, 1.1, 1.2,
    1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 3, 4, 5, 6, 7, 8, 9, 10,
] as const;

// Value encoding table - 41 values (5.5 bits)
// Values represent the actual stat value for each encoded index before applying coefficient
export const MIN_MAX_ENCODING: number[] = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,

    10, 11, 12, 13, 14, 15, 16, 17, 18, 19,

    20, 22, 24, 26, 28,

    30, 33, 36,

    40, 43, 46,

    50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
] as const;

// Coefficients for different stat types
// These are multiplied with the value from MIN_MAX_ENCODING
export const MIN_MAX_COEFFICIENTS: Record<StatKey, number> = {
    ap: 1,
    mp: 1,
    range: 1,
    summon: 1,

    health: 80,

    wisdom: 8,
    prospecting: 8,

    strength: 20,
    agility: 20,
    chance: 20,
    intelligence: 20,

    power: 10,

    trapPower: 10,
    trapDamage: 3,

    neutralDamage: 3,
    earthDamage: 3,
    airDamage: 3,
    fireDamage: 3,
    waterDamage: 3,

    damage: 2,

    pushbackDamage: 8,

    criticalDamage: 3,
    criticalChance: 1,

    neutralResistPer: 1,
    airResistPer: 1,
    earthResistPer: 1,
    fireResistPer: 1,
    waterResistPer: 1,

    meleeResistPer: 1,
    rangedResistPer: 1,

    criticalResist: 6,
    pushbackResist: 6,

    neutralResist: 5,
    earthResist: 5,
    waterResist: 5,
    airResist: 5,
    fireResist: 5,

    pods: 150,
    initiative: 150,

    lock: 5,
    dodge: 5,

    mpReduction: 5,
    apReduction: 5,
    apResist: 5,
    mpResist: 5,

    heal: 5,
    reflect: 5,

    spellDamagePer: 1,
    rangedDamagePer: 1,
    meleeDamagePer: 1,
    weaponDamagePer: 1,
} as const;

export const WEIGHT_COEFFICIENTS: Record<StatKey, number> = {
    ap: 500,
    mp: 500,
    range: 100,
    summon: 100,

    health: 1,

    wisdom: 10,
    prospecting: 10,

    strength: 5,
    agility: 5,
    chance: 5,
    intelligence: 5,

    power: 5,

    trapPower: 5,
    trapDamage: 20,

    neutralDamage: 10,
    earthDamage: 10,
    airDamage: 10,
    fireDamage: 10,
    waterDamage: 10,

    damage: 20,

    pushbackDamage: 20,

    criticalDamage: 20,
    criticalChance: 50,

    neutralResistPer: 20,
    airResistPer: 20,
    earthResistPer: 20,
    fireResistPer: 20,
    waterResistPer: 20,

    meleeResistPer: 50,
    rangedResistPer: 50,

    criticalResist: 10,
    pushbackResist: 10,

    neutralResist: 10,
    earthResist: 10,
    waterResist: 10,
    airResist: 10,
    fireResist: 10,

    pods: 1,
    initiative: 1,

    lock: 10,
    dodge: 10,

    mpReduction: 10,
    apReduction: 10,
    apResist: 10,
    mpResist: 10,

    heal: 10,
    reflect: 10,

    spellDamagePer: 50,
    rangedDamagePer: 50,
    meleeDamagePer: 50,
    weaponDamagePer: 50,
} as const;

export const WEIGHTS_COEFF_ENCODING: Record<StatKey, number[]> = Object.fromEntries(
    Object.entries(WEIGHT_COEFFICIENTS).map(([statKey, coeff]) => [
        statKey,
        WEIGHT_ENCODING.map((w) => Math.round(w * coeff * 1e6) / 1e6),
    ]),
) as Record<StatKey, number[]>;

// Helper functions to encode/decode values
export function findClosestWeightIndex(stat: StatKey, value?: number): number {
    // Find the index of the closest value in WEIGHT_ENCODING
    if (!value) {
        return 0;
    }

    let closest = 0;
    let minDiff = Math.abs(WEIGHTS_COEFF_ENCODING[stat][0]! - value);

    for (let i = 1; i < WEIGHT_ENCODING.length; i++) {
        const diff = Math.abs(WEIGHTS_COEFF_ENCODING[stat][i]! - value);
        if (diff < minDiff) {
            minDiff = diff;
            closest = i;
        }
    }
    // console.log(closest);
    return closest;
}
export function findClosestWeightValue(stat: StatKey, value?: number): number {
    return getWeightFromIndex(stat, findClosestWeightIndex(stat, value));
}

export function findClosestMinMaxIndex(stat: StatKey, value?: number): number {
    if (!value) {
        return 0;
    }
    const coefficient = MIN_MAX_COEFFICIENTS[stat] || 1;

    let closest = 0;
    let minDiff = Math.abs(MIN_MAX_ENCODING[0]! * coefficient - value);

    for (let i = 1; i < MIN_MAX_ENCODING.length; i++) {
        const diff = Math.abs(MIN_MAX_ENCODING[i]! * coefficient - value);
        if (diff < minDiff) {
            minDiff = diff;
            closest = i;
        }
    }
    return closest;
}
export function findClosestMinMaxValue(stat: StatKey, value?: number): number {
    return getMinMaxFromIndex(stat, findClosestMinMaxIndex(stat, value));
}

export function getWeightFromIndex(stat: StatKey, index?: number): number {
    if (!index) {
        return 0;
    }
    return WEIGHTS_COEFF_ENCODING[stat][index] || 0;
}

export function getMinMaxFromIndex(stat: StatKey, index?: number): number {
    if (!index) {
        return 0;
    }
    const coefficient = MIN_MAX_COEFFICIENTS[stat] || 1;
    return (MIN_MAX_ENCODING[index] || 0) * coefficient;
}

// High-level encode/decode functions
export function encodeStatValues(
    // stat: StatKey,
    weightIndex?: number,
    minIndex?: number,
    maxIndex?: number,
): string {
    // const weightIndex = findClosestWeightIndex(weight);
    // const minIndex = findClosestMinMaxIndex(stat, min);
    // const maxIndex = findClosestMinMaxIndex(stat, max);

    weightIndex = weightIndex ?? 0;
    minIndex = minIndex ?? 0;
    maxIndex = maxIndex ?? 0;

    const minMaxLength = MIN_MAX_ENCODING.length;
    let n = (weightIndex * minMaxLength + minIndex) * minMaxLength + maxIndex;
    // mixed-radix pack → 0..236031

    // 3×6 = 18 bits → 3 Base64 chars
    let out = "";
    for (let i = 0; i < 3; i++) {
        out = ALPHABET[n & 63] + out; // take lowest 6 bits
        n >>>= 6;
    }
    return out;
}

export function decodeStatIndexes(
    // stat: StatKey,
    encoded: string,
): { weight: number; min: number; max: number } {
    let n = 0;
    for (const c of encoded) n = (n << 6) | ALPHABET.indexOf(c);

    const maxIndex = n % MIN_MAX_ENCODING.length;
    n = Math.floor(n / MIN_MAX_ENCODING.length);
    const minIndex = n % MIN_MAX_ENCODING.length;
    n = Math.floor(n / MIN_MAX_ENCODING.length);
    const weightIndex = n; // 0..127

    return {
        weight: weightIndex,
        min: minIndex,
        max: maxIndex,
    };
}
