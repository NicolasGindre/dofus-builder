import { get } from "svelte/store";
import { automaticWeights, weights } from "../stores/builder";
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

let globalElementalPerDefense: number | undefined = undefined;
let globalElementalDefense: number | undefined = undefined;
let globalCacRangeDefense: number | undefined = undefined;

export function getDefaultWeight(statKey: StatKey) {
    return defaultWeights[statKey];
}
export function copyDefaultWeights(): Partial<Stats> {
    let newDefaultWeights: Partial<Stats> = {};
    for (const [key, value] of Object.entries(defaultWeights)) {
        newDefaultWeights[key as StatKey] = value;
    }
    return newDefaultWeights;
}

export function getAllWeightsTo0(): Partial<Stats> {
    let newWeights: Partial<Stats> = {};
    for (const statKey of STAT_KEYS) {
        newWeights[statKey] = 0;
    }
    return newWeights;
}

export function checkWeightUpdate(weightsIn: Partial<Stats>) {
    let weightsOut: Partial<Stats> = {};
    let isUpdated: boolean = false;

    for (const [key, weight] of Object.entries(weightsIn)) {
        const statKey = key as StatKey;
        if (weight && weight < 0.01) {
            weightsOut[statKey as StatKey] = 0.01;
            isUpdated = true;
        } else if (weight > 999) {
            weightsOut[statKey as StatKey] = 999;
            isUpdated = true;
        } else {
            weightsOut[statKey as StatKey] = weight;
        }
    }
    if (get(automaticWeights)) {
        for (const statKey of STAT_ELEMENTAL_PER_DEFENSE_KEYS) {
            if (weightsIn[statKey] != globalElementalPerDefense) {
                globalElementalPerDefense = weightsIn[statKey];
                updateWeights(
                    weightsOut,
                    STAT_ELEMENTAL_PER_DEFENSE_KEYS,
                    globalElementalPerDefense,
                );
                isUpdated = true;
                break;
            }
        }
        for (const statKey of STAT_ELEMENTAL_DEFENSE_KEYS) {
            if (weightsIn[statKey] != globalElementalDefense) {
                globalElementalDefense = weightsIn[statKey];
                updateWeights(weightsOut, STAT_ELEMENTAL_DEFENSE_KEYS, globalElementalDefense);
                isUpdated = true;
                break;
            }
        }
        for (const statKey of STAT_CACRANGE_DEFENSE_KEYS) {
            if (weightsIn[statKey] != globalCacRangeDefense) {
                globalCacRangeDefense = weightsIn[statKey];
                updateWeights(weightsOut, STAT_CACRANGE_DEFENSE_KEYS, globalCacRangeDefense);
                isUpdated = true;
                break;
            }
        }
        let statSum = 0;
        for (const statKey of STAT_STAT_KEYS) {
            statSum += weightsIn[statKey] ?? 0;
        }
        // VERY DANGEROUS !!!
        statSum = Math.round(statSum * 1000) / 1000;
        if (statSum > 999) {
            statSum = 999;
        }
        if (statSum != (weightsIn.power ?? 0)) {
            if (statSum == 0) {
                delete weightsOut.power;
            } else {
                weightsOut.power = statSum;
            }
            isUpdated = true;
        }

        statSum = 0;
        for (const statKey of STAT_DAMAGE_KEYS) {
            statSum += weightsIn[statKey] ?? 0;
        }
        statSum = Math.round(statSum * 1000) / 1000;
        if (statSum > 999) {
            statSum = 999;
        }
        if (statSum != (weightsIn.damage ?? 0)) {
            if (statSum == 0) {
                delete weightsOut.damage;
            } else {
                weightsOut.damage = statSum;
            }
            isUpdated = true;
        }
    }
    if (isUpdated) {
        weights.set(weightsOut);
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

    damage: 5,

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
