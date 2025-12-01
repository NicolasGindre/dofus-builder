/// <reference lib="webworker" />
console.log("WORKER STARTED", performance.now());

import { initSync, best_combo } from "../wasm/combination/pkg/combination";
import type { BestBuildsResp } from "../types/build";
import type { Panoply } from "../types/item";
import type { Stats } from "../../../shared/types/stats";
import type { MinRequirement } from "../../../shared/types/item";
import { payloadWarmup } from "./payloadWarmup";

type MinItem = {
    id: string;
    stats: Partial<Stats>;
    panoplies: string[];
    requirement?: MinRequirement;
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
    const msg = e.data;

    // const parameters = e.data as Payload;

    if (msg.type === "init") {
        initSync({ module: msg.bytes });
        try {
            // Call heavy function on absolutely tiny input
            // This forces Chrome to JIT-compile the hot WASM paths
            best_combo(
                payloadWarmup.minItems,
                payloadWarmup.weights,
                payloadWarmup.minStats,
                payloadWarmup.maxStats,
                payloadWarmup.preStats,
                payloadWarmup.panoplies,
                () => {},
            );
        } catch (_) {
            // ignore errors from bogus input
        }
        initialized = true;
        // postMessage({ type: "ready" });
        return;
    }

    if (!initialized) {
        throw new Error("WASM not initialized");
    }
    const parameters = msg.payload as Payload;

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
