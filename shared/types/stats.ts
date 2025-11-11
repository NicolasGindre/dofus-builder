export type Stats = Record<StatKey, number>;
export type StatKey = (typeof STAT_KEYS)[number];

export const STAT_UTILITY_KEYS = [
    "vitality",
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

export const STAT_STAT_KEYS = ["strength", "intelligence", "chance", "agility"] as const;
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
