import { get } from "svelte/store";
import {
    computeMode,
    dofusVersion,
    items,
    itemsCategory,
    millionComboPerMin,
    panoplies,
    savedBuilds,
    savedSearch,
    savedSearches,
    urlHash,
} from "../stores/storeBuilder";
import {
    getEmptyCategoriesItemsArr,
    type Item,
    type Items,
    type Panoplies,
    type Panoply,
} from "../types/item";
import { getBonusStats } from "../types/stats";
import type { Build } from "../types/build";
import { buildsFromIds } from "./build";
import type { Mode } from "../workers/orchestrator";

let init = false;
const itemsVersionDisplayed = "v3.3.18.17";
const itemsVersion = itemsVersionDisplayed + ".2";

// let last = performance.now();
// setInterval(() => {
//     const now = performance.now();
//     const delta = now - last;
//     last = now;
//     console.log("delta", Math.round(delta));
// }, 100);

export async function loadItemsAndPanos() {
    let itemsUpToDate = false;
    const currItemsVersion = localStorage.getItem("itemsVersion");
    if (currItemsVersion) {
        if (JSON.parse(currItemsVersion) == itemsVersion) {
            itemsUpToDate = true;
        }
    }
    dofusVersion.set(itemsVersionDisplayed);

    const itemsStorage = localStorage.getItem("items");
    // const itemsStorage = false;
    if (itemsStorage && itemsUpToDate) {
        // console.log("Loaded Items From STORAGE");
        items.set(JSON.parse(itemsStorage));
    } else {
        const itemResp = await fetch("/api/items");
        if (!itemResp.ok) throw new Error("Failed to load items");
        const itemsJson = await itemResp.json();
        items.set(itemsJson as Items);
        localStorage.setItem("items", JSON.stringify(itemsJson));
        localStorage.setItem("itemsVersion", JSON.stringify(itemsVersion));
    }

    const panopliesStorage = localStorage.getItem("panoplies");
    // const panopliesStorage = false;
    if (panopliesStorage && itemsUpToDate) {
        // console.log("panopliesStorage", panopliesStorage);
        panoplies.set(JSON.parse(panopliesStorage));
    } else {
        const panopliesResp = await fetch("/api/panoplies");
        if (!panopliesResp.ok) throw new Error("Failed to load panoplies");
        const panopliesJson = await panopliesResp.json();
        panoplies.set(panopliesJson as Panoplies);
        localStorage.setItem("panoplies", JSON.stringify(panopliesJson));
    }

    calculateItemsBonus();
    addPanopliesItemsReal();
    calculatePanopliesBonus();
    fillItemsCategories();
    // convertItemsRequirements();
    // initSavedSearches();
}
export function initFrontendDB() {
    initSavedSearches();
    initSavedBuilds();
    initComputeSpeed();
    init = true;
}

function calculateItemsBonus() {
    for (const item of Object.values(get(items))) {
        item.statsWithBonus = getBonusStats(item.stats);
    }
}

function addPanopliesItemsReal() {
    for (const pano of Object.values(get(panoplies))) {
        pano.itemsReal = [];
        for (const itemId of pano.items) {
            pano.itemsReal.push(getItem(itemId));
        }
    }
}
function calculatePanopliesBonus() {
    for (const pano of Object.values(get(panoplies))) {
        pano.statsWithBonus = [];
        pano.value = [];
        for (const stats of pano.stats) {
            pano.statsWithBonus.push(getBonusStats(stats));
            pano.value.push(0);
        }
        // if (pano.stats.length > 6) {
        //     console.log(pano.stats.length, pano);
        // }
    }
}

function fillItemsCategories() {
    // get(itemsCategory);

    const grouped = getEmptyCategoriesItemsArr();

    for (const item of Object.values(get(items))) {
        grouped[item.category].push(item);
    }
    // console.log("init categories");
    // console.log(grouped);
    itemsCategory.set(grouped);
}

export function getPanoply(id: string): Panoply {
    return get(panoplies)[id]!;
}

export function getItem(id: string): Item {
    return get(items)[id]!;
}

// export function getItemFromShortId(shortId: string): Item | undefined {
//     return Object.values(get(items)).find((item) => item.idShort === shortId);
// }

export function saveSearchStorage(savedSearches: Record<string, string>) {
    try {
        if (!init) {
            return;
        }
    } catch (err) {
        return;
        // console.error(err);
    }
    localStorage.setItem("savedSearches", JSON.stringify(savedSearches));
}

export function initSavedSearches() {
    if (!(window as any).__savedSearchListenerAdded) {
        window.addEventListener("storage", (e) => {
            if (e.key === "savedSearches" && e.newValue) {
                console.log("SAVED SEARCH UPDATE", e.newValue);
                savedSearches.set(JSON.parse(e.newValue));
            }
        });
        (window as any).__savedSearchListenerAdded = true;
    }
    try {
        const raw = localStorage.getItem("savedSearches");
        savedSearches.set(raw ? JSON.parse(raw) : {});
    } catch (err) {
        console.error("init saved builds", err);
    }
}
export function checkHashIsSavedSearch() {
    const hash = get(urlHash);
    for (const [name, search] of Object.entries(get(savedSearches))) {
        if (search == hash) {
            savedSearch.set(name);
            break;
        }
    }
}

export function saveBuildsStorage(savedBuilds: Build[]) {
    try {
        if (!init) {
            return;
        }
    } catch (err) {
        return;
        // console.error(err);
    }
    let savedBuildsStorage: Record<string, string> = {};
    for (const build of savedBuilds) {
        savedBuildsStorage[build.id] = build.name;
    }
    // console.log("savedBuildsStorage", savedBuildsStorage);
    localStorage.setItem("savedBuilds", JSON.stringify(savedBuildsStorage));
}

export function initSavedBuilds() {
    if (!(window as any).__savedBuildListenerAdded) {
        window.addEventListener("storage", (e) => {
            if (e.key === "savedBuilds" && e.newValue) {
                console.log("SAVED BUILD UPDATE", e.newValue);

                const incoming: Record<string, string> = JSON.parse(e.newValue);
                const current = get(savedBuilds);
                const currentRecord: Record<string, string> = Object.fromEntries(
                    current.map((b) => [b.id, b.name]),
                );

                const same =
                    Object.keys(incoming).length === Object.keys(currentRecord).length &&
                    Object.keys(incoming).every((key) => currentRecord[key] === incoming[key]);

                if (same) {
                    return;
                }

                savedBuilds.set(buildsFromIds(JSON.parse(e.newValue)));
                // savedBuilds.update(() => buildsFromIds(JSON.parse(e.newValue ?? "{}")));
            }
        });
        (window as any).__savedBuildListenerAdded = true;
    }
    try {
        const raw = localStorage.getItem("savedBuilds");
        // console.log(raw);
        savedBuilds.set(raw ? buildsFromIds(JSON.parse(raw)) : []);
    } catch (err) {
        console.error("init saved builds", err);
    }
}

export function saveComputeSpeed(millionComboPerMinNew: number) {
    localStorage.setItem("millionComboPerMin", JSON.stringify(millionComboPerMinNew));
    millionComboPerMin.set(millionComboPerMinNew);
}

function initComputeSpeed() {
    try {
        const raw = localStorage.getItem("millionComboPerMin");
        // if(!raw) {
        //     saveComputeSpeed(400)
        // }
        millionComboPerMin.set(raw ? JSON.parse(raw) : 400);
    } catch (err) {
        console.error("init Compute Speed", err);
    }
}

export function saveComputeMode(mode: Mode) {
    localStorage.setItem("computeMode", JSON.stringify(mode));
}

export function initComputeMode() {
    try {
        const raw = localStorage.getItem("computeMode");
        computeMode.set(raw ? JSON.parse(raw) : "cpu");
    } catch (err) {
        computeMode.set("cpu");
    }
}
