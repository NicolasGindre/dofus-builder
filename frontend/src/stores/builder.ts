import { derived, writable } from "svelte/store";
import type { Stats } from "../types/stats";
import {
    getEmptyCategoriesItems,
    getEmptyCategoriesItemsArr,
    type ItemCategory,
    type Items,
    type Panoplies,
    type Panoply,
} from "../types/item";
import { getLeveledStats, type CharacterBuild } from "../types/build";
import { getPanoply } from "../logic/frontendDB";
import {
    calculateAllItemsToDisplay,
    calculateItemsToDisplay,
    calculatePanopliesToDisplay,
} from "../logic/display";
import type { CountryCode, Translations } from "../types/language";

export const lang = writable<CountryCode>("en");

import en from "../lib/i18n/en";
import fr from "../lib/i18n/fr";
import pt from "../lib/i18n/pt";
import de from "../lib/i18n/de";
import es from "../lib/i18n/es";
import { checkWeightUpdate } from "../types/statWeights";

const translations: Translations = { en, fr, pt, de, es };
export const words = derived(lang, ($lang) => translations[$lang]);

// export const distanceFromBestRatio = writable<number>(3);
export const panoplyDisplaySize = writable<number>(20);
export const categoryDisplaySize = writable<Record<ItemCategory, number>>({
    amulet: 15,
    belt: 15,
    boots: 15,
    cloak: 15,
    dofus: 15,
    ring: 15,
    hat: 15,
    pet: 15,
    weapon: 15,
    shield: 15,
});
export const showBonusPanoCappedItems = writable<boolean>(true);
export const sortBestItemsWithPanoValue = writable<boolean>(true);
export const showOnlySelectedPanos = writable<boolean>(false);

export const weights = writable<Partial<Stats>>({});
export const automaticWeights = writable<boolean>(true);
// export const globalElementalDefense = writable<number>();

weights.subscribe((value) => {
    checkWeightUpdate(value);
});
// weights.subscribe(($weights) => {
//     checkWeightUpdate($weights, "http://localhost:5173/");
// });

export const minStats = writable<Partial<Stats>>({
    ap: 11,
    mp: 5,
    // range: 0,
});
export const maxStats = writable<Partial<Stats>>({
    ap: 12,
    mp: 6,
    range: 6,
    summon: 6,
    criticalChance: 95,
    neutralResistPer: 50,
    airResistPer: 50,
    fireResistPer: 50,
    earthResistPer: 50,
    waterResistPer: 50,
});
export const exoAp = writable<boolean>(false);
export const exoMp = writable<boolean>(false);
export const exoRange = writable<boolean>(false);
export const exoSummon = writable<boolean>(false);
export const level = writable<number>(200);

export const preStats = derived(
    [level, exoAp, exoMp, exoRange, exoSummon],
    ([$level, $exoAp, $exoMp, $exoRange, $exoSummon]) => {
        let preStats = getLeveledStats($level);
        if ($exoAp) {
            preStats.ap!++;
        }
        if ($exoMp) {
            preStats.mp!++;
        }
        if ($exoRange) {
            preStats.range!++;
        }
        if ($exoSummon) {
            preStats.summon!++;
        }
        return preStats;
    },
);

export const items = writable<Items>({});
export const panoplies = writable<Panoplies>({});

export const itemsCategory = writable(getEmptyCategoriesItemsArr());
export const itemsCategoryBest = writable(getEmptyCategoriesItemsArr());
export const itemsCategoryWithPanoBest = writable(getEmptyCategoriesItemsArr());

export const itemsCategoryDisplayed = writable(getEmptyCategoriesItemsArr());

export const itemsSelected = writable(getEmptyCategoriesItems());

export const categoryBestValue = writable<Record<ItemCategory, number>>();

export const panopliesBest = writable<Panoply[]>([]);
// export const panopliesDisplayed = writable<Panoply[]>([]);

// export const progress = writable<number>(0);

export const bestBuilds = writable<CharacterBuild[]>([]);
export const bestBuildsDisplayed = writable<CharacterBuild[]>([]);
export const bestBuildShownCount = writable<number>(10);

export const totalPossibilities = derived(itemsSelected, ($itemsCategory) => {
    let possibilities = 1;
    for (const [category, items] of Object.entries($itemsCategory)) {
        let count = Object.values(items).length;
        if (category == "ring") {
            count = (count * (count - 1)) / 2;
        }
        if (category == "dofus") {
            count =
                (count * (count - 1) * (count - 2) * (count - 3) * (count - 4) * (count - 5)) / 720;
        }

        possibilities *= count == 0 ? 1 : count;
    }
    return possibilities;
});

export const panopliesSelected = derived(itemsSelected, ($itemsCategory) => {
    // const panoplies: Panoply[] = [];
    const panoplies: Panoplies = {};
    for (const items of Object.values($itemsCategory)) {
        for (const item of Object.values(items)) {
            if (item.panoply && !panoplies[item.panoply]) {
                panoplies[item.panoply] = getPanoply(item.panoply);
            }
        }
    }
    return Object.values(panoplies);
});
export const panopliesDisplayed = writable<Panoply[]>([]);
// export const panopliesDisplayed = derived(
//     [panopliesBest, panopliesSelected],
//     ([$panopliesBest, $panopliesSelected]) =>
//         calculatePanopliesToDisplay($panopliesBest, $panopliesSelected),
// );

sortBestItemsWithPanoValue.subscribe(() => {
    calculateAllItemsToDisplay();
});
showBonusPanoCappedItems.subscribe(() => {
    calculateItemsToDisplay("dofus");
});
categoryDisplaySize.subscribe(() => {
    calculateAllItemsToDisplay();
});
