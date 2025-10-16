import type { StatKey } from "../../types/stats";
import { ALPHABET } from "./encoding";

// Weight encoding table - 128 values (7 bits)
// Values represent the actual weight value for each encoded index
export const WEIGHT_ENCODING: number[] = [
    0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09,

    0.1, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19,

    0.2, 0.22, 0.24, 0.26, 0.28,

    0.3, 0.33, 0.36,

    0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95,

    1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.2, 2.4, 2.5, 2.6, 2.8, 3, 3.3, 3.6, 4, 4.3,
    4.6, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5,

    10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 33, 36, 40, 45, 50, 55, 60, 65,
    70, 75, 80, 85, 90, 95,

    100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 220, 240, 260, 280, 300, 330, 360, 400,
    450, 500, 600, 700, 800, 900, 1000,
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
export const STAT_COEFFICIENTS: Record<StatKey, number> = {
    ap: 1,
    mp: 1,
    range: 1,
    summon: 1,

    health: 50,

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

// Helper functions to encode/decode values
export function findClosestWeightIndex(value?: number): number {
    // Find the index of the closest value in WEIGHT_ENCODING
    if (!value) {
        return 0;
    }
    let closest = 0;
    let minDiff = Math.abs(WEIGHT_ENCODING[0]! - value);

    for (let i = 1; i < WEIGHT_ENCODING.length; i++) {
        const diff = Math.abs(WEIGHT_ENCODING[i]! - value);
        if (diff < minDiff) {
            minDiff = diff;
            closest = i;
        }
    }

    return closest;
}

export function findClosestValueIndex(stat: StatKey, value?: number): number {
    if (!value) {
        return 0;
    }
    const coefficient = STAT_COEFFICIENTS[stat] || 1;

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

export function getWeightFromIndex(index: number): number {
    return WEIGHT_ENCODING[index] || 0;
}

export function getMinMaxFromIndex(index: number, stat: StatKey): number {
    const coefficient = STAT_COEFFICIENTS[stat] || 1;
    return (MIN_MAX_ENCODING[index] || 0) * coefficient;
}

// High-level encode/decode functions
export function encodeStatValues(
    stat: StatKey,
    weight?: number,
    min?: number,
    max?: number,
): string {
    const weightIndex = findClosestWeightIndex(weight);
    const minIndex = findClosestValueIndex(stat, min);
    const maxIndex = findClosestValueIndex(stat, max);

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

export function decodeStatValues(
    stat: StatKey,
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
        weight: getWeightFromIndex(weightIndex),
        min: getMinMaxFromIndex(minIndex, stat),
        max: getMinMaxFromIndex(maxIndex, stat),
    };
}
