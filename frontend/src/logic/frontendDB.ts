import { get } from "svelte/store";
import { items, itemsCategory, panoplies } from "../stores/builder";
import {
    getEmptyCategoriesItemsArr,
    type ItemCategory,
    type Items,
    type Panoplies,
    type Panoply,
} from "../types/item";
import { getBonusStats } from "../types/stats";

export async function initFrontendDB() {
    const itemResp = await fetch("/api/items");
    if (!itemResp.ok) throw new Error("Failed to load items");
    // get(items);
    items.set((await itemResp.json()) as Items);

    const panopliesResp = await fetch("/api/panoplies");
    if (!panopliesResp.ok) throw new Error("Failed to load panoplies");
    // get(panoplies);
    panoplies.set((await panopliesResp.json()) as Panoplies);
    console.log("get(panoplies)");
    console.log(get(panoplies));

    calculateItemsBonus();
    calculatePanopliesBonus();
    fillItemsCategories();
}

function calculateItemsBonus() {
    for (const item of Object.values(get(items))) {
        item.statsWithBonus = getBonusStats(item.stats);
    }
}

function calculatePanopliesBonus() {
    for (const pano of Object.values(get(panoplies))) {
        pano.statsWithBonus = [];
        for (const stats of pano.stats) {
            pano.statsWithBonus.push(getBonusStats(stats));
        }
    }
}

function fillItemsCategories() {
    // get(itemsCategory);

    const grouped = getEmptyCategoriesItemsArr();

    for (const item of Object.values(get(items))) {
        grouped[item.category].push(item);
    }
    console.log("init categories");
    console.log(grouped);
    itemsCategory.set(grouped);
}

export function getPanopliesToCalculate(itemsCategory: Record<ItemCategory, Items>): Panoply[] {
    const panoplies: Panoply[] = [];
    for (const minItemsCategory of Object.values(itemsCategory)) {
        for (const item of Object.values(minItemsCategory)) {
            if (item.panoply) {
                const panoply = getPanoply(item.panoply);
                panoplies.push(panoply);
            }
        }
    }
    return panoplies;
}

export function getPanoply(name: string): Panoply {
    return get(panoplies)[name]!;
}
