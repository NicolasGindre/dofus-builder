import type { StatKey, Stats } from "../types/character";
import * as itemDB from "../db/itemDB";
import type { Item, Panoply } from "../types/item";

export type StatsValueFM = Record<StatKey, number>;

export type StatsValueWeight = Record<StatKey, number>;

export function calculateCharStatsValue(
    stats: Stats,
    minStats: Partial<Stats>,
    maxStats: Partial<Stats>,
): number {
    for (const [stat, minStatValue] of Object.entries(minStats)) {
        const key = stat as keyof Stats;
        if (stats[key] < minStatValue) {
            return 0;
        }
    }
    for (const [stat, maxStatValue] of Object.entries(maxStats)) {
        const key = stat as keyof Stats;
        if (stats[key] > maxStatValue) {
            stats[key] = maxStatValue;
        }
    }
    const value = calculateStatsValue(stats);
    return value;
}

export function calculateStatsValue(stats: Partial<Stats>): number {
    let statsValue = 0;
    for (const [stat, statValue] of Object.entries(stats)) {
        const statValueWeight = statValue * statsValueWeight[stat as StatKey];
        statsValue += statValueWeight;
    }
    return statsValue;
}
export function calculateItemValue(item: Item): number {
    return calculateStatsValue(item.stats);
}

export function calculateItemWithPanoValue(item: Item): number {
    let itemValue = 0;

    itemValue += calculateStatsValue(item.stats);

    if (item.panoply != undefined) {
        const panoply = itemDB.panoplies[item.panoply]!;
        const panoItemsAmount = panoply.stats.length + 1;
        const panoplyStats = panoply.stats.at(-1)!;

        for (const [stat, value] of Object.entries(panoplyStats)) {
            itemValue += (value * statsValueWeight[stat as StatKey]) / panoItemsAmount;
        }
    }
    // console.log(itemValue)
    return itemValue;
}

export function calculatePanoplyValue(pano: Panoply): number {
    let panoValue = 0;
    for (const itemName of pano.items) {
        const item = itemDB.getItem(itemName)!;
        panoValue += calculateStatsValue(item.stats);
    }
    const panoItemsAmount = pano.stats.length + 1;
    const panoplyStats = pano.stats.at(-1)!;

    for (const [stat, value] of Object.entries(panoplyStats)) {
        panoValue += value * statsValueWeight[stat as StatKey];
    }
    panoValue = panoValue / panoItemsAmount;
    return panoValue;
}

// let statsValueWeight: StatsValueWeight = {
//     health: 0.8,

//     wisdom: 0,
//     prospecting: 0,

//     strength: 2,
//     agility: 0,
//     chance: 0,
//     intelligence: 0,

//     neutralDamage: 0.5,
//     earthDamage: 1.5,
//     airDamage: 0,
//     fireDamage: 0,
//     waterDamage: 0,

//     power: 1,

//     neutralResistPer: 0,
//     airResistPer: 0,
//     earthResistPer: 0,
//     fireResistPer: 0,
//     waterResistPer: 0,

//     criticalResist: 0,
//     pushbackResist: 0,

//     neutralResist: 0,
//     earthResist: 0,
//     waterResist: 0,
//     airResist: 0,
//     fireResist: 0,

//     pods: 0,
//     initiative: 0,

//     trapPower: 0,
//     trapDamage: 0,
//     pushbackDamage: 0,

//     criticalDamage: 0.3,
//     criticalChance: 0.9,

//     lock: 0,
//     dodge: 0,

//     mpReduction: 0,
//     apReduction: 0,
//     apResist: 0.05,
//     mpResist: 0.05,

//     heal: 0,
//     reflect: 0,

//     damage: 0.5,

//     spellDamagePer: 1,
//     rangedDamagePer: 1,
//     weaponDamagePer: 1,
//     meleeDamagePer: 1,
//     finalDamagePer: 1,

//     meleeResistPer: 1,
//     rangedResistPer: 1,

//     summon: 0,
//     range: 0,
//     mp: 1.4,
//     ap: 1.8,
// }

// Sacri
// let statsValueWeight: StatsValueWeight = {
//     health: 0,

//     summon: 0,
//     range: 0,
//     ap: 1.25,
//     mp: 1,

//     strength: 1,
//     agility: 1,
//     chance: 1,
//     intelligence: 1,

//     power: 4,

//     neutralDamage: 0,
//     earthDamage: 2,
//     airDamage: 2,
//     fireDamage: 2,
//     waterDamage: 2,

//     damage: 8,

//     criticalDamage: 7.5,
//     criticalChance: 18,

//     spellDamagePer: 15,
//     weaponDamagePer: 15,
//     rangedDamagePer: 15,
//     meleeDamagePer: 15,
//     finalDamagePer: 30,

//     neutralResistPer: 15,
//     airResistPer: 15,
//     earthResistPer: 15,
//     fireResistPer: 15,
//     waterResistPer: 15,

//     meleeResistPer: 30,
//     rangedResistPer: 30,

//     criticalResist: 0.1,
//     pushbackResist: 0.4,

//     neutralResist: 0,
//     earthResist: 0,
//     waterResist: 0,
//     airResist: 0,
//     fireResist: 0,

//     pods: 0,
//     initiative: 0,

//     trapPower: 0,
//     trapDamage: 0,
//     pushbackDamage: 0,

//     lock: 4,
//     dodge: 0,

//     mpReduction: 0,
//     apReduction: 0,
//     apResist: 5,
//     mpResist: 5,

//     heal: 0,
//     reflect: 0,

//     wisdom: 0,
//     prospecting: 0,
// };

// // Zobal
let statsValueWeight: StatsValueWeight = {
    summon: 0,
    range: 50,
    mp: 0,
    ap: 290,

    health: 0,

    wisdom: 0,
    prospecting: 0,

    strength: 0.6,
    agility: 0.6,
    chance: 0.5,
    intelligence: 0.1,

    power: 2,

    neutralDamage: 0,
    earthDamage: 1.4,
    airDamage: 1.65,
    fireDamage: 0.8,
    waterDamage: 1.65,

    damage: 5.5,

    pushbackDamage: 2,

    criticalDamage: 0.7,
    criticalChance: 3,

    neutralResistPer: 21,
    airResistPer: 21,
    earthResistPer: 21,
    fireResistPer: 21,
    waterResistPer: 21,

    criticalResist: 1,
    pushbackResist: 1.5,

    neutralResist: 0,
    earthResist: 0,
    waterResist: 0,
    airResist: 0,
    fireResist: 0,

    pods: 0,
    initiative: 0.03,

    trapPower: 0,
    trapDamage: 0,

    lock: 1.4,
    dodge: 1.4,

    mpReduction: 10,
    apReduction: 0,
    apResist: 2.2,
    mpResist: 2.2,

    heal: 0,
    reflect: 0,

    spellDamagePer: 10,
    rangedDamagePer: 10,
    weaponDamagePer: 10,
    meleeDamagePer: 10,
    finalDamagePer: 10,

    meleeResistPer: 1,
    rangedResistPer: 1,
};

// const statsValueFM: StatsValueFM = {
//     initiative: 0.1,
//     health: 0.2,
//     pods: 0.25,

//     strength: 1,
//     agility: 1,
//     chance: 1,
//     intelligence: 1,

//     criticalResist: 2,
//     pushbackResist: 2,
//     power: 2,
//     trapPower: 2,

//     earthResist: 2,
//     airResist: 2,
//     waterResist: 2,
//     fireResist: 2,
//     neutralResist: 2,

//     wisdom: 3,
//     prospecting: 3,

//     lock: 4,
//     dodge: 4,

//     neutralDamage: 5,
//     earthDamage: 5,
//     airDamage: 5,
//     fireDamage: 5,
//     waterDamage: 5,

//     criticalDamage: 5,
//     pushbackDamage: 5,
//     trapDamage: 5,

//     neutralResistPer: 6,
//     airResistPer: 6,
//     earthResistPer: 6,
//     fireResistPer: 6,
//     waterResistPer: 6,

//     mpReduction: 7,
//     apReduction: 7,
//     apResist: 7,
//     mpResist: 7,

//     heal: 10,

//     criticalChance: 10,
//     reflect: 10,

//     spellDamagePer: 15,
//     rangedDamagePer: 15,
//     weaponDamagePer: 15,
//     meleeDamagePer: 15,
//     finalDamagePer: 0, // Cannot be fmed

//     meleeResistPer: 15,
//     rangedResistPer: 15,

//     damage: 20,

//     summon: 30,
//     range: 50,
//     mp: 80,
//     ap: 100,
// }
