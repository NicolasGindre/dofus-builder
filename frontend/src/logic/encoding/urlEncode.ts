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
import { calculateBestItems } from "../value";
import { defaultMaxIndex } from "../../types/statWeights";
import { decodeItems, encodeItems } from "./encodeItems";

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
export function getEncodedStatsFromHash(hash: string): string {
    const pairs = Object.fromEntries(hash.split("&").map((p) => p.split("=")));
    const encodedStats = pairs.s || "";
    return encodedStats;
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
