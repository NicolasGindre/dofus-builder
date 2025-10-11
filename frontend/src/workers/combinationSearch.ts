/// <reference lib="webworker" />
console.log("new worker starting");

import init, { best_combo } from "../wasm/combination/pkg/combination";
import type { BestBuildsResp } from "../types/build";
import { sumStats, sumStatsWithBonus } from "../types/item";
import type { CategoryItems, Item, Requirement, Panoply } from "../types/item";
import type { Stats } from "../types/stats";

type MinItem = {
    id: string;
    stats: Partial<Stats>;
    panoplies: string[];
    requirement?: Requirement;
};

let initialized = false;

export type Payload = {
    minItemsCategory: MinItem[][];
    weights: Partial<Stats>;
    minStats: Partial<Stats>;
    maxStats: Partial<Stats>;
    preStats: Partial<Stats>;
    panoplies: Panoply[];
};

onmessage = async (e: MessageEvent) => {
    const parameters = e.data as Payload;

    if (!initialized) {
        await init();
        initialized = true;
    }

    // console.log("Weights sent to rust : ", parameters.weights);
    // console.log("MinStats sent to rust : ", parameters.minStats);
    // console.log("maxStats sent to rust : ", parameters.maxStats);
    // console.log("Items sent to rust : ", parameters.minItemsCategory);
    // console.log("panoplies sent to rust : ", parameters.panoplies);

    try {
        const progress = (p: number) => {
            postMessage({ type: "progress", value: p });
        };
        const bestBuildsResp: BestBuildsResp = best_combo(
            parameters.minItemsCategory,
            parameters.weights,
            parameters.minStats,
            parameters.maxStats,
            parameters.preStats,
            parameters.panoplies,
            progress,
        );
        postMessage({ type: "done", value: bestBuildsResp });
    } catch (err) {
        postMessage({ type: "error", error: String(err) });
    }
};
