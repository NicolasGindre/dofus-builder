export type Stats = Record<StatKey, number>;

export type StatKey = (typeof STAT_KEYS)[number];

export const STAT_KEYS = [
    "AP",
    "MP",
    "range",
    "summon",

    "health",

    "strength",
    "agility",
    "chance",
    "intelligence",

    "power",
    "wisdom",
    "prospecting",

    "lock",
    "dodge",

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

    "damage",
    "neutralDamage",
    "earthDamage",
    "airDamage",
    "waterDamage",
    "fireDamage",

    "criticalResist",
    "pushbackResist",

    "neutralResist",
    "earthResist",
    "airResist",
    "waterResist",
    "fireResist",

    "neutralResistPer",
    "earthResistPer",
    "airResistPer",
    "waterResistPer",
    "fireResistPer",

    "rangedResistPer",
    "meleeResistPer",

    "mpReduction",
    "apReduction",

    "mpResist",
    "apResist",

    "heal",
    "reflect",

    "initiative",
    "pods",
] as const;

const bonusStatsMap: Partial<Record<StatKey, TargetBonusStat[]>> = {
    strength: [{ target: "pods", multiplicator: 5 }],
    chance: [{ target: "prospecting", multiplicator: 1 / 10 }],
    agility: [
        { target: "lock", multiplicator: 1 / 10 },
        { target: "dodge", multiplicator: 1 / 10 },
    ],
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
    for (const [statName, value] of Object.entries(stats)) {
        const statKey = statName as StatKey;
        bonusStats[statKey] = value + (bonusStats[statKey] ?? 0);
        if (bonusStatsMap[statKey]) {
            for (const targetBonusStat of bonusStatsMap[statKey]) {
                const bonus = value * targetBonusStat.multiplicator;
                bonusStats[targetBonusStat.target] = bonus + (stats[targetBonusStat.target] ?? 0);
            }
        }
    }
    return bonusStats;
}
