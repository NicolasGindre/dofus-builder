export type Stats = Record<StatKey, number>;

export type StatKey = (typeof STAT_KEYS)[number];
export type StatUtilityKey = (typeof STAT_UTILITY_KEYS)[number];
export type StatOffenseKey = (typeof STAT_OFFENSE_KEYS)[number];
export type StatDefenseKey = (typeof STAT_DEFENSE_KEYS)[number];

export const STAT_UTILITY_KEYS = [
    "ap",
    "mp",
    "range",
    "summon",
    "wisdom",
    "prospecting",

    "mpReduction",
    "apReduction",

    "mpResist",
    "apResist",

    "heal",
    "initiative",
    "pods",
    "lock",
    "dodge",
] as const;

export const STAT_OFFENSE_KEYS = [
    "strength",
    "agility",
    "chance",
    "intelligence",

    "power",

    "neutralDamage",
    "earthDamage",
    "airDamage",
    "waterDamage",
    "fireDamage",
    "damage",

    "criticalChance",
    "criticalDamage",

    "pushbackDamage",

    "trapDamage",
    "trapPower",

    "spellDamagePer",
    "rangedDamagePer",
    "meleeDamagePer",
    "weaponDamagePer",
    "finalDamagePer",
] as const;

export const STAT_DEFENSE_KEYS = [
    "health",

    "neutralResistPer",
    "earthResistPer",
    "airResistPer",
    "waterResistPer",
    "fireResistPer",

    "rangedResistPer",
    "meleeResistPer",

    "criticalResist",
    "pushbackResist",

    "neutralResist",
    "earthResist",
    "airResist",
    "waterResist",
    "fireResist",

    "reflect",
] as const;

export const STAT_KEYS = [...STAT_DEFENSE_KEYS, ...STAT_OFFENSE_KEYS, ...STAT_UTILITY_KEYS];

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
