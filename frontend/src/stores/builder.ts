import { derived, writable, type Readable } from "svelte/store";
import type { StatKey, Stats } from "../types/stats";
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
import { checkWeightUpdate, defaultMaxIndex } from "../types/statWeights";
import {
    getMinMaxFromIndex,
    getWeightFromIndex,
    WEIGHT_ENCODING,
} from "../logic/encoding/valueEncoding";
import { encodeToUrl } from "../logic/encoding/urlEncode";

// export const appReady = writable<boolean>(false);

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

export const automaticWeights = writable<boolean>(true);
// export const displayedWeights = writable<Partial<Stats>>({});
export const weightsIndex = writable<Partial<Stats>>({});

export const weights: Readable<Partial<Stats>> = derived(weightsIndex, ($weightsIndex) => {
    encodeToUrl();
    return Object.fromEntries(
        Object.entries($weightsIndex).map(([statKey, weightIndex]) => [
            statKey,
            getWeightFromIndex(statKey as StatKey, weightIndex),
        ]),
    );
});

weightsIndex.subscribe((value) => {
    checkWeightUpdate(value);
});

export const minStatsIndex = writable<Partial<Stats>>({});
export const minStats: Readable<Partial<Stats>> = derived(minStatsIndex, ($minStatsIndex) => {
    encodeToUrl();
    return Object.fromEntries(
        Object.entries($minStatsIndex).map(([statKey, minStatsIndex]) => [
            statKey,
            getMinMaxFromIndex(statKey as StatKey, minStatsIndex),
        ]),
    );
});

export const maxStatsIndex = writable<Partial<Stats>>(defaultMaxIndex);
export const maxStats: Readable<Partial<Stats>> = derived(maxStatsIndex, ($maxStatsIndex) => {
    encodeToUrl();
    return Object.fromEntries(
        Object.entries($maxStatsIndex).map(([statKey, maxStatsIndex]) => [
            statKey,
            getMinMaxFromIndex(statKey as StatKey, maxStatsIndex),
        ]),
    );
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
    encodeToUrl();
    let possibilities = 1;
    let atLeast1: boolean = false;
    for (const [category, items] of Object.entries($itemsCategory)) {
        let count = Object.values(items).length;
        if (count > 0) {
            atLeast1 = true;
        }
        if (category == "ring") {
            count = (count * (count - 1)) / 2;
        }
        if (category == "dofus") {
            count =
                (count * (count - 1) * (count - 2) * (count - 3) * (count - 4) * (count - 5)) / 720;
        }
        possibilities *= count == 0 ? 1 : count;
    }
    return atLeast1 ? possibilities : 0;
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
