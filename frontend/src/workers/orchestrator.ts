import { writable, type Writable } from "svelte/store";
import { categoryLength, type BestBuildsResp, type Build } from "../types/build";
import { sumStatsWithBonus, type Item, type Items, type Panoply } from "../types/item";
import { isItemBonusPanoCapped } from "../logic/item";
import type { ItemCategory, MinRequirement } from "../../../shared/types/item";
import type { Stats } from "../../../shared/types/stats";

import CombinationSearchWorkerCpu from "./combinationSearchCpu.ts?worker&module";
import CombinationSearchWorkerGpu from "./combinationSearchGpu.ts?worker&module";
import wasmCpuUrl from "../wasm/combination/pkg_cpu/combination_bg.wasm?url";
import wasmGpuUrl from "../wasm/combination/pkg_gpu/combination_bg.wasm?url";
import { string } from "zod/v4-mini";
import { computeMode } from "../stores/storeBuilder";

export type MinItem = {
    id: string;
    stats: Partial<Stats>;
    panoplies: string[];
    requirement?: MinRequirement;
};
export type Payload = {
    minItemsCategory: MinItem[][];
    weights: Partial<Stats>;
    minStats: Partial<Stats>;
    maxStats: Partial<Stats>;
    preStats: Partial<Stats>;
    panoplies: Panoply[];
};
export type CombinationPayload = {
    // selectedItems: Record<ItemCategory, Items>;
    // lockedItems: Record<ItemCategory, Items>;
    minItems: MinItem[][];
    weights: Partial<Stats>;
    minStats: Partial<Stats>;
    maxStats: Partial<Stats>;
    preStats: Partial<Stats>;
    panoplies: Panoply[];
};

const cores = navigator.hardwareConcurrency || 4;
// const isFirefox = navigator.userAgent.includes("Firefox");
const maxWorkers = cores <= 8 ? cores : cores <= 16 ? 8 : Math.floor(cores / 2);
// const maxWorkers = 8;
// const workerPool: Worker[] = Array.from({ length: maxWorkers }, () => {
//     const w = new CombinationSearchWorker();
//     return w;
// });

let workerPool: Worker[] = [];
export type Mode = "cpu" | "gpu";
let mode: Mode;

const ready = writable(false);

export function gpuAvailable(): boolean {
    return "gpu" in navigator;
}

export async function initWorkerPool(newMode?: Mode) {
    // let mode: Mode = gpuAvailable() && get(computeMode) == "gpu" ? "gpu" : "cpu";
    ready.set(false);

    for (const w of workerPool) w.terminate();
    if (newMode) {
        mode = newMode;
    }
    if (mode == "gpu") {
        workerPool = Array.from({ length: maxWorkers }, () => new CombinationSearchWorkerGpu());
    } else {
        workerPool = Array.from({ length: maxWorkers }, () => new CombinationSearchWorkerCpu());
    }
    const bytes =
        mode == "gpu"
            ? await fetch(wasmGpuUrl).then((r) => r.arrayBuffer())
            : await fetch(wasmCpuUrl).then((r) => r.arrayBuffer());

    // for (const w of workerPool) {
    //     w.postMessage({ type: "init", bytes: bytes.slice(0) });
    // }

    await new Promise<void>((resolve, reject) => {
        let remaining = workerPool.length;

        for (const w of workerPool) {
            w.onmessage = (e: MessageEvent) => {
                if (e.data?.type === "ready") {
                    if (--remaining === 0) resolve();
                }
                if (e.data?.type === "init-error") {
                    const errMsg = e.data.error ?? "Worker init failed.";
                    reject(new Error(errMsg + " Switching back to CPU"));
                    if (mode == "gpu") {
                        computeMode.set("cpu");
                    }
                    return;
                }
            };
            w.onerror = (evt) => {
                const errMsg = evt.message ?? "Worker script crashed";
                reject(new Error(errMsg + " Switching back to CPU"));
                if (mode == "gpu") {
                    computeMode.set("cpu");
                }
                return;
            };
            w.postMessage({ type: "init", bytes: bytes.slice(0) });
        }
    });
    ready.set(true);
    // console.log("ready");
}

export type Orchestrator = {
    ready: Writable<boolean>;
    running: Writable<boolean>;
    combinationDone: Writable<number>;
    error: Writable<string | null>;

    start: (payload: CombinationPayload) => Promise<BestBuildsResp>;
    cancel: () => void;
    // expose a few stores the UI can subscribe to
    // progress: Writable<number>;
};

// const workerUrl = "combinationSearch.ts";
export function createCombinationOrchestrator(): Orchestrator {
    const running = writable(false);
    const combinationDone = writable(0);
    const error = writable<string | null>(null);

    // let workers: Worker[] = [];
    let resolve!: (v: any) => void;
    let reject!: (e: any) => void;

    async function cancel() {
        // workers = [];
        running.set(false);

        // workerPool = createFreshWorkerPool();
        await initWorkerPool();
    }

    function start(payload: CombinationPayload) {
        running.set(true);
        combinationDone.set(0);
        error.set(null);

        const panosToCalculate = filterPanosWithAtLeast2Items(payload.panoplies, payload.minItems);

        let partitionPayload: Payload[] = [];
        const minItemsCategory = payload.minItems;
        const biggestCategoryIndex = getBiggestCategoryIndex(minItemsCategory);

        const itemschunks = partitionEven(
            minItemsCategory,
            biggestCategoryIndex,
            minItemsCategory[biggestCategoryIndex]!.length,
        );

        for (let i = 0; i < itemschunks.length; i++) {
            let minItemsCategoryWorker = [...minItemsCategory];
            minItemsCategoryWorker[biggestCategoryIndex] = itemschunks[i]!;
            const payloadWorker: Payload = {
                minItemsCategory: minItemsCategoryWorker,
                weights: payload.weights,
                minStats: payload.minStats,
                maxStats: payload.maxStats,
                preStats: payload.preStats,
                panoplies: panosToCalculate,
            };
            partitionPayload.push(payloadWorker);
        }
        // console.log("partial payload length", partitionPayload.length);

        const partialResults: Build[][] = Array.from({ length: partitionPayload.length }, () => []);
        const partialBuildsProcessed: number[] = Array(partitionPayload.length).fill(0);
        let partitionIndex: number = 0;

        return new Promise<any>((res, rej) => {
            resolve = res;
            reject = rej;

            for (let i = 0; i < workerPool.length; i++) {
                if (partitionIndex >= partitionPayload.length) {
                    break;
                }
                const w = workerPool[i]!;

                w.onmessage = (e: MessageEvent) => {
                    const msg = e.data;
                    if (msg?.type === "progress") {
                        partialBuildsProcessed[msg.partitionIndex] = msg.value;

                        combinationDone.set(
                            // workersFinishedCombination +
                            partialBuildsProcessed.reduce((a, b) => a + b, 0),
                        );
                        return;
                    }
                    if (msg?.type === "error") {
                        error.set(msg.error ?? "Unknown error");
                        cancel();
                        return reject(new Error(msg.error ?? "Unknown error"));
                    }
                    if (msg?.type === "done") {
                        // console.log("saving index result", msg.partitionIndex);
                        partialResults[msg.partitionIndex] = msg.value ?? [];

                        if (partitionIndex < partitionPayload.length) {
                            w.postMessage({
                                type: "compute",
                                payload: partitionPayload[partitionIndex],
                                partitionIndex: partitionIndex,
                            });
                            partitionIndex++;
                            // console.log("starting index", partitionIndex);
                        }
                        if (msg.partitionIndex === partitionPayload.length - 1) {
                            // merge top-K from all workers
                            const merged = ([] as Build[]).concat(...partialResults);
                            merged.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
                            const top = merged.slice(0, 500);
                            // running.set(false);
                            resolve(top);
                            cancel();
                            return;
                        }
                        return;
                    }
                };
                w.onerror = (evt) => {
                    error.set(`Worker error: ${evt.message ?? "unknown"}`);
                    cancel();
                    reject(evt);
                };
                w.postMessage({
                    type: "compute",
                    payload: partitionPayload[partitionIndex],
                    partitionIndex: partitionIndex,
                });
                partitionIndex++;
            }
        });
    }

    return { ready, start, cancel, running, combinationDone, error };
}

function getBiggestCategoryIndex(minItemsCategory: MinItem[][]): number {
    let biggestCatCount = -1;
    let biggestIndex = 0;
    for (let i = 0; i < minItemsCategory.length; i++) {
        if (minItemsCategory[i]!.length > biggestCatCount) {
            biggestCatCount = minItemsCategory[i]!.length;
            biggestIndex = i;
        }
    }
    return biggestIndex;
}

function filterPanosWithAtLeast2Items(panos: Panoply[], minItems: MinItem[][]): Panoply[] {
    let panoCount: Record<string, number> = {};
    for (const minItemsCat of minItems) {
        for (const minItem of minItemsCat) {
            for (const pano of minItem.panoplies) {
                panoCount[pano] = 1 + (panoCount[pano] ?? 0);
            }
        }
    }
    let panosToCalculate: Panoply[] = [];
    for (const pano of panos) {
        if ((panoCount[pano.id] ?? 0) >= 2) {
            panosToCalculate.push(pano);
        }
    }
    // console.log(panoCount);
    // console.log(panosToCalculate.length);
    return panosToCalculate;
}

function partitionEven(
    minItemsCategory: MinItem[][],
    biggestIndex: number,
    parts: number,
): MinItem[][] {
    const items = minItemsCategory[biggestIndex]!;
    const itemsLength = items.length;
    parts = Math.max(Math.min(itemsLength, parts), 1);

    const itemsPartitioned: MinItem[][] = new Array(parts);

    for (let i = 0; i < parts; i++) {
        const start = Math.floor((i * itemsLength) / parts);
        const end = Math.floor(((i + 1) * itemsLength) / parts);
        itemsPartitioned[i] = items.slice(start, end);
    }
    return itemsPartitioned;
}

export function convertToMinItems(
    selectedItems: Record<ItemCategory, Items>,
    lockedItems: Record<ItemCategory, Items>,
): MinItem[][] {
    const minItemsCategory: MinItem[][] = [];

    for (const [category, items] of Object.entries(selectedItems)) {
        const itemsArr = Object.values(items);
        const itemsLockedArr = Object.values(lockedItems[category as ItemCategory]);
        if (itemsArr.length == 0) {
            continue;
        }
        if (category == "dofus") {
            //  && shouldAddComboNoBonusPanoLessThan3(itemsArr, itemsLockedArr)
            // console.log(getComboItemsNoBonusPanoLessThan3(itemsArr));

            if (!itemsArr.some(isItemBonusPanoCapped)) {
                minItemsCategory.push(
                    getCombinations(
                        itemsArr,
                        itemsLockedArr,
                        categoryLength(category as ItemCategory),
                    ),
                );
                continue;
            }
            if (itemsLockedArr.some(isItemBonusPanoCapped)) {
                minItemsCategory.push(
                    getCombinations(
                        itemsArr,
                        itemsLockedArr,
                        categoryLength(category as ItemCategory),
                    ),
                );
                continue;
            }

            const noBonusPanoItems = itemsArr.filter((item) => !isItemBonusPanoCapped(item));
            const noBonusPanoCombo = getCombinations(
                noBonusPanoItems,
                itemsLockedArr,
                categoryLength(category as ItemCategory),
            );

            const bonusPanoItems = itemsArr.filter((item) => isItemBonusPanoCapped(item));
            const freeSpots = categoryLength("dofus") - itemsLockedArr.length;

            let bonusPanoCombo: MinItem[];
            if (freeSpots == 0) {
                bonusPanoCombo = [];
            } else if (bonusPanoItems.length < freeSpots) {
                bonusPanoCombo = getCombinations(
                    itemsArr,
                    [...itemsLockedArr, ...bonusPanoItems],
                    categoryLength(category as ItemCategory),
                );
            } else {
                bonusPanoCombo = getCombinations(
                    bonusPanoItems,
                    itemsLockedArr,
                    categoryLength(category as ItemCategory),
                );
            }
            minItemsCategory.push([...noBonusPanoCombo, ...bonusPanoCombo]);
            // console.log("minItemsCategory", minItemsCategory);
        } else {
            minItemsCategory.push(
                getCombinations(itemsArr, itemsLockedArr, categoryLength(category as ItemCategory)),
            );
        }
    }
    return minItemsCategory;
}
function getCombinations(items: Item[], itemsLocked: Item[], k: number): MinItem[] {
    const minItems: MinItem[] = [];

    // Remove locked items from the pool if they're also in items
    const unlockedItems = items.filter((i) => !itemsLocked.some((locked) => locked.id === i.id));

    // Adjust k since locked items are already included
    const remaining = k - itemsLocked.length;

    // If not enough items to fill the rest, merge all we can
    if (unlockedItems.length < remaining) {
        return [mergeItems([...itemsLocked, ...unlockedItems])];
    }

    function backtrack(start: number, combo: Item[]) {
        if (combo.length === remaining) {
            minItems.push(mergeItems([...itemsLocked, ...combo]));
            return;
        }
        for (let i = start; i < unlockedItems.length; i++) {
            combo.push(unlockedItems[i]!);
            backtrack(i + 1, combo);
            combo.pop();
        }
    }
    backtrack(0, []);

    return minItems;
}

function mergeItems(items: Item[]): MinItem {
    const minItem: MinItem = {
        id: items.map((i) => i.id).join("+"),
        stats: sumStatsWithBonus(items),
        panoplies: items.map((i) => i.panoply).filter((p): p is string => p !== undefined),
        requirement: mergeItemsRequirement(items),
    };
    return minItem;
}

function mergeItemsRequirement(items: Item[]): MinRequirement | undefined {
    for (const item of items) {
        // console.log("item requirement of: ", item.name.fr, item.requirement);
        // CAREFUL ! Potential issue : we only link one possible requirement per item to Rust.
        // It should cover everything we need for now but.
        if (item.minRequirement) {
            return item.minRequirement;
        }
    }
    return undefined;
}
