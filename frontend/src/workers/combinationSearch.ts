/// <reference lib="webworker" />
console.log("new worker starting");

import init, { best_combo } from "../../wasm/combination/pkg/combination";
import { sumStats } from "../types/item";
import type { CategoryItems, Item, Panoply } from "../types/item";
import type { Stats } from "../types/stats";

type MinItem = { name: string; stats: Partial<Stats>; panoplies: string[] };

let initialized = false;

onmessage = async (e: MessageEvent) => {
    const parameters = e.data as {
        selectedItems: CategoryItems;
        weights: Partial<Stats>;
        minStats: Partial<Stats>;
        maxStats: Partial<Stats>;
        preStats: Partial<Stats>;
        panoplies: Panoply[];
    };

    if (!initialized) {
        await init();
        initialized = true;
    }

    const minItemsCategory: MinItem[][] = [];

    for (const [category, items] of Object.entries(parameters.selectedItems)) {
        const itemsArr = Object.values(items);
        if (itemsArr.length == 0) {
            continue;
        }
        if (category == "ring") {
            minItemsCategory.push(getCombinations(itemsArr, 2));
        } else if (category == "dofus") {
            minItemsCategory.push(getCombinations(itemsArr, 6));
        } else {
            const minItemsOtherCats = itemsArr.map((item) => ({
                name: item.name,
                stats: item.statsWithBonus,
                panoplies: item.panoply ? [item.panoply] : [],
            }));
            minItemsCategory.push(minItemsOtherCats);
        }
    }
    // console.log(get(itemsCategoryToCalculate));
    console.log("Weights sent to rust : ", parameters.weights);
    console.log("Items sent to rust : ", minItemsCategory);

    try {
        const result = best_combo(
            minItemsCategory,
            parameters.weights,
            parameters.minStats,
            parameters.maxStats,
            parameters.preStats,
            parameters.panoplies,
        );
        postMessage(result);
    } catch (err) {
        postMessage({ error: String(err) });
    }
};

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
    console.log("Combinations: ", minItems.length);
    console.log(minItems);
    return minItems;
}

function mergeItems(items: Item[]): MinItem {
    const minItem: MinItem = {
        name: items.map((i) => i.name).join("+"),
        stats: sumStats(items),
        panoplies: items.map((i) => i.panoply).filter((p): p is string => p !== undefined),
    };
    return minItem;
}
