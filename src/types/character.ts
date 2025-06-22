import type { Item } from "../types/item"

export type Character = {
    amulet : ItemSlot
    ring1 : ItemSlot
    ring2 : ItemSlot
    hat : ItemSlot
    cloak : ItemSlot
    belt : ItemSlot
    boots : ItemSlot

    weapon : ItemSlot
    shield : ItemSlot

    pet : ItemSlot

    dofus1 : ItemSlot
    dofus2 : ItemSlot
    dofus3 : ItemSlot
    dofus4 : ItemSlot
    dofus5 : ItemSlot
    dofus6 : ItemSlot

    baseStats : Partial<Stats>
    stats : Stats
}
export type ItemSlot = Item | undefined

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
