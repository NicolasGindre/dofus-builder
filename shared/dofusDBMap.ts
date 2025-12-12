import type { EffectType, ItemCategory, Element } from "./types/item";
import type { StatKey } from "./types/stats";

export const CATEGORY_ID_DOFUSDB: Record<ItemCategory, number[]> = {
    amulet: [1],
    belt: [10],
    boots: [11],
    cloak: [17],
    ring: [9],
    hat: [16],
    weapon: [2, 3, 4, 5, 6, 7, 8, 19, 20, 21, 22, 83, 99, 102, 114, 271],
    shield: [82],
    pet: [18, 97, 121, 196, 207],
    dofus: [151, 23, 217],
};

export const ELEMENT_ID_DOFUSDB: Record<number, [Element, EffectType]> = {
    100: ["neutral", "damage"],
    97: ["earth", "damage"],
    99: ["fire", "damage"],
    96: ["water", "damage"],
    98: ["air", "damage"],
    2822: ["bestElem", "damage"],

    95: ["neutral", "steal"],
    94: ["fire", "steal"],
    92: ["earth", "steal"],
    91: ["water", "steal"],
    93: ["air", "steal"],
    2828: ["bestElem", "steal"],

    108: ["fire", "heal"],

    127: ["mpReduce", "other"],
    101: ["apReduce", "other"],

    5: ["push", "push"],
    6: ["pull", "pull"],
};

export const STAT_ID_DOFUSDB: Record<number, StatKey> = {
    1: "ap",
    23: "mp",
    19: "range",
    26: "summon",

    11: "vitality",

    10: "strength",
    14: "agility",
    13: "chance",
    15: "intelligence",

    25: "power",
    12: "wisdom",
    48: "prospecting",

    79: "lock",
    78: "dodge",

    18: "criticalChance",

    86: "criticalDamage",
    84: "pushbackDamage",
    70: "trapDamage",
    69: "trapPower",

    123: "spellDamagePer",
    122: "weaponDamagePer",
    120: "rangedDamagePer",
    125: "meleeDamagePer",
    // xxx: "finalDamagePer",

    16: "damage",
    92: "neutralDamage",
    88: "earthDamage",
    91: "airDamage",
    90: "waterDamage",
    89: "fireDamage",

    87: "criticalResist",
    85: "pushbackResist",

    58: "neutralResist",
    54: "earthResist",
    57: "airResist",
    56: "waterResist",
    55: "fireResist",

    37: "neutralResistPer",
    33: "earthResistPer",
    36: "airResistPer",
    35: "waterResistPer",
    34: "fireResistPer",

    121: "rangedResistPer",
    124: "meleeResistPer",
    // xxx: "spellResistPer",
    // xxx: "weaponResistPer",

    83: "mpReduction",
    82: "apReduction",

    28: "mpResist",
    27: "apResist",

    49: "heal",
    50: "reflect",

    44: "initiative",
    40: "pods",
};
