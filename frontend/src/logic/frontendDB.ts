import { get } from "svelte/store";
import { items, itemsCategory, panoplies } from "../stores/builder";
import {
    getEmptyCategoriesItemsArr,
    type Item,
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
    addPanopliesItemsReal();
    calculatePanopliesBonus();
    fillItemsCategories();
}

function calculateItemsBonus() {
    for (const item of Object.values(get(items))) {
        // console.log(item.name);
        item.statsWithBonus = getBonusStats(item.stats);
    }
}

function addPanopliesItemsReal() {
    for (const pano of Object.values(get(panoplies))) {
        pano.itemsReal = [];
        for (const itemName of pano.items) {
            pano.itemsReal.push(getItem(itemName));
        }
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

export function getPanoply(name: string): Panoply {
    return get(panoplies)[name]!;
}

export function getItem(name: string): Item {
    return get(items)[name]!;
}
