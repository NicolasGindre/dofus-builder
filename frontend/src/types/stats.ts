export type Stats = Record<StatKey, number>;
// export type StatElementalPerDefense = Record<StatElementalPerDefenseKey, number>;
// export type StatCacRangeDefense = Record<StatCacRangeDefenseKey, number>;
// export type StatElementalDefense = Record<StatElementalDefenseKey, number>;

export type StatKey = (typeof STAT_KEYS)[number];
// export type StatElementalPerDefenseKey = (typeof STAT_ELEMENTAL_PER_DEFENSE_KEYS)[number];
// export type StatCacRangeDefenseKey = (typeof STAT_CACRANGE_DEFENSE_KEYS)[number];
// export type StatElementalDefenseKey = (typeof STAT_ELEMENTAL_DEFENSE_KEYS)[number];

// export function isElementalPerDefenseKey(key: string): key is StatElementalPerDefenseKey {
//     return (STAT_ELEMENTAL_PER_DEFENSE_KEYS as readonly string[]).includes(key);
// }

// export function isElementalDefenseKey(key: string): key is StatElementalDefenseKey {
//     return (STAT_ELEMENTAL_DEFENSE_KEYS as readonly string[]).includes(key);
// }

// export function isCacRangeDefenseKey(key: string): key is StatCacRangeDefenseKey {
//     return (STAT_CACRANGE_DEFENSE_KEYS as readonly string[]).includes(key);
// }

export const STAT_UTILITY_KEYS = [
    "health",
    "ap",
    "mp",
    "range",
    "summon",
    "initiative",

    "wisdom",
    "prospecting",

    "lock",
    "dodge",

    "mpReduction",
    "apReduction",

    "mpResist",
    "apResist",

    "heal",
    "pods",
] as const;

export const STAT_STAT_KEYS = ["strength", "agility", "chance", "intelligence"] as const;
export const STAT_DAMAGE_KEYS = [
    "neutralDamage",
    "earthDamage",
    "fireDamage",
    "waterDamage",
    "airDamage",
] as const;
export const STAT_OFFENSE_KEYS = [
    ...STAT_STAT_KEYS,
    "power",

    ...STAT_DAMAGE_KEYS,
    "damage",

    "criticalDamage",
    "criticalChance",

    "pushbackDamage",

    "trapDamage",
    "trapPower",

    "spellDamagePer",
    "rangedDamagePer",
    "meleeDamagePer",
    "weaponDamagePer",
    // "finalDamagePer",
] as const;

export const STAT_ELEMENTAL_PER_DEFENSE_KEYS = [
    "neutralResistPer",
    "earthResistPer",
    "fireResistPer",
    "waterResistPer",
    "airResistPer",
] as const;
export const STAT_CACRANGE_DEFENSE_KEYS = ["rangedResistPer", "meleeResistPer"] as const;
export const STAT_ELEMENTAL_DEFENSE_KEYS = [
    "neutralResist",
    "earthResist",
    "fireResist",
    "waterResist",
    "airResist",
] as const;

export const STAT_DEFENSE_KEYS = [
    ...STAT_ELEMENTAL_PER_DEFENSE_KEYS,
    ...STAT_CACRANGE_DEFENSE_KEYS,
    ...STAT_ELEMENTAL_DEFENSE_KEYS,
    "criticalResist",
    "pushbackResist",

    "reflect",
] as const;

export const STAT_KEYS = [...STAT_UTILITY_KEYS, ...STAT_OFFENSE_KEYS, ...STAT_DEFENSE_KEYS];

const bonusStatsMap: Partial<Record<StatKey, TargetBonusStat[]>> = {
    strength: [
        { target: "pods", multiplicator: 5 },
        { target: "initiative", multiplicator: 1 },
    ],
    chance: [
        { target: "prospecting", multiplicator: 1 / 10 },
        { target: "initiative", multiplicator: 1 },
    ],
    agility: [
        { target: "lock", multiplicator: 1 / 10 },
        { target: "dodge", multiplicator: 1 / 10 },
        { target: "initiative", multiplicator: 1 },
    ],
    intelligence: [{ target: "initiative", multiplicator: 1 }],
    wisdom: [
        { target: "apReduction", multiplicator: 1 / 10 },
        { target: "apResist", multiplicator: 1 / 10 },
        { target: "mpReduction", multiplicator: 1 / 10 },
        { target: "mpResist", multiplicator: 1 / 10 },
    ],
};

type TargetBonusStat = {
    target: StatKey;
    multiplicator: number;
};

export function getBonusStats(stats: Partial<Stats>): Partial<Stats> {
    let bonusStats: Partial<Stats> = {};
    for (const [statName, targetStats] of Object.entries(bonusStatsMap)) {
        const statKey = statName as StatKey;
        // bonusStats[statKey] = value; // + (bonusStats[statKey] ?? 0);
        if (stats[statKey]) {
            for (const targetStat of targetStats) {
                bonusStats[targetStat.target] = stats[statKey] * targetStat.multiplicator;
            }
        }
    }
    return concatStats(stats, bonusStats);
}

export function concatStats(a: Partial<Stats>, b: Partial<Stats>): Partial<Stats> {
    const result: Partial<Stats> = {};

    for (const key of Object.keys(a) as (keyof Stats)[]) {
        if (a[key] !== undefined) {
            result[key] = (result[key] ?? 0) + (a[key] ?? 0);
        }
    }

    for (const key of Object.keys(b) as (keyof Stats)[]) {
        if (b[key] !== undefined) {
            result[key] = (result[key] ?? 0) + (b[key] ?? 0);
        }
    }

    return result;
}

export function diffStats(a: Partial<Stats>, b: Partial<Stats>): Partial<Stats> {
    const result: Partial<Stats> = {};

    for (const key of Object.keys(a) as (keyof Stats)[]) {
        if (a[key] !== undefined) {
            result[key] = (result[key] ?? 0) + (a[key] ?? 0);
        }
    }

    for (const key of Object.keys(b) as (keyof Stats)[]) {
        if (b[key] !== undefined) {
            result[key] = (result[key] ?? 0) - (b[key] ?? 0);
        }
    }

    return result;
}
