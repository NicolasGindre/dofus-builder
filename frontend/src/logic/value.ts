import type { StatKey, Stats } from "../types/stats";
import {
    getEmptyCategoriesItemsArr,
    type Item,
    type ItemCategory,
    type Items,
    type Panoply,
} from "../types/item";
import {
    distanceFromBestRatio,
    items,
    itemsCategory,
    itemsCategoryBest,
    itemsCategoryWithPanoBest,
    maxBestResults,
    panoplies,
    weights,
} from "../stores/builder";
import { get } from "svelte/store";

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
    const currWeights = get(weights);
    for (const [stat, statValue] of Object.entries(stats)) {
        const statValueWeight = statValue * (currWeights[stat as StatKey] ?? 0);
        statsValue += statValueWeight;
    }
    return statsValue;
}
export function calculateItemValue(item: Item) {
    item.value = calculateStatsValue(item.statsWithBonus);
    calculateItemWithPanoValue(item);
}

export function calculateItemWithPanoValue(item: Item) {
    let panoValue = 0;
    const currPano = get(panoplies);

    if (item.panoply != undefined) {
        const panoply = currPano[item.panoply]!;
        const panoItemsAmount = panoply.statsWithBonus.length + 1;
        const panoplyStats = panoply.statsWithBonus.at(-1)!;

        panoValue = calculateStatsValue(panoplyStats) / panoItemsAmount;
        // for (const [stat, value] of Object.entries(panoplyStats)) {
        //     panoValue += (value * (currWeights[stat as StatKey] ?? 0)) / panoItemsAmount;
        // }
    }
    item.valueWithPano = item.value + panoValue;
}

export function calculatePanoplyValue(pano: Panoply) {
    let panoValue = 0;

    for (const itemName of pano.items) {
        const item = get(items)[itemName]!;
        panoValue += item.value;
    }
    const panoItemsAmount = pano.statsWithBonus.length + 1;
    const panoplyStats = pano.statsWithBonus.at(-1)!;
    panoValue += calculateStatsValue(panoplyStats) / panoItemsAmount;
    pano.value = panoValue;
}

export function calculateBestItems() {
    console.log("Calculate best items");
    console.log(get(weights));
    console.log(get(items));
    console.log(get(itemsCategory));
    let bestItemsCategories = getEmptyCategoriesItemsArr();
    let bestItemsWithPanoCategories = getEmptyCategoriesItemsArr();
    for (const [category, items] of Object.entries(get(itemsCategory))) {
        let bestValueFound = 0;
        let bestValueWithPanoFound = 0;

        for (const item of items) {
            calculateItemValue(item);
            if (item.value > bestValueFound) {
                bestValueFound = item.value;
            }

            if (item.valueWithPano > bestValueWithPanoFound) {
                bestValueWithPanoFound = item.valueWithPano;
            }
        }
        // console.log(bestValueFound);
        // console.log(bestValueWithPanoFound);

        let bestItems: Item[] = [];
        bestItemsCategories[category as ItemCategory] = bestItems;

        let bestItemsWithPano: Item[] = [];
        bestItemsWithPanoCategories[category as ItemCategory] = bestItemsWithPano;
        for (const item of items) {
            if (item.value * get(distanceFromBestRatio) >= bestValueFound) {
                bestItems.push(item);
            }
            if (item.valueWithPano * get(distanceFromBestRatio) >= bestValueWithPanoFound) {
                bestItemsWithPano.push(item);
            }
        }
        // console.log(bestItemsCategories);

        bestItems.sort((a, b) => b.value - a.value).splice(get(maxBestResults));
        bestItemsWithPano.sort((a, b) => b.value - a.value).splice(get(maxBestResults));
    }
    console.log("maxBestResults ", get(maxBestResults));
    itemsCategoryBest.set(bestItemsCategories);
    itemsCategoryWithPanoBest.set(bestItemsWithPanoCategories);
}

export async function calculateBestPanoplies(): Promise<void> {
    let bestPanoplies: Panoply[] = [];
    let bestValueFound: number = 0;
    for (const panoply of Object.values(get(panoplies))) {
        calculatePanoplyValue(panoply);

        if (panoply.value > bestValueFound) {
            bestValueFound = panoply.value;
        }
    }
    for (const panoply of Object.values(get(panoplies))) {
        if (panoply.value * get(distanceFromBestRatio) >= bestValueFound) {
            bestPanoplies.push(panoply);
        }
    }
    bestPanoplies.sort((a, b) => b.value - a.value).slice(0, get(maxBestResults));
}
