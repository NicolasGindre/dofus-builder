import { get } from "svelte/store";
import {
    bestBuilds,
    bestBuildsPage,
    buildsDisplayed,
    buildShownCount,
    categoryDisplaySize,
    itemsCategoryBest,
    itemsCategoryDisplayed,
    itemsCategoryWithPanoBest,
    level,
    panopliesBest,
    panopliesDisplayed,
    panopliesSelected,
    panoplyDisplaySize,
    savedBuilds,
    savedBuildsPage,
    showBonusPanoCappedItems,
    showOnlySelectedPanos,
    showSavedBuilds,
    sortBestItemsWithPanoValue,
} from "../stores/builder";
import { ITEM_CATEGORIES, type Item, type ItemCategory, type Panoply } from "../types/item";
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

export function calculateBuildToDisplay() {
    // let bestBuildShow: Build[] = [];
    const shownCount = get(buildShownCount);
    const builds = get(showSavedBuilds) ? get(savedBuilds) : get(bestBuilds);
    const currPage = get(showSavedBuilds) ? get(savedBuildsPage) : get(bestBuildsPage);
    // const pages = Math.ceil(builds.length / shownCount);

    const start = (currPage - 1) * shownCount;
    const end = start + shownCount;

    let bestBuildShow = builds.slice(start, end);

    // for (const build of get(bestBuilds)) {
    //     bestBuildShow.push(build);
    //     i++;
    //     if (i > get(buildShownCount)) {
    //         break;
    //     }
    // }
    buildsDisplayed.set(bestBuildShow);
}
