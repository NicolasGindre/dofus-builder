import { get } from "svelte/store";
import {
    categoryDisplaySize,
    itemsCategoryBest,
    itemsCategoryDisplayed,
    itemsCategoryWithPanoBest,
    panopliesBest,
    panopliesDisplayed,
    panopliesSelected,
    panoplyDisplaySize,
    showBonusPanoCappedItems,
    showOnlySelectedPanos,
    sortBestItemsWithPanoValue,
} from "../stores/builder";
import { ITEM_CATEGORIES, type Item, type ItemCategory, type Panoply } from "../types/item";

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

export function calculatePanopliesToDisplay() {
    // panopliesBest: Panoply[],
    // panopliesSelected: Panoply[],
    // : Panoply[]
    // let panosBest: Panoply[];
    let panosToDisplay: Panoply[] = [];

    let i = 1;
    for (const pano of get(panopliesBest)) {
        if (i < get(panoplyDisplaySize) && !get(showOnlySelectedPanos)) {
            panosToDisplay.push(pano);
            i++;
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
