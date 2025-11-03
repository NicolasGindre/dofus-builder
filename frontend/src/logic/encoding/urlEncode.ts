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
import { addItem, addItems, lockItem } from "../item";
import { calculateBestItems } from "../value";
import { defaultMaxIndex } from "../../types/statWeights";
import { getItem } from "../frontendDB";

let canEncode: boolean = false;
let timeout: number;
export function encodeToUrl() {
    if (canEncode) {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => {
            encodeToUrlNoThrottle();
        }, 150);
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
    // let encodedItems = "";
    let encodedItems: string[] = [];
    let lockedItems: string[] = [];
    // const itemsSelection = get(itemsSelected);
    for (const items of Object.values(get(itemsSelected))) {
        for (const item of Object.values(items)) {
            let isLocked = false;
            for (const lockeds of Object.values(get(itemsLocked))) {
                if (lockeds[item.id]) {
                    isLocked = true;
                    lockedItems.push(item.id);
                    break;
                }
            }
            if (!isLocked) encodedItems.push(item.id);
        }
    }
    const encodedItemsStr = encodedItems.sort().join("");
    const lockedItemsStr = lockedItems.sort().join("");
    return lockedItemsStr ? `${encodedItemsStr}|${lockedItemsStr}` : encodedItemsStr;
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
    const split = encodedItems.split("|");

    if (!split[0]) {
        return;
    }
    for (let i = 0; i < split[0].length; i += 2) {
        const id = split[0].slice(i, i + 2);
        const itemToAdd = getItem(id);
        if (itemToAdd) {
            addItem(itemToAdd);
        }
    }

    if (!split[1]) {
        return;
    }
    for (let i = 0; i < split[1].length; i += 2) {
        const id = split[1].slice(i, i + 2);
        const lockedToAdd = getItem(id);
        if (lockedToAdd) {
            addItem(lockedToAdd);
            lockItem(lockedToAdd.category, lockedToAdd);
        }
    }
}

let lastHistoryEntry = window.location.href;

export function saveHistoryEntry() {
    const newUrl = new URL(window.location.href).toString();

    console.log(newUrl, lastHistoryEntry);
    if (newUrl !== lastHistoryEntry) {
        console.log("IT IS NEW");
        window.history.pushState(null, "", newUrl);
        setLastHistoryEntry(newUrl);
    } else {
        console.log("IT IS OLD");
    }
}

export function setLastHistoryEntry(url: string) {
    lastHistoryEntry = url;
}
