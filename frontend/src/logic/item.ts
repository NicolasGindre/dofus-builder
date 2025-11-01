import { get } from "svelte/store";
import { itemsLocked, itemsSelected } from "../stores/builder";
import { categoryLength } from "../types/build";
import { getEmptyCategoriesItems, type Item, type ItemCategory } from "../types/item";
import { calculatePanopliesToDisplay } from "./display";
import { getItem } from "./frontendDB";

export function addOrRemoveItem(itemId: string) {
    const item = getItem(itemId);
    if (get(itemsSelected)[item.category][item.id]) {
        removeItem(item);
    } else {
        addItem(item);
    }
    calculatePanopliesToDisplay();
}

export function addItems(items: Item[]) {
    for (const item of items) {
        addItem(item);
    }
    calculatePanopliesToDisplay();
}
export function removeItems(items: Item[]) {
    for (const item of items) {
        removeItem(item);
    }
    calculatePanopliesToDisplay();
}

export function addItem(item: Item) {
    itemsSelected.update((map) => {
        // clone category map and insert
        return {
            ...map,
            [item.category]: {
                ...map[item.category],
                [item.id]: item,
            },
        };
    });
}

export function removeItem(item: Item) {
    itemsSelected.update((map) => {
        const { [item.id]: _, ...rest } = map[item.category]; // drop this item
        return {
            ...map,
            [item.category]: rest,
        };
    });

    itemsLocked.update((locked) => {
        const categoryLocks = locked[item.category];

        if (categoryLocks[item.id]) {
            delete categoryLocks[item.id];
        }

        return { ...locked, [item.category]: categoryLocks };
    });
}

export function clearAll() {
    itemsSelected.set(getEmptyCategoriesItems());
    itemsLocked.set(getEmptyCategoriesItems());
    calculatePanopliesToDisplay();
}

export function lockItem(category: ItemCategory, item: Item) {
    // console.log($itemsLocked);
    itemsLocked.update((locked) => {
        const categoryLocks = locked[category];
        const ids = Object.keys(categoryLocks);

        if (categoryLocks[item.id]) {
            delete categoryLocks[item.id];
        } else {
            // at limit → remove oldest
            if (ids.length >= categoryLength(category)) {
                delete categoryLocks[ids[0]!];
            }
            categoryLocks[item.id] = item;
        }

        return { ...locked, [category]: categoryLocks };
    });
}

// export function isItemBonusPanoCapped(item: Item): boolean {
//     for (const andRequirements of item.requirements ?? []) {
//         for (const orRequirements of andRequirements) {
//             if (orRequirements.stat == "panopliesBonus") {
//                 return true;
//             }
//         }
//     }
//     return false;
// }
export function isItemBonusPanoCapped(item: Item): boolean {
    if (item.minRequirement?.type == "panopliesBonusLessThan") {
        return true;
    }
    return false;
}
