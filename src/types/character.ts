import type { Item } from "../types/item"

export type Character = {
    amulet : Item
    ring1 : Item
    ring2 : Item
    hat : Item
    cloak : Item
    belt : Item
    boots : Item

    weapon : Item
    shield : Item

    pet : Item

    dofus1 : Item
    dofus2 : Item
    dofus3 : Item
    dofus4 : Item
    dofus5 : Item
    dofus6 : Item

    baseStats : Partial<Stats>
    stats : Stats
}

export type Stats = Record<StatKey, number>

export type StatKey = typeof STAT_KEYS[number]

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
    "pods"
] as const
