/// <reference lib="webworker" />

import type { BestBuildsResp } from "../types/build";
import type { Panoply } from "../types/item";
import { payloadWarmup } from "./payloadWarmup";
import { initSync, best_combo_gpu } from "../wasm/combination/pkg_gpu/combination";
import type { MinItem, Payload } from "./orchestrator";

let initialized = false;

async function runBestCombo(
    params: Payload,
    progress: (p: number) => void,
): Promise<BestBuildsResp> {
    return await best_combo_gpu(
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
            await runBestCombo(warmParams, () => {});
        } catch (err: any) {
            console.error(err);
            return self.postMessage({ type: "init-error", error: err?.message ?? "Init failed" });
        }
        // return self.postMessage({ type: "init-error" });

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
                // postMessage({ type: "progress", value: p });
                postMessage({ type: "progress", value: p, partitionIndex: msg.partitionIndex });
            };

            const bestBuildsResp: BestBuildsResp = await runBestCombo(parameters, progress);

            // postMessage({ type: "done", value: bestBuildsResp });
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
