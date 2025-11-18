import { writable, type Writable } from "svelte/store";
import { categoryLength, type BestBuildsResp, type Build } from "../types/build";
import {
    // getBiggestCategory,
    sumStatsWithBonus,
    type CategoryItems,
    type Item,
    type Items,
    type Panoply,
} from "../types/item";
import type { Payload } from "./combinationSearch";
import CombinationSearchWorker from "./combinationSearch.ts?worker";
import { isItemBonusPanoCapped } from "../logic/item";
import type { ItemCategory, MinRequirement } from "../../../shared/types/item";
import type { Stats } from "../../../shared/types/stats";

export type MinItem = {
    id: string;
    stats: Partial<Stats>;
    panoplies: string[];
    requirement?: MinRequirement;
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

export type Orchestrator = {
    running: Writable<boolean>;
    combinationDone: Writable<number>;
    error: Writable<string | null>;

    start: (payload: CombinationPayload) => Promise<BestBuildsResp>;
    cancel: () => void;
    // expose a few stores the UI can subscribe to
    // progress: Writable<number>;
};

// const workerUrl = "combinationSearch.ts";
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

        const cores = navigator.hardwareConcurrency || 4;
        console.log("cores count", cores);

        let workerCount = multiThreading ? Math.max(1, Math.min(cores, 8)) : 1;
        // let workerCount = multiThreading ? Math.min(Math.max(1, Math.floor(cores * 0.75)), 16) : 1;

        // const isFirefox = navigator.userAgent.includes("Firefox");

        // let workerCount = multiThreading
        //     ? isFirefox
        //         ? Math.min(Math.max(1, Math.floor(cores * 0.75)), 16)
        //         : Math.max(1, Math.min(cores - 1, 8))
        //     : 1;
        // workerCount = 7;
        let partialPayload: Payload[] = [];
        console.log("starting workers count", workerCount);
        // performance.now()
        // const now = performance.now();
        // const minItemsCategory = convertToMinItems(payload.selectedItems, payload.lockedItems);
        const minItemsCategory = payload.minItems;
        // const elapsedSec = (now - performance.now()) / 1000;
        // console.log("Elapsed secs", elapsedSec);
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
        const partialResults: Build[][] = Array.from({ length: workerCount }, () => []);
        const partialDone: number[] = Array(workerCount).fill(0);

        return new Promise<any>((res, rej) => {
            resolve = res;
            reject = rej;

            let finished = 0;

            for (let i = 0; i < workerCount; i++) {
                const w = new CombinationSearchWorker();

                // const w = new Worker(new URL(workerUrl, import.meta.url), { type: "module" });
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
                            const merged = ([] as Build[]).concat(...partialResults);
                            merged.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
                            const top = merged.slice(0, 500);
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
    let biggestIndex = 0;
    for (let i = 0; i < minItemsCategory.length; i++) {
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
            console.log("minItemsCategory", minItemsCategory);
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

export function getComboItemsWithBonusPanoLessThan3(items: Item[]): MinItem {
    // let itemsNoBonusPano: MinItem[] = [];
    const noBonusPanoItems = items.filter(
        // (item) => item.requirement?.type !== "panopliesBonusLessThan",
        (item) => !isItemBonusPanoCapped(item),
    );
    // itemsNoBonusPano.push();
    console.log(noBonusPanoItems);
    return mergeItems(noBonusPanoItems);
}

export function getComboItemsNoBonusPanoLessThan3(items: Item[]): MinItem {
    // let itemsNoBonusPano: MinItem[] = [];
    const noBonusPanoItems = items.filter(
        // (item) => item.requirement?.type !== "panopliesBonusLessThan",
        (item) => !isItemBonusPanoCapped(item),
    );
    // itemsNoBonusPano.push();
    console.log(noBonusPanoItems);
    return mergeItems(noBonusPanoItems);
}
