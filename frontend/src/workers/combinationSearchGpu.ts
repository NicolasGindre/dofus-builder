/// <reference lib="webworker" />

import type { BestBuildsResp } from "../types/build";
import type { Panoply } from "../types/item";
import { payloadWarmup } from "./payloadWarmup";
import { initSync, best_combo_gpu } from "../wasm/combination/pkg_gpu/combination";
import type { MinItem, Payload } from "./orchestrator";

let initialized = false;

// Helper that routes to the right implementation
async function runBestCombo(
    params: Payload,
    progress: (p: number) => void,
): Promise<BestBuildsResp> {
    // if (!wasmGpu) throw new Error("GPU wasm not loaded");
    // GPU version is async (Promise)
    return await best_combo_gpu(
        params.minItemsCategory,
        params.weights,
        params.minStats,
        params.maxStats,
        params.preStats,
        params.panoplies,
        2,
        progress,
    );
}

onmessage = async (e: MessageEvent) => {
    const msg = e.data;

    if (msg.type === "init") {
        initSync({ module: msg.bytes });

        // Optional warmup with a tiny payload for chosen mode
        try {
            const warmParams: Payload = {
                minItemsCategory: payloadWarmup.minItems as MinItem[][],
                weights: payloadWarmup.weights,
                minStats: payloadWarmup.minStats,
                maxStats: payloadWarmup.maxStats,
                preStats: payloadWarmup.preStats,
                panoplies: payloadWarmup.panoplies as Panoply[],
            };
            await runBestCombo(warmParams, () => {});
        } catch {
            // you can post an init-error if you want
        }

        initialized = true;
        // postMessage({ type: "ready", mode });
        return;
    }

    if (!initialized) {
        throw new Error("WASM not initialized");
    }

    if (msg.type === "compute") {
        const parameters = msg.payload as Payload;

        try {
            const progress = (p: number) => {
                postMessage({ type: "progress", value: p });
            };

            const bestBuildsResp: BestBuildsResp = await runBestCombo(parameters, progress);

            postMessage({ type: "done", value: bestBuildsResp });
        } catch (err) {
            postMessage({ type: "error", error: String(err) });
        }
    }
};
