import { get } from "svelte/store";
import {
    itemsLocked,
    itemsSelected,
    maxStatsIndex,
    minStatsIndex,
    previousStatsSearch,
    urlHash,
    weightsIndex,
} from "../../stores/storeBuilder";
import { decodeStats, encodeStats } from "./encoding";
import { getEmptyCategoriesItems, type Item } from "../../types/item";
import { calculateBestItems } from "../value";
import { defaultMaxIndex } from "../../types/statWeights";
import { decodeItems, encodeItems, sortItemsIds } from "./encodeItems";
import type { ItemCategory } from "../../../../shared/types/item";

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

    setUrlHash(url, encodedStats, encodedItems);
    // if (encodedStats != "" || encodedItems != "") {
    //     url.hash = "s=";
    //     if (encodedStats != "") {
    //         url.hash += encodedStats;
    //     }
    //     if (encodedItems != "") {
    //         if (url.hash) url.hash += "&";
    //         url.hash += `i=${encodedItems}`;
    //     }
    // } else {
    //     url.hash = "";
    // }
    window.history.replaceState(null, "", url.toString());
    urlHash.set(url.hash.slice(1));
    // console.log("URL HASH SET", get(urlHash));
}
export function setUrlHash(url: URL, encodedStats: string, encodedItems: string) {
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
}
export function getEncodedStatsAndLockedFromHash(hash: string): string {
    const pairs = Object.fromEntries(hash.split("&").map((p) => p.split("=")));
    const encodedStats = pairs.s || "";
    // const encodedItems = pairs.i || "";
    // const split = encodedItems.split(".");
    const lockedCounts = new Map<ItemCategory, number>();

    // let lockedIdsArr: Partial<Record<ItemCategory, number>> = {};
    const lockeds = Object.values(get(itemsLocked));
    for (const items of lockeds) {
        for (const item of Object.values(items)) {
            if (item.category != "dofus" && item.category != "pet") {
                // lockedIdsArr.push(item.id);
                lockedCounts.set(item.category, (lockedCounts.get(item.category) ?? 0) + 1);
            }
        }
    }
    const lockedsString = [...lockedCounts.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, count]) => `${name}:${count}`)
        .join(",");
    // lockedIdsArr = sortItemsIds(lockedIdsArr);
    return lockedsString.length > 0 ? `${encodedStats}|${lockedsString}` : encodedStats;
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

    // console.log("hash", hash);
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
            previousStatsSearch.set(getEncodedStatsAndLockedFromHash(hash));
        } catch (err) {
            console.log(err);
        }
    }
    // calculateBestItems();
    canEncode = true;
}

let lastHistoryEntry = window.location.href;

export function saveHistoryEntry() {
    const newUrl = new URL(window.location.href).toString();

    // console.log(newUrl, lastHistoryEntry);
    if (newUrl !== lastHistoryEntry) {
        // console.log("IT IS NEW");
        window.history.pushState(null, "", newUrl);
        setLastHistoryEntry(newUrl);
    } else {
        // console.log("IT IS OLD");
    }
}

export function setLastHistoryEntry(url: string) {
    lastHistoryEntry = url;
}
