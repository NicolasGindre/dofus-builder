import type { StatKey, Stats } from "../types/stats";
import {
    getEmptyCategoriesItemsArr,
    type Item,
    type ItemCategory,
    type Items,
    type Panoply,
} from "../types/item";
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

export function calculateStatsValue(stats: Partial<Stats>): number {
    let statsValue = 0;
    const currWeights = get(weights);
    for (const [stat, statValue] of Object.entries(stats)) {
        const statValueWeight = statValue * (currWeights[stat as StatKey] ?? 0);
        statsValue += statValueWeight;
    }
    return statsValue;
}

export function calculateItemValue(item: Item) {
    item.value = calculateStatsValue(item.statsWithBonus);
    item.valueWithPano = item.value;
    if (item.panoply) {
        const pano = getPanoply(item.panoply);
        calculatePanoValue(pano);
        item.valueWithPano += pano.valuePerItem;
    }
}

export function calculatePanoValue(panoply: Panoply) {
    const panoMaxItems = panoply.statsWithBonus.length;
    const panoplyStats = panoply.statsWithBonus.at(panoMaxItems - 1)!;

    panoply.valuePerItem = calculateStatsValue(panoplyStats) / panoMaxItems;

    panoply.value = [];
    for (const comboStats of panoply.statsWithBonus) {
        panoply.value.push(calculateStatsValue(comboStats));
    }
}

export function calculatePanoAvgRelativeValue(pano: Panoply) {
    let panoAvgRelativeValue = 0;

    const catBest = get(categoryBestValue);
    for (const item of pano.itemsReal) {
        // const item = get(items)[itemName]!;
        panoAvgRelativeValue += item.valueWithPano - catBest[item.category];
    }
    const panoItemsAmount = pano.statsWithBonus.length + 1;
    // const panoplyStats = pano.statsWithBonus.at(-1)!;
    // panoValue += calculateStatsValue(panoplyStats) / panoItemsAmount;
    pano.avgRelativeValue = panoAvgRelativeValue / panoItemsAmount;
}

export function calculateBestItems() {
    let bestItemsCategories = getEmptyCategoriesItemsArr();
    let bestItemsWithPanoCategories = getEmptyCategoriesItemsArr();
    for (const [category, items] of Object.entries(get(itemsCategory))) {
        let bestValueFound = 0;
        let bestValueWithPanoFound = 0;

        let bestItems: Item[] = [];
        bestItemsCategories[category as ItemCategory] = bestItems;

        let bestItemsWithPano: Item[] = [];
        bestItemsWithPanoCategories[category as ItemCategory] = bestItemsWithPano;

        for (const item of items) {
            // if (item.level > get(level)) {
            //     continue;
            // }
            calculateItemValue(item);
            if (item.value > bestValueFound) {
                bestValueFound = item.value;
            }

            if (item.valueWithPano > bestValueWithPanoFound) {
                bestValueWithPanoFound = item.valueWithPano;
            }
            bestItems.push(item);
            bestItemsWithPano.push(item);
        }
        categoryBestValue.update((old) => {
            return {
                ...old,
                [category]: bestValueWithPanoFound,
            };
        });
        // console.log(bestValueFound);
        // console.log(bestValueWithPanoFound);

        bestItems.sort((a, b) => b.value - a.value);
        bestItemsWithPano.sort((a, b) => b.valueWithPano - a.valueWithPano);
    }
    itemsCategoryBest.set(bestItemsCategories);
    itemsCategoryWithPanoBest.set(bestItemsWithPanoCategories);
    calculateAllItemsToDisplay();

    console.log("itemsCategoryBest", bestItemsCategories);
    const allPanos = get(panoplies);
    let bestPanos: Panoply[] = Object.values(allPanos);
    for (const pano of bestPanos) {
        calculatePanoAvgRelativeValue(pano);
    }
    bestPanos.sort((a, b) => b.avgRelativeValue - a.avgRelativeValue);
    panopliesBest.set(bestPanos);

    calculatePanopliesToDisplay();
}

// export async function calculateBestPanoplies(): Promise<void> {
//     let bestPanoplies: Panoply[] = [];
//     let bestValueFound: number = 0;
//     for (const panoply of Object.values(get(panoplies))) {
//         calculatePanoplyValue(panoply);

//         if (panoply.value > bestValueFound) {
//             bestValueFound = panoply.value;
//         }
//     }
//     // for (const panoply of Object.values(get(panoplies))) {
//     //     if (panoply.value * get(distanceFromBestRatio) >= bestValueFound) {
//     //         bestPanoplies.push(panoply);
//     //     }
//     // }
//     bestPanoplies.sort((a, b) => b.value - a.value).slice(0, get(panoplyDisplaySize));
// }
