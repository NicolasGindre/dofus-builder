import type { StatKey } from "../types/character";
import * as itemDB from "../db/item"
import type { Item, Panoply } from "../types/item";

export type StatsValueFM = Record<StatKey, number>

export type StatsValueWeight = Record<StatKey, number>


export function calculateItemValue(item: Item): number {

    let itemValue = 0

    for (const [stat, value] of Object.entries(item.stats)) {
        itemValue += value *
            statsValueFM[stat as StatKey] * statsValueWeight[stat as StatKey]
    }
    if (item.panoply != undefined) {
        
        const panoply = itemDB.panoplies[item.panoply]!
        const panoItemsAmount = panoply.stats.length + 1
        const panoplyStats = panoply.stats.at(-1)!

        for (const [stat, value] of Object.entries(panoplyStats)) {
            itemValue += value * 
                (statsValueFM[stat as StatKey] * statsValueWeight[stat as StatKey]) / panoItemsAmount
        }
    }
    return itemValue
}

// export function calculatePanoplyValue(pano: Panoply): number {
//     return 0
// }

let statsValueWeight: StatsValueWeight = {
    health: 1,

    wisdom: 0.3,
    prospecting: 0.7,

    strength: 1,
    agility: 1,
    chance: 1,
    intelligence: 0.2,

    power: 1,

    neutralResistPer: 3,
    airResistPer: 3,
    earthResistPer: 3,
    fireResistPer: 3,
    waterResistPer: 3,

    criticalResist: 0.5,
    pushbackResist: 0.7,

    neutralResist: 0.3,
    earthResist: 0.3,
    waterResist: 0.3,
    airResist: 0.3,
    fireResist: 0.3,

    pods: 0,
    initiative: 0.5,

    trapPower: 0,
    trapDamage: 0,
    pushbackDamage: 0.1,

    neutralDamage: 0.1,
    earthDamage: 0.7,
    airDamage: 0.7,
    fireDamage: 0,
    waterDamage: 0.7,

    criticalDamage: 0.7,
    criticalChance: 0.7,

    lock: 1,
    dodge: 0,

    mpReduction: 0,
    apReduction: 0,
    apResist: 0.65,
    mpResist: 0.65,

    heal: 0,
    reflect: 0,

    damage: 0.7,

    spellDamagePer: 1,
    rangedDamagePer: 0.5,
    weaponDamagePer: 0.5,
    meleeDamagePer: 1,
    finalDamagePer: 0,

    meleeResistPer: 1,
    rangedResistPer: 1,

    summon: 0,
    range: 0,
    MP: 0.7,
    AP: 0.7,
}

const statsValueFM: StatsValueFM = {
    initiative: 0.1,
    health: 0.2,
    pods: 0.25,

    strength: 1,
    agility: 1,
    chance: 1,
    intelligence: 1,

    criticalResist: 2,
    pushbackResist: 2,
    power: 2,
    trapPower: 2,

    earthResist: 2,
    airResist: 2,
    waterResist: 2,
    fireResist: 2,
    neutralResist: 2,

    wisdom: 3,
    prospecting: 3,

    lock: 4,
    dodge: 4,

    neutralDamage: 5,
    earthDamage: 5,
    airDamage: 5,
    fireDamage: 5,
    waterDamage: 5,

    criticalDamage: 5,
    pushbackDamage: 5,
    trapDamage: 5,

    neutralResistPer: 6,
    airResistPer: 6,
    earthResistPer: 6,
    fireResistPer: 6,
    waterResistPer: 6,

    mpReduction: 7,
    apReduction: 7,
    apResist: 7,
    mpResist: 7,

    heal: 10,

    criticalChance: 10,
    reflect: 10,

    spellDamagePer: 15,
    rangedDamagePer: 15,
    weaponDamagePer: 15,
    meleeDamagePer: 15,
    finalDamagePer: 0, // Cannot be fmed

    meleeResistPer: 15,
    rangedResistPer: 15,

    damage: 20,

    summon: 30,
    range: 50,
    MP: 80,
    AP: 100,
}
