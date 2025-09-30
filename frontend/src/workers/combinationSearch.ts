/// <reference lib="webworker" />

import init, { best_combo } from "../../wasm/combination/pkg/combination";
import { ITEM_CATEGORIES } from "../types/item";
import type { CategoryItems, ItemCategory, Items } from "../types/item";

// We'll pass only { name, value } to WASM
type MinItem = { name: string; value: number };

let initialized = false;

onmessage = async (e: MessageEvent) => {
    const { selected } = e.data as {
        selected: CategoryItems; // each category -> { [name]: Item }
    };

    if (!initialized) {
        await init(); // loads the .wasm
        initialized = true;
    }

    // Build Vec<Vec<MinItem>> in the exact category order
    const categories: MinItem[][] = ITEM_CATEGORIES.map((cat) =>
        Object.values(selected[cat]).map((it) => ({
            name: it.name,
            value: (it as any).value ?? 0, // you said value is already computed from weights
        })),
    );

    try {
        const result = best_combo(categories);
        // result is a plain object like { score, names }
        postMessage(result);
    } catch (err) {
        postMessage({ error: String(err) });
    }
};
