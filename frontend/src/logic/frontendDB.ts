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
    // const itemsStorage = localStorage.getItem("items");
    const itemsStorage = false;
    if (itemsStorage) {
        console.log("Loaded Items From STORAGE");
        items.set(JSON.parse(itemsStorage));
    } else {
        const itemResp = await fetch("/api/items");
        if (!itemResp.ok) throw new Error("Failed to load items");
        const itemsJson = await itemResp.json();
        items.set(itemsJson as Items);
        localStorage.setItem("items", JSON.stringify(itemsJson));
    }

    // const panopliesStorage = localStorage.getItem("panoplies");
    const panopliesStorage = false;
    if (panopliesStorage) {
        // console.log("panopliesStorage", panopliesStorage);
        panoplies.set(JSON.parse(panopliesStorage));
    } else {
        const panopliesResp = await fetch("/api/panoplies");
        if (!panopliesResp.ok) throw new Error("Failed to load panoplies");
        const panopliesJson = await panopliesResp.json();
        panoplies.set(panopliesJson as Panoplies);
        localStorage.setItem("panoplies", JSON.stringify(panopliesJson));
    }

    calculateItemsBonus();
    addPanopliesItemsReal();
    calculatePanopliesBonus();
    fillItemsCategories();
}

function calculateItemsBonus() {
    for (const item of Object.values(get(items))) {
        item.statsWithBonus = getBonusStats(item.stats);
    }
}

function addPanopliesItemsReal() {
    for (const pano of Object.values(get(panoplies))) {
        pano.itemsReal = [];
        for (const itemId of pano.items) {
            pano.itemsReal.push(getItem(itemId));
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

export function getPanoply(id: string): Panoply {
    return get(panoplies)[id]!;
}

export function getItem(id: string): Item {
    return get(items)[id]!;
}

export function getItemFromShortId(shortId: string): Item | undefined {
    return Object.values(get(items)).find((item) => item.idShort === shortId);
}
