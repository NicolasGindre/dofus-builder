import { get } from "svelte/store";
import {
    bestBuilds,
    bestBuildsDisplayed,
    bestBuildShownCount,
    categoryDisplaySize,
    itemsCategoryBest,
    itemsCategoryDisplayed,
    itemsCategoryWithPanoBest,
    itemsLocked,
    itemsSelected,
    level,
    panopliesBest,
    panopliesDisplayed,
    panopliesSelected,
    panoplyDisplaySize,
    showBonusPanoCappedItems,
    showOnlySelectedPanos,
    sortBestItemsWithPanoValue,
} from "../stores/builder";
import {
    getEmptyCategoriesItems,
    ITEM_CATEGORIES,
    type Item,
    type ItemCategory,
    type Panoply,
} from "../types/item";
import { getItem } from "./frontendDB";
import type { Build } from "../types/build";

export function calculateAllItemsToDisplay() {
    for (const category of ITEM_CATEGORIES) {
        calculateItemsToDisplay(category);
        // .splice(get(categoryDisplaySize)[category as ItemCategory]);
    }
}

export function calculateItemsToDisplay(category: ItemCategory) {
    let itemsBest: Record<ItemCategory, Item[]>;
    let itemsToDisplay: Item[] = [];
    if (get(sortBestItemsWithPanoValue)) {
        itemsBest = get(itemsCategoryWithPanoBest);
    } else {
        itemsBest = get(itemsCategoryBest);
    }
    let i = 1;
    for (const item of itemsBest[category]) {
        if (item.level > get(level)) {
            continue;
        }
        if (!get(showBonusPanoCappedItems) && item.requirement?.type == "panopliesBonusLessThan") {
            continue;
        }
        itemsToDisplay.push(item);
        i++;
        if (i > get(categoryDisplaySize)[category]) {
            break;
        }
    }
    // console.log(itemsToDisplay);
    itemsCategoryDisplayed.update((old) => {
        return {
            ...old,
            [category]: itemsToDisplay,
        };
    });
}

let panoDisplayScheduled = false;
export function calculatePanopliesToDisplay() {
    if (panoDisplayScheduled) return;
    panoDisplayScheduled = true;

    setTimeout(() => {
        panoDisplayScheduled = false;
        calculatePanopliesToDisplayNow();
    }, 0);
}
export function calculatePanopliesToDisplayNow() {
    // panopliesBest: Panoply[],
    // panopliesSelected: Panoply[],
    // : Panoply[]
    // let panosBest: Panoply[];
    let panosToDisplay: Panoply[] = [];

    let i = 1;
    for (const pano of get(panopliesBest)) {
        if (i < get(panoplyDisplaySize) && !get(showOnlySelectedPanos)) {
            let panoOverLevel = true;
            for (const item of pano.itemsReal) {
                if (item.level <= get(level)) {
                    panoOverLevel = false;
                    break;
                }
            }
            if (!panoOverLevel) {
                panosToDisplay.push(pano);
                i++;
            }
        } else {
            for (const panoSelected of get(panopliesSelected)) {
                if (panoSelected.name == pano.name) {
                    panosToDisplay.push(pano);
                }
            }
        }
    }
    console.log(panosToDisplay);
    // return panosToDisplay;
    panopliesDisplayed.set(panosToDisplay);
}

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
export function showOnlySelected(showOnlySelected: boolean) {
    showOnlySelectedPanos.set(showOnlySelected);
    calculatePanopliesToDisplay();
}
// function setBonusPanoCappedItems(show: boolean) {
//     showBonusPanoCappedItems.set(show);
// }

export function orderByValueWithPano(withPanoValue: boolean) {
    sortBestItemsWithPanoValue.set(withPanoValue);
}

export function clearAll() {
    itemsSelected.set(getEmptyCategoriesItems());
    itemsLocked.set(getEmptyCategoriesItems());
    calculatePanopliesToDisplay();
}

export function calculateBestBuildToDisplay() {
    let bestBuildShow: Build[] = [];
    // const showCount = get(bestBuildShownCount);
    let i = 1;
    for (const build of get(bestBuilds)) {
        bestBuildShow.push(build);
        i++;
        if (i > get(bestBuildShownCount)) {
            break;
        }
    }
    bestBuildsDisplayed.set(bestBuildShow);
}
