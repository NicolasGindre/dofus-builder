import { get } from "svelte/store";
import type { StatKey } from "../../types/stats";
import {
    maxStats,
    maxStatsIndex,
    minStats,
    minStatsIndex,
    weights,
    weightsIndex,
} from "../../stores/builder";
import { defaultMaxIndex } from "../../types/statWeights";
import { decodeStats, encodeStats } from "./encoding";

let timeout: number;
export function encodeToUrl(saveToHistory: boolean) {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => {
        encodeToUrlNoThrottle(saveToHistory);
    }, 350); // update at most every 200ms
}

export function encodeToUrlNoThrottle(saveToHistory: boolean) {
    const statsToEncode = new Set<StatKey>();

    const weightsToEncode = get(weightsIndex);
    const minStatsToEncode = get(minStatsIndex);
    const maxStatsToEncode = get(maxStatsIndex);
    Object.entries(weightsToEncode)
        .filter(([_, value]) => value > 0)
        .forEach(([key]) => statsToEncode.add(key as StatKey));

    Object.entries(minStatsToEncode)
        .filter(([_, value]) => value > 0)
        .forEach(([key]) => statsToEncode.add(key as StatKey));

    // Add stats with max values that differ from defaults
    Object.entries(maxStatsToEncode)
        .filter(([key, value]) => {
            const defaultIndex = defaultMaxIndex[key as StatKey];
            return defaultIndex === undefined || value !== defaultIndex;
        })
        .forEach(([key]) => statsToEncode.add(key as StatKey));

    console.log("statsToEncode", statsToEncode);
    const encodedStats = encodeStats([...statsToEncode]);
    console.log("encoded", encodedStats);

    // Create the full URL
    const url = new URL(window.location.href);

    // if (encodedStats != "") {
    url.hash = `s=${encodedStats}`;
    // return;
    // }
    // url.hash = `s=${encodedStats}`; //&i=${itemsEncoded}`;

    window.history.replaceState(null, "", url.toString());

    // Copy to clipboard
    // navigator.clipboard.writeText(url.toString()).then(() => {
    //     copied = true;
    //     clearTimeout(timeout);
    //     timeout = setTimeout(() => {
    //         copied = false;
    //     }, 2000) as unknown as number;
    // });
}

export function decodeFromUrl() {
    const hash = window.location.hash.slice(1); // remove the "#"
    // const params = new URLSearchParams(hash);

    // const encodedStats = params.get("s");
    // const encodedItems = params.get("i");
    const pairs = Object.fromEntries(hash.split("&").map((p) => p.split("=")));
    const encodedStats = pairs.s || "";
    // const encodedItems = pairs.i || "";

    if (encodedStats) {
        console.log("encoded Stats", encodedStats);
        decodeStats(encodedStats);
    }
}
