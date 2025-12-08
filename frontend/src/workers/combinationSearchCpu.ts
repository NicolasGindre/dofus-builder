/// <reference lib="webworker" />

import type { BestBuildsResp } from "../types/build";
import type { Panoply } from "../types/item";
import { payloadWarmup } from "./payloadWarmup";
import { initSync, best_combo_cpu } from "../wasm/combination/pkg_cpu/combination";
import type { MinItem, Payload } from "./orchestrator";

let initialized = false;

function runBestCombo(params: Payload, progress: (p: number) => void): BestBuildsResp {
    return best_combo_cpu(
        params.minItemsCategory,
        params.weights,
        params.minStats,
        params.maxStats,
        params.preStats,
        params.panoplies,
        progress,
    );
}

onmessage = async (e: MessageEvent) => {
    const msg = e.data;

    if (msg.type === "init") {
        initSync({ module: msg.bytes });
        try {
            const warmParams: Payload = {
                minItemsCategory: payloadWarmup.minItems as MinItem[][],
                weights: payloadWarmup.weights,
                minStats: payloadWarmup.minStats,
                maxStats: payloadWarmup.maxStats,
                preStats: payloadWarmup.preStats,
                panoplies: payloadWarmup.panoplies as Panoply[],
            };
            runBestCombo(warmParams, () => {});
        } catch (err) {
            console.error(err);
        }

        initialized = true;
        self.postMessage({ type: "ready" });
        return;
    }

    if (!initialized) {
        throw new Error("WASM not initialized");
    }

    if (msg.type === "compute") {
        const parameters = msg.payload as Payload;

        try {
            const progress = (p: number) => {
                postMessage({ type: "progress", value: p, partitionIndex: msg.partitionIndex });
            };

            const bestBuildsResp: BestBuildsResp = runBestCombo(parameters, progress);

            postMessage({
                type: "done",
                value: bestBuildsResp,
                partitionIndex: msg.partitionIndex,
            });
        } catch (err) {
            postMessage({ type: "error", error: String(err) });
        }
    }
};
