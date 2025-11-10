import { panoplies } from "../db/itemDB";
import type { Item, ItemCategory } from "../types/item";

export type Stats = Record<StatKey, number>;

export type StatKey = (typeof STAT_KEYS)[number];

export const STAT_KEYS = [
    "ap",
    "mp",
    "range",
    "summon",

    "vitality",

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
