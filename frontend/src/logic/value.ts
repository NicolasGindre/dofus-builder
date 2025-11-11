import { getEmptyCategoriesItemsArr, type Item, type Items, type Panoply } from "../types/item";
import {
    categoryBestValue,
    itemsCategory,
    itemsCategoryBest,
    itemsCategoryWithPanoBest,
    panoplies,
    panopliesBest,
    panoplyDisplaySize,
    weights,
} from "../stores/builder";
import { get } from "svelte/store";
import { calculateAllItemsToDisplay, calculatePanopliesToDisplay } from "./display";
import { getPanoply } from "./frontendDB";
import { isItemMinRequirementOK, isPanoMinRequirementOK } from "./item";
import type { StatKey, Stats } from "../../../shared/types/stats";
import type { ItemCategory } from "../../../shared/types/item";

export type StatsValueFM = Record<StatKey, number>;

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

// export function calculateStatsValue(stats: Partial<Stats>): number {
//     let statsValue = 0;
//     const currWeights = get(weights);
//     for (const [stat, statValue] of Object.entries(stats)) {
//         const statValueWeight = statValue * (currWeights[stat as StatKey] ?? 0);
//         statsValue += statValueWeight;
//     }
//     return statsValue;
// }
export function calculateStatsValue(stats: Partial<Stats>, statsKeys?: readonly StatKey[]): number {
    let statsValue = 0;
    const currWeights = get(weights);
    for (const [key, value] of Object.entries(stats)) {
        if (statsKeys && !statsKeys.includes(key as StatKey)) {
            continue;
        }
        const statValueWeight = value * (currWeights[key as StatKey] ?? 0);
        statsValue += statValueWeight;
    }
    return statsValue;
}

export function calculateItemValue(item: Item) {
    if (isItemMinRequirementOK(item)) {
        item.value = calculateStatsValue(item.statsWithBonus);
        item.valueWithPano = item.value;
    } else {
        item.value = 0;
        item.valueWithPano = 0;
        return;
    }
    // if (item.panoply) {
    //     const pano = getPanoply(item.panoply);
    //     calculatePanoValue(pano);
    //     item.valueWithPano += pano.valuePerItem;
    // }
}

export function calculatePanoValue(panoply: Panoply) {
    panoply.value = [];
    // for (const comboStats of panoply.statsWithBonus) {
    for (let comboCount = 1; comboCount <= panoply.statsWithBonus.length; comboCount++) {
        if (isPanoMinRequirementOK(panoply, comboCount)) {
            panoply.value.push(calculateStatsValue(panoply.statsWithBonus[comboCount - 1]!));
        } else {
            panoply.value.push(0);
        }
    }
    calculateBestValuePerItem(panoply);
    for (const item of panoply.itemsReal) {
        item.valueWithPano += panoply.bestValuePerItem;
    }
    calculatePanoRelativeValue(panoply);
}

export function calculateBestValuePerItem(panoply: Panoply) {
    let bestValuePerItem = 0;
    for (let comboCount = 2; comboCount <= panoply.statsWithBonus.length; comboCount++) {
        const comboValue = panoply.value[comboCount - 1]!;
        const valuePerItem = comboValue / comboCount;

        if (valuePerItem > bestValuePerItem) {
            bestValuePerItem = valuePerItem;
        }
    }
    panoply.bestValuePerItem = bestValuePerItem;
}

export function calculatePanoRelativeValue(pano: Panoply) {
    const catBest = get(categoryBestValue);
    let bestPanoRelativeValue = -999999999999;

    const bestRelativePanoItemsSorted = pano.itemsReal
        .map((item) => item.value - catBest[item.category])
        .sort((a, b) => b - a);

    for (let comboCount = 2; comboCount <= pano.statsWithBonus.length; comboCount++) {
        const topXSum = bestRelativePanoItemsSorted.slice(0, comboCount).reduce((a, b) => a + b, 0);

        const panoRelativeValue = (pano.value[comboCount - 1]! + topXSum) / comboCount;

        if (panoRelativeValue > bestPanoRelativeValue) {
            bestPanoRelativeValue = panoRelativeValue;
        }
    }
    pano.bestRelativeValue = bestPanoRelativeValue;
}

export function calculateBestItems() {
    let bestItemsCategories = getEmptyCategoriesItemsArr();
    // let bestItemsWithPanoCategories = getEmptyCategoriesItemsArr();
    for (const [category, items] of Object.entries(get(itemsCategory))) {
        let bestValueFound = 0;
        // let bestValueWithPanoFound = 0;

        let bestItems: Item[] = [];
        bestItemsCategories[category as ItemCategory] = bestItems;

        for (const item of items) {
            calculateItemValue(item);
            if (item.value > bestValueFound) {
                bestValueFound = item.value;
            }

            // if (item.valueWithPano > bestValueWithPanoFound) {
            //     bestValueWithPanoFound = item.valueWithPano;
            // }
            bestItems.push(item);
        }
        categoryBestValue.update((old) => {
            return {
                ...old,
                [category]: bestValueFound,
            };
        });
        // console.log(bestValueFound);
        // console.log(bestValueWithPanoFound);

        bestItems.sort((a, b) => b.value - a.value);
        // bestItemsWithPano.sort((a, b) => b.valueWithPano - a.valueWithPano);
    }
    itemsCategoryBest.set(bestItemsCategories);
    // calculateAllItemsToDisplay();

    console.log("itemsCategoryBest", bestItemsCategories);
    const allPanos = get(panoplies);
    let bestPanos: Panoply[] = Object.values(allPanos);
    for (const pano of bestPanos) {
        calculatePanoValue(pano);
    }
    bestPanos.sort((a, b) => b.bestRelativeValue - a.bestRelativeValue);
    panopliesBest.set(bestPanos);

    let bestItemsWithPanoCategories = getEmptyCategoriesItemsArr();
    for (const [category, items] of Object.entries(get(itemsCategory))) {
        bestItemsWithPanoCategories[category as ItemCategory] = [...items].sort(
            (a, b) => b.valueWithPano - a.valueWithPano,
        );
    }
    itemsCategoryWithPanoBest.set(bestItemsWithPanoCategories);

    calculateAllItemsToDisplay();
    calculatePanopliesToDisplay();
}
