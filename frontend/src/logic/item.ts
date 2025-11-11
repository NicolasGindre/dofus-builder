import { get } from "svelte/store";
import { itemsLocked, itemsSelected, level, minStats } from "../stores/builder";
import { categoryLength } from "../types/build";
import { getEmptyCategoriesItems, type Item, type Panoply } from "../types/item";
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

export function lockItem(item: Item) {
    // console.log($itemsLocked);
    itemsLocked.update((locked) => {
        const category = item.category;
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

export const PANO_CIRE_MOMORE_ID = "6h";
export function isPanoMinRequirementOK(pano: Panoply, comboCount: number): boolean {
    if (pano.id == PANO_CIRE_MOMORE_ID) {
        const min = get(minStats);
        switch (comboCount) {
            case 2:
                if ((min["mp"] ?? 0) > 4 || (min["range"] ?? 0) > 4 || (min["summon"] ?? 0) > 4) {
                    return false;
                }
                break;
            case 3:
            case 4:
            case 5:
                if ((min["mp"] ?? 0) > 3 || (min["range"] ?? 0) > 3 || (min["summon"] ?? 0) > 3) {
                    return false;
                }
                break;
            default:
                if ((min["mp"] ?? 0) > 2 || (min["range"] ?? 0) > 2 || (min["summon"] ?? 0) > 2) {
                    return false;
                }
                break;
        }
    }
    return true;
}
export function isItemMinRequirementOK(item: Item): boolean {
    if (item.level > get(level)) {
        return false;
    }
    if (!item.minRequirement) {
        return true;
    }
    const min = get(minStats);
    switch (item.minRequirement.type) {
        case "apLessThanOrMpLessThan":
            if (
                (min["ap"] ?? 0) >= item.minRequirement.value &&
                (min["mp"] ?? 0) >= item.minRequirement.value2!
            ) {
                return false;
            }
            break;
        case "apLessThanAndMpLessThan":
            if (
                (min["ap"] ?? 0) >= item.minRequirement.value ||
                (min["mp"] ?? 0) >= item.minRequirement.value2!
            ) {
                return false;
            }
            break;
        case "apLessThan":
            if ((min["ap"] ?? 0) >= item.minRequirement.value) {
                return false;
            }
            break;
        case "mpLessThan":
            if ((min["mp"] ?? 0) >= item.minRequirement.value) {
                return false;
            }
            break;
    }
    return true;
}
