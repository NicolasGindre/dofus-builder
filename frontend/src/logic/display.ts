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
    itemsSelected,
    itemsSelectedDisplayed,
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
} from "../stores/storeBuilder";
import { getEmptyCategoriesItemsArr, type Item, type Panoply } from "../types/item";
import { isItemBonusPanoCapped } from "./item";
import { ITEM_CATEGORIES, type ItemCategory } from "../../../shared/types/item";

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
        // if (item.level > get(level)) {
        //     continue;
        // }
        if (!get(showBonusPanoCappedItems) && isItemBonusPanoCapped(item)) {
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
    let panosToDisplay: Panoply[] = [];

    if (!get(showOnlySelectedPanos)) {
        panosToDisplay.push(...getTopXPanos());
    }
    panosToDisplay.push(...get(panopliesSelected));

    panopliesDisplayed.set(panosToDisplay);
}
export function getTopXPanos(): Panoply[] {
    return get(panopliesBest)
        .filter((pano) => pano.bestRelativeValue !== -Infinity && pano.bestValuePerItem > 0)
        .slice(0, get(panoplyDisplaySize));
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

export function calculateSelectedItemsToDisplay() {
    const selected = get(itemsSelected);
    let itemsSelectedArr: Record<ItemCategory, Item[]> = getEmptyCategoriesItemsArr();
    const sortByPanoValue = get(sortBestItemsWithPanoValue);

    for (const [category, items] of Object.entries(selected)) {
        let itemsArr = Object.values(items);
        if (sortByPanoValue) {
            itemsArr.sort((a, b) => b.valueWithPano - a.valueWithPano);
        } else {
            itemsArr.sort((a, b) => b.value - a.value);
        }
        itemsArr.sort((a, b) => {
            const aIsBonus = isItemBonusPanoCapped(a);
            const bIsBonus = isItemBonusPanoCapped(b);
            if (aIsBonus && !bIsBonus) return 1;
            if (!aIsBonus && bIsBonus) return -1;
            return 0;
        });

        itemsSelectedArr[category as ItemCategory] = itemsArr;
    }

    itemsSelectedDisplayed.set(itemsSelectedArr);
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
