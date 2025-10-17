import { get } from "svelte/store";
import { automaticWeights, weights, weightsIndex } from "../stores/builder";
import {
    STAT_CACRANGE_DEFENSE_KEYS,
    STAT_DAMAGE_KEYS,
    STAT_ELEMENTAL_DEFENSE_KEYS,
    STAT_ELEMENTAL_PER_DEFENSE_KEYS,
    STAT_KEYS,
    STAT_STAT_KEYS,
    type StatKey,
    type Stats,
} from "./stats";
import {
    findClosestMinMaxIndex,
    findClosestMinMaxValue,
    findClosestWeightIndex,
    findClosestWeightValue,
    getMinMaxFromIndex,
    getWeightFromIndex,
} from "../logic/encoding/valueEncoding";

let globalElementalPerDefense: number | undefined = undefined;
let globalElementalDefense: number | undefined = undefined;
let globalCacRangeDefense: number | undefined = undefined;

export function getDefaultWeightIndex(statKey: StatKey) {
    return defaultWeightsIndex[statKey];
}
export function copyDefaultWeightsIndex(): Partial<Stats> {
    let newDefaultWeightsIndex: Partial<Stats> = {};
    for (const [key, value] of Object.entries(defaultWeightsIndex)) {
        newDefaultWeightsIndex[key as StatKey] = value;
    }
    return newDefaultWeightsIndex;
}

export function getAllWeightsTo0(): Partial<Stats> {
    let newWeights: Partial<Stats> = {};
    for (const statKey of STAT_KEYS) {
        newWeights[statKey] = 0;
    }
    return newWeights;
}

export function checkWeightUpdate(weightsIn: Partial<Stats>) {
    // let weightsIn: Partial<Stats> = {};

    if (get(automaticWeights)) {
        for (const statKey of STAT_ELEMENTAL_PER_DEFENSE_KEYS) {
            if (weightsIn[statKey] != globalElementalPerDefense) {
                globalElementalPerDefense = weightsIn[statKey];
                updateWeights(
                    weightsIn,
                    STAT_ELEMENTAL_PER_DEFENSE_KEYS,
                    globalElementalPerDefense,
                );
                break;
            }
        }
        for (const statKey of STAT_ELEMENTAL_DEFENSE_KEYS) {
            if (weightsIn[statKey] != globalElementalDefense) {
                globalElementalDefense = weightsIn[statKey];
                updateWeights(weightsIn, STAT_ELEMENTAL_DEFENSE_KEYS, globalElementalDefense);
                break;
            }
        }
        for (const statKey of STAT_CACRANGE_DEFENSE_KEYS) {
            if (weightsIn[statKey] != globalCacRangeDefense) {
                globalCacRangeDefense = weightsIn[statKey];
                updateWeights(weightsIn, STAT_CACRANGE_DEFENSE_KEYS, globalCacRangeDefense);
                break;
            }
        }
        // console.log("weightsOut", weightsIn);
        // const displayedWeights = get(weights);
        let statSum = 0;
        for (const statKey of STAT_STAT_KEYS) {
            // const w = getWeightFromIndex(weightsIn[statKey]);
            statSum += getWeightFromIndex(statKey, weightsIn[statKey]);
            // console.log("statKey", statKey);
            // console.log(statKey, weightsIn[statKey], w);
        }
        // console.log("statSum", statSum);
        const powerSumIndex = findClosestWeightIndex("power", statSum);
        // console.log("powerSumIndex", powerSumIndex);
        statSum = getWeightFromIndex("power", powerSumIndex);
        // console.log("statSum", statSum);
        if (statSum != getWeightFromIndex("power", weightsIn["power"])) {
            if (statSum == 0) {
                delete weightsIn.power;
            } else {
                weightsIn.power = powerSumIndex;
            }
        }

        statSum = 0;
        for (const statKey of STAT_DAMAGE_KEYS) {
            statSum += getWeightFromIndex(statKey, weightsIn[statKey]);
        }
        const damageSumIndex = findClosestWeightIndex("damage", statSum);
        statSum = getWeightFromIndex("damage", damageSumIndex);
        if (statSum != getWeightFromIndex("damage", weightsIn["damage"])) {
            if (statSum == 0) {
                delete weightsIn.damage;
            } else {
                weightsIn.damage = damageSumIndex;
            }
        }
    }
}
function updateWeights(
    weights: Partial<Stats>,
    statKeys: readonly string[],
    value: number | undefined,
) {
    for (const statKey of statKeys) {
        if (value) {
            weights[statKey as StatKey] = value;
        } else {
            delete weights[statKey as StatKey];
        }
    }
}
// function checkDefenseUpdate(statKey: StatKey, defenseStatKeys: readonly string[]) {
//     let newValue: number;
//     for (const key of defenseStatKeys) {
//     }
// }

const defaultWeights: Stats = {
    ap: 150,
    mp: 130,
    range: 50,
    summon: 40,

    health: 0.4,

    wisdom: 2,
    prospecting: 2,

    strength: 1,
    agility: 1,
    chance: 1,
    intelligence: 1,

    power: 2,

    neutralDamage: 2.5,
    earthDamage: 2.5,
    airDamage: 2.5,
    fireDamage: 2.5,
    waterDamage: 2.5,

    damage: 6,

    pushbackDamage: 2.5,

    criticalDamage: 5,
    criticalChance: 10,

    neutralResistPer: 6,
    airResistPer: 6,
    earthResistPer: 6,
    fireResistPer: 6,
    waterResistPer: 6,

    meleeResistPer: 15,
    rangedResistPer: 15,

    criticalResist: 2,
    pushbackResist: 2,

    neutralResist: 2,
    earthResist: 2,
    waterResist: 2,
    airResist: 2,
    fireResist: 2,

    pods: 0.1,
    initiative: 0.03,

    trapPower: 1,
    trapDamage: 2.5,

    lock: 3,
    dodge: 3,

    mpReduction: 4,
    apReduction: 4,
    apResist: 2.5,
    mpResist: 2.5,

    heal: 4,
    reflect: 2,

    spellDamagePer: 15,
    rangedDamagePer: 15,
    meleeDamagePer: 15,
    weaponDamagePer: 15,
};

export const defaultWeightsIndex: Stats = Object.fromEntries(
    Object.entries(defaultWeights).map(([statKey, weight]) => [
        statKey,
        findClosestWeightIndex(statKey as StatKey, weight),
    ]),
) as Stats;

export const defaultMinIndex: Partial<Stats> = {};

const defaultMax: Partial<Stats> = {
    ap: 12,
    mp: 6,
    range: 6,
    summon: 6,
    criticalChance: 95,
    neutralResistPer: 50,
    earthResistPer: 50,
    fireResistPer: 50,
    airResistPer: 50,
    waterResistPer: 50,
    rangedResistPer: 50,
    meleeResistPer: 50,
};

export const defaultMaxIndex: Partial<Stats> = Object.fromEntries(
    Object.entries(defaultMax).map(([key, value]) => [
        key,
        findClosestMinMaxIndex(key as StatKey, value),
    ]),
) as Partial<Stats>;
