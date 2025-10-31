import type { StatKey, Stats } from "../types/character";
import * as itemDB from "../db/itemDB";
import type { Item, Panoply } from "../types/item";

export type StatsValueFM = Record<StatKey, number>;

export type StatsValueWeight = Record<StatKey, number>;

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

//     meleeResistPer: 15,
//     rangedResistPer: 15,

//     damage: 20,

//     summon: 30,
//     range: 50,
//     mp: 80,
//     ap: 100,
// }
