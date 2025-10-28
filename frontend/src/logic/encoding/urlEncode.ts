import { get } from "svelte/store";
import {
    itemsLocked,
    itemsSelected,
    maxStatsIndex,
    minStatsIndex,
    urlHash,
    weightsIndex,
} from "../../stores/builder";
import { decodeStats, encodeStats } from "./encoding";
import { getEmptyCategoriesItems, type Item } from "../../types/item";
import { getItemFromShortId } from "../frontendDB";
import { addItems, lockItem } from "../item";
import { calculateBestItems } from "../value";
import { defaultMaxIndex } from "../../types/statWeights";

let canEncode: boolean = false;
let timeout: number;
export function encodeToUrl() {
    if (canEncode) {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => {
            encodeToUrlNoThrottle();
        }, 350);
    }
}

export function encodeToUrlNoThrottle() {
    const encodedStats = encodeStats();
    // const encodedPreStats= encodePrestats();
    const encodedItems = encodeItems();

    const url = new URL(window.location.href);

    if (encodedStats != "" || encodedItems != "") {
        url.hash = "s=";
        if (encodedStats != "") {
            url.hash += encodedStats;
        }
        if (encodedItems != "") {
            if (url.hash) url.hash += "&";
            url.hash += `i=${encodedItems}`;
        }
    } else {
        url.hash = "";
    }
    window.history.replaceState(null, "", url.toString());
    urlHash.set(url.hash.slice(1));
    // console.log("URL HASH SET", get(urlHash));
}

function encodeItems(): string {
    let encodedItems = "";
    // const itemsSelection = get(itemsSelected);
    for (const items of Object.values(get(itemsSelected))) {
        for (const item of Object.values(items)) {
            encodedItems += item.idShort;
            for (const lockeds of Object.values(get(itemsLocked))) {
                if (lockeds[item.id]) {
                    encodedItems += "+";
                    break;
                }
            }
        }
    }
    // console.log("encodedItems", encodedItems);
    return encodedItems;
}

export function decodeFromUrl(hash?: string) {
    clearTimeout(timeout);
    canEncode = false;
    if (!hash) {
        hash = window.location.hash.slice(1);
    }
    const url = new URL(window.location.href);
    url.hash = hash;
    window.history.replaceState(null, "", url.toString());
    urlHash.set(hash);

    console.log("hash", hash);
    const pairs = Object.fromEntries(hash.split("&").map((p) => p.split("=")));
    const encodedStats = pairs.s || "";
    const encodedItems = pairs.i || "";
    // console.log("encoded stats", encodedStats);
    // console.log("encoded items", encodedItems);
    weightsIndex.set({});
    minStatsIndex.set({});
    maxStatsIndex.set({ ...defaultMaxIndex });
    itemsSelected.set(getEmptyCategoriesItems());
    itemsLocked.set(getEmptyCategoriesItems());

    if (encodedItems) {
        try {
            // console.log("itemsSelected", get(itemsSelected));
            decodeItems(encodedItems);
            // console.log("itemsSelected", get(itemsSelected));
        } catch (err) {
            console.log(err);
        }
    }
    if (encodedStats) {
        try {
            decodeStats(encodedStats);
            calculateBestItems();
        } catch (err) {
            console.log(err);
        }
    }
    // calculateBestItems();
    canEncode = true;
}

function decodeItems(encodedItems: string) {
    // const parts = [];
    const itemsToAdd: Item[] = [];
    for (let i = 0; i < encodedItems.length; i += 2) {
        const shortId = encodedItems.slice(i, i + 2);
        const itemToAdd = getItemFromShortId(shortId);
        // console.log("shortId", shortId);
        // console.log("itemToAdd", itemToAdd);
        if (itemToAdd) {
            itemsToAdd.push(itemToAdd);
        }
        if (encodedItems.slice(i + 2, i + 3) == "+") {
            if (itemToAdd) {
                lockItem(itemToAdd.category, itemToAdd);
            }
            i++;
        }
    }
    // console.log("itemsToAdd", itemsToAdd);
    addItems(itemsToAdd);
}

export function saveHistoryEntry() {
    const url = new URL(window.location.href);
    window.history.pushState(null, "", url.toString());
}
