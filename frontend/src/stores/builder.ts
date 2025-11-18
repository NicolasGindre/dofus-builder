import { derived, get, writable, type Readable } from "svelte/store";
import {
    getEmptyCategoriesItems,
    getEmptyCategoriesItemsArr,
    type Items,
    type Panoplies,
    type Panoply,
} from "../types/item";
import { getLeveledStats, type Build } from "../types/build";
import { getPanoply, saveBuildsStorage, saveSearchStorage } from "../logic/frontendDB";
import {
    calculateAllItemsToDisplay,
    calculateBuildToDisplay,
    calculateItemsToDisplay,
    calculateSelectedItemsToDisplay,
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
import { refreshBuildsValue, totalCombinations, updateBestBuildsNames } from "../logic/build";
import { convertToMinItems, type MinItem } from "../workers/orchestrator";
import type { ItemCategory } from "../../../shared/types/item";
import type { StatKey, Stats } from "../../../shared/types/stats";

// export const appReady = writable<boolean>(false);

const translations: Translations = { en, fr, pt, de, es };
export const words = derived(lang, ($lang) => translations[$lang]);

export const urlHash = writable<string>("");
export const previousStatsSearch = writable<string>("");
export const savedSearch = writable<string | undefined>(undefined);
savedSearch.subscribe((savedSearch) => {
    document.title = savedSearch ? `${savedSearch} - Dofus MinMax` : "Dofus MinMax";
});
export const savedSearches = writable<Record<string, string>>({});
savedSearches.subscribe((savedSearches) => {
    saveSearchStorage(savedSearches);
});

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
export const sortBestItemsWithPanoValue = writable<boolean>(false);
export const showOnlySelectedPanos = writable<boolean>(false);

export const showValueAsPercent = writable<boolean>(false);

export const automaticWeights = writable<boolean>(true);
// export const displayedWeights = writable<Partial<Stats>>({});
export const weightsIndex = writable<Partial<Stats>>({});

export const weights: Readable<Partial<Stats>> = derived(weightsIndex, ($weightsIndex) => {
    encodeToUrl();
    refreshBuildsValue();
    return Object.fromEntries(
        Object.entries($weightsIndex).map(([statKey, weightIndex]) => [
            statKey,
            getWeightFromIndex(statKey as StatKey, weightIndex),
        ]),
    );
});

weightsIndex.subscribe(() => {
    checkWeightUpdate();
});

export const minStatsIndex = writable<Partial<Stats>>({});
export const minStats: Readable<Partial<Stats>> = derived(minStatsIndex, ($minStatsIndex) => {
    encodeToUrl();
    refreshBuildsValue();
    return Object.fromEntries(
        Object.entries($minStatsIndex).map(([statKey, minStatsIndex]) => [
            statKey,
            getMinMaxFromIndex(statKey as StatKey, minStatsIndex),
        ]),
    );
});

export const maxStatsIndex = writable<Partial<Stats>>({ ...defaultMaxIndex });
export const maxStats: Readable<Partial<Stats>> = derived(maxStatsIndex, ($maxStatsIndex) => {
    encodeToUrl();
    refreshBuildsValue();
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
// export const exoSummon = writable<boolean>(false);
export const level = writable<number>(200);

export const preStats = derived(
    [level, exoAp, exoMp, exoRange],
    ([$level, $exoAp, $exoMp, $exoRange]) => {
        encodeToUrl();
        refreshBuildsValue();
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
        // if ($exoSummon) {
        //     preStats.summon!++;
        // }
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
export const itemsSelectedDisplayed = writable(getEmptyCategoriesItemsArr());
subscribeWithDelay(
    itemsSelected,
    () => {
        calculateSelectedItemsToDisplay();
    },
    1,
);

export const itemsLocked = writable(getEmptyCategoriesItems());

export const categoryBestValue = writable<Record<ItemCategory, number>>();
export const categoryBestValueWithPano = writable<Record<ItemCategory, number>>();

export const panopliesBest = writable<Panoply[]>([]);

export const bestBuilds = writable<Build[]>([]);
export const buildsDisplayed = writable<Build[]>([]);
export const buildShownCount = writable<number>(10);

export const bestBuildsPage = writable<number>(1);
export const savedBuildsPage = writable<number>(1);

export const showSavedBuilds = writable<boolean>(false);
export const savedBuilds = writable<Build[]>([]);
savedBuilds.subscribe((savedBuilds) => {
    // console.log("Update the view", savedBuilds);
    saveBuildsStorage(savedBuilds);
    // if (get(showSavedBuilds)) {
    updateBestBuildsNames(get(bestBuilds));
    calculateBuildToDisplay();
    // }
});

export const comparedBuild = writable<Build>(undefined);

export const minItems: Readable<MinItem[][]> = derived(
    [itemsSelected, itemsLocked],
    ([$itemsSelected, $itemsLocked], set) => {
        encodeToUrl();
        clearTimeout((minItems as any)._timeout);
        (minItems as any)._timeout = setTimeout(() => {
            set(convertToMinItems($itemsSelected, $itemsLocked));
        }, 1);
    },
);

export const totalPossibilities: Readable<number> = derived(minItems, ($minItems) => {
    return totalCombinations($minItems);
});
export const millionComboPerMin = writable<number>(400);
export const timeEstimated: Readable<number> = derived(
    [totalPossibilities, millionComboPerMin],
    ([$totalPossibilities, $buildsPerMinute]) => {
        return $totalPossibilities / 1000000 / ($buildsPerMinute / 60);
    },
);

export const panopliesSelected = derived(itemsSelected, ($itemsCategory) => {
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

sortBestItemsWithPanoValue.subscribe(() => {
    calculateAllItemsToDisplay();
    calculateSelectedItemsToDisplay();
});
showBonusPanoCappedItems.subscribe(() => {
    calculateItemsToDisplay("dofus");
});
categoryDisplaySize.subscribe(() => {
    calculateAllItemsToDisplay();
});

function subscribeWithDelay<T>(store: Readable<T>, callback: (value: T) => void, delay = 0) {
    let timeoutId: ReturnType<typeof setTimeout>;
    return store.subscribe((value) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback(value), delay);
    });
}
