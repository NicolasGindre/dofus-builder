import { writable, type Writable } from "svelte/store";
import type { BestBuildsResp, CharacterBuild } from "../types/build";
import {
    // getBiggestCategory,
    sumStatsWithBonus,
    type CategoryItems,
    type Item,
    type ItemCategory,
    type Items,
    type Panoply,
    type Requirement,
} from "../types/item";
import type { Stats } from "../types/stats";
import type { Payload } from "./combinationSearch";

type MinItem = {
    id: string;
    stats: Partial<Stats>;
    panoplies: string[];
    requirement?: Requirement;
};

export type CombinationPayload = {
    selectedItems: Record<ItemCategory, Items>;
    weights: Partial<Stats>;
    minStats: Partial<Stats>;
    maxStats: Partial<Stats>;
    preStats: Partial<Stats>;
    panoplies: Panoply[];
};

export type Orchestrator = {
    running: Writable<boolean>;
    combinationDone: Writable<number>;
    error: Writable<string | null>;

    start: (payload: CombinationPayload) => Promise<BestBuildsResp>;
    cancel: () => void;
    // expose a few stores the UI can subscribe to
    // progress: Writable<number>;
};

const workerUrl = "combinationSearch.ts";
export function createCombinationOrchestrator(multiThreading: boolean): Orchestrator {
    const running = writable(false);
    const combinationDone = writable(0);
    const error = writable<string | null>(null);

    let workers: Worker[] = [];
    let resolve!: (v: any) => void;
    let reject!: (e: any) => void;

    function cancel() {
        for (const w of workers) w.terminate();
        workers = [];
        running.set(false);
    }

    function start(payload: CombinationPayload) {
        cancel();
        running.set(true);
        combinationDone.set(0);
        error.set(null);

        let workerCount = multiThreading
            ? Math.max(1, Math.min((navigator.hardwareConcurrency || 4) - 1, 8))
            : 1;

        let partialPayload: Payload[] = [];
        const minItemsCategory = convertToMinItems(payload.selectedItems);
        const biggestCategoryIndex = getBiggestCategoryIndex(minItemsCategory);

        const itemschunks = partitionEven(minItemsCategory, biggestCategoryIndex, workerCount);

        if (itemschunks.length < workerCount) {
            workerCount = itemschunks.length;
        }
        console.log("workerCount", workerCount);
        console.log("itemschunks", itemschunks);

        for (let i = 0; i < workerCount; i++) {
            let minItemsCategoryWorker = [...minItemsCategory];
            minItemsCategoryWorker[biggestCategoryIndex] = itemschunks[i]!;
            // console.log("selectedItemsWorker", selectedItemsWorker);
            // console.log("i", i);
            const payloadWorker: Payload = {
                minItemsCategory: minItemsCategoryWorker,
                weights: payload.weights,
                minStats: payload.minStats,
                maxStats: payload.maxStats,
                preStats: payload.preStats,
                panoplies: payload.panoplies,
            };
            partialPayload.push(payloadWorker);
        }

        // aggregate results here
        const partialResults: CharacterBuild[][] = Array.from({ length: workerCount }, () => []);
        const partialDone: number[] = Array(workerCount).fill(0);

        return new Promise<any>((res, rej) => {
            resolve = res;
            reject = rej;

            let finished = 0;

            for (let i = 0; i < workerCount; i++) {
                const w = new Worker(new URL(workerUrl, import.meta.url), { type: "module" });
                workers.push(w);

                w.onmessage = (e: MessageEvent) => {
                    const msg = e.data;
                    if (msg?.type === "progress") {
                        // msg.done is "combinations done" for THIS worker
                        partialDone[i] = msg.value;
                        combinationDone.set(partialDone.reduce((a, b) => a + b, 0));
                        return;
                    }
                    if (msg?.type === "error") {
                        error.set(msg.error ?? "Unknown error");
                        cancel();
                        return reject(new Error(msg.error ?? "Unknown error"));
                    }
                    if (msg?.type === "done") {
                        partialResults[i] = msg.value ?? [];
                        finished++;
                        if (finished === workerCount) {
                            // merge top-K from all workers
                            const merged = ([] as CharacterBuild[]).concat(...partialResults);
                            merged.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
                            const top = merged.slice(0, 100);
                            cancel();
                            // bestBuilds.set(buildsFromWasm(msg.value));
                            return resolve(top);
                        }
                        return;
                    }
                };

                w.onerror = (evt) => {
                    error.set(`Worker error: ${evt.message ?? "unknown"}`);
                    cancel();
                    reject(evt);
                };

                console.log("partial payload of worker: ", partialPayload[i]);
                w.postMessage(partialPayload[i]);
            }
        });
    }

    return { start, cancel, running, combinationDone, error };
}

function getBiggestCategoryIndex(minItemsCategory: MinItem[][]): number {
    let biggestCatCount = -1;
    // let biggestMinItems: MinItem[] = minItemsCategory[0]!;
    let biggestIndex = 0;
    for (let i = 0; i < minItemsCategory.length; i++) {
        // for (const items of minItemsCategory) {
        if (minItemsCategory[i]!.length > biggestCatCount) {
            biggestCatCount = minItemsCategory[i]!.length;
            biggestIndex = i;
        }
    }
    return biggestIndex;
}

function partitionEven(
    minItemsCategory: MinItem[][],
    biggestIndex: number,
    parts: number,
): MinItem[][] {
    const items = minItemsCategory[biggestIndex]!;
    const itemsLength = items.length;
    parts = Math.min(itemsLength, parts);

    const itemsPartitioned: MinItem[][] = new Array(parts);
    // const itemsPartitioned: Items[] = [];

    for (let i = 0; i < parts; i++) {
        const start = Math.floor((i * itemsLength) / parts);
        const end = Math.floor(((i + 1) * itemsLength) / parts);
        itemsPartitioned[i] = items.slice(start, end);
    }
    return itemsPartitioned;
}

function convertToMinItems(selectedItems: Record<ItemCategory, Items>): MinItem[][] {
    const minItemsCategory: MinItem[][] = [];

    for (const [category, items] of Object.entries(selectedItems)) {
        const itemsArr = Object.values(items);
        if (itemsArr.length == 0) {
            continue;
        }
        if (category == "ring") {
            minItemsCategory.push(getCombinations(itemsArr, 2));
        } else if (category == "dofus") {
            minItemsCategory.push(getCombinations(itemsArr, 6));
        } else {
            const minItemsOtherCats: MinItem[] = itemsArr.map((item) => ({
                id: item.id,
                stats: item.statsWithBonus,
                panoplies: item.panoply ? [item.panoply] : [],
                requirement: item.requirement,
            }));
            minItemsCategory.push(minItemsOtherCats);
        }
    }
    return minItemsCategory;
}

function getCombinations(items: Item[], k: number): MinItem[] {
    // const itemsArr = Object.values(items);
    const minItems: MinItem[] = [];
    if (items.length < k) {
        return [mergeItems(items)];
    }
    function backtrack(start: number, combo: Item[]) {
        if (combo.length === k) {
            minItems.push(mergeItems(combo));
            return;
        }
        for (let i = start; i < items.length; i++) {
            combo.push(items[i]!);
            backtrack(i + 1, combo);
            combo.pop();
        }
    }

    backtrack(0, []);
    // console.log("Combinations: ", minItems.length);
    // console.log(minItems);
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

function mergeItemsRequirement(items: Item[]): Requirement | undefined {
    for (const item of items) {
        // console.log("item requirement of: ", item.name.fr, item.requirement);
        if (item.requirement) {
            return item.requirement;
        }
    }
    return undefined;
}
