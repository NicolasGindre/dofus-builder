import { panoplies } from "../db/itemDB"
import type { Item, ItemCategory } from "../types/item"

export type Character = {

    build : Build

    baseStats : Partial<Stats>
    stats : Stats
}

export type Build = Partial<Record<BuildSlots, Item>>

export const BUILD_SLOTS = [
    "amulet", "ring1", "ring2", "hat", "cloak", "belt", "boots", "weapon", "shield", "pet",
    // "dofus1", "dofus2", "dofus3", "dofus4", "dofus5", "dofus6"
] as const

export type BuildSlots = typeof BUILD_SLOTS[number]

export const SLOT_TO_CATEGORY: Record<BuildSlots, ItemCategory> = {
    amulet: "amulet",
    ring1: "ring",
    ring2: "ring",
    hat: "hat",
    cloak: "cloak",
    belt: "belt",
    boots: "boots",
    weapon: "weapon",
    shield: "shield",
    pet: "pet",
    // dofus1: "dofus",
    // dofus2: "dofus",
    // dofus3: "dofus",
    // dofus4: "dofus",
    // dofus5: "dofus",
    // dofus6: "dofus"
}

function addToStats(stats: Stats, statsToAdd: Partial<Stats>) {
    for (const [stat, value] of Object.entries(statsToAdd) as [StatKey, number][]) {
        stats[stat] += value
    }
}

export function calculateStats(baseStats: Partial<Stats>, build: Build): Stats {
    let stats: Stats = Object.fromEntries(
        STAT_KEYS.map(key => [key, 0])
    ) as Stats

    addToStats(stats, baseStats)
    
    let panopliesRecord: Record<string, number> = {}
    for (const slot of BUILD_SLOTS) {
        const item = build[slot]
        if (!item) continue

        addToStats(stats, item.stats)

        if (item.panoply != undefined) {
            panopliesRecord[item.panoply] = (panopliesRecord[item.panoply] ?? -1) + 1
        }
    }
    // console.log(panopliesRecord)

    for (const [panoplyName, itemsAmount] of Object.entries(panopliesRecord)) {
        const panoStats = panoplies[panoplyName]?.stats[itemsAmount]
        // console.log(panoplyName, panoStats)
        if (panoStats) {
            addToStats(stats, panoStats)
        }
    }

    if (stats.AP > 12) stats.AP = 12
    if (stats.MP > 5) stats.MP = 5
    if (stats.neutralResistPer > 50) stats.neutralResistPer = 46
    if (stats.airResistPer > 50) stats.airResistPer = 46
    if (stats.fireResistPer > 50) stats.fireResistPer = 46
    if (stats.waterResistPer > 50) stats.waterResistPer = 46
    if (stats.earthResistPer > 50) stats.earthResistPer = 46

    stats.pods += Math.floor(stats.strength * 5)
    stats.prospecting += Math.floor(stats.chance / 10)
    stats.lock += Math.floor(stats.agility / 10)
    stats.dodge += Math.floor(stats.agility / 10)
    stats.apResist += Math.floor(stats.wisdom / 10)
    stats.mpResist += Math.floor(stats.wisdom / 10)
    stats.apReduction += Math.floor(stats.wisdom / 10)
    stats.mpReduction += Math.floor(stats.wisdom / 10)
    return stats
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
