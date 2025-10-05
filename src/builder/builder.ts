import {
    type Character,
    type Build,
    type Stats,
    calculateStats,
    BUILD_SLOTS,
    SLOT_TO_CATEGORY,
    type BuildSlots,
} from "../types/character";
import * as itemDB from "../db/itemDB";
import {
    type Item,
    type Items,
    type ItemCategory,
    type Panoply,
    type Panoplies,
    ITEM_CATEGORIES,
} from "../types/item";
import {
    calculateStatsValue,
    calculateCharStatsValue,
    calculatePanoplyValue,
    calculateItemValue,
} from "./value";
import { record } from "zod/v4";

type BestBuildsData = {
    processed: number;
    bestValue: number;
    bestBuilds: Record<string, number>;
};

const levelMin = 1;
const levelMax = 200;
const distanceFromBestRatio = 1.5;
const maxBestItems = 40;
// const minBestItems = 5;

const baseStats: Partial<Stats> = {
    ap: 7,
    mp: 3,

    health: 2000,
    pods: 2000,
};

const minStats: Partial<Stats> = {
    ap: 10,
    mp: 4,
    range: 2,
    // summon: 0,
    // lock: 60,
};
const maxStats: Partial<Stats> = {
    ap: 10,
    mp: 4,
    range: 6,
    lock: 100,
    neutralResistPer: 46,
    airResistPer: 46,
    fireResistPer: 46,
    waterResistPer: 46,
    earthResistPer: 46,
    criticalChance: 65,
};
const itemsToCheck: Partial<Record<ItemCategory, Array<string>>> = {
    pet: [
        "Bwak de Feu",
        "Bwak d'Eau",
        "Bwak d'Air",
        "Bwak de Terre",
        "Croum",
        "El Scarador",
        // "Bouflux",
        "Volkorne Jade et Turquoise",
        "Volkorne Rubis et Turquoise",
        "Volkorne Saphir et Turquoise",
        "Volkorne Améthyste et Turquoise",
        // "Microsmoglob",
    ],
    boots: ["Bottes Trithon"],
    ring: ["Alliance Gloursonne", "Bague Trithon"],
    shield: ["Bouclier de Solar", "Bouclier d'Ilyzaelle", "Roncier", "Bouclier cubiste"],
    hat: ["Casque Dragoeuf"],
    amulet: ["Amulette Ementaire Deluxe"],
    weapon: ["Masse Étacée", "Arc Honte", "Hache Ériphe"],
    cloak: ["Capchalot", "Voile d'encre"],
};
const panopliesToCheck: Array<string> = [
    "Panoplie Lunatique",
    // "Panoplie Rhoarim",
    // "Panoplie de la Baleine",
    // "Panoplie du Cœur Vaillant",
    // "Panoplie du Bonimenteur",
    "Panoplie de Kongoku",
    "Panoplibou",
    "Panoplie des Abysses",
    "Harpinoplie",
    // "Panoplie de Gargandyas",
    "Panoplie de Voldelor",
    "Panoplie de la Déchireuse",
    "Panoplie Luminescente",
    // "Panoplie des Marteaux-Aigris",
    // "Panoplie de Wulan",
    "Panoplie d'Anerice",
    // "Panoplie de l'Œil Putride",
    // "Panoplie du Cœur Saignant",
    // "Panoplie du Strigide",
    "Panoplie des Chocomanciens",
    // "Panoplie de la Dame du Hasard",
    // "Panoplie Volkorne",
    // "Panoplie du Chalœil",
    // "Panoplie de Léthaline Sigisbul",
    // "Panoplie de Servitude",
    "Panoplie Possédée",
    // "Panoplie Pnose",
    // "Panoplie du Cartographe",

    // "Panoplie Trithon",
    // "Panoplie d'Atcham",
    "Panoplie Volcanique",
    // "Panoplie du Cycloïde",
];

export async function calculateBestBuilds(): Promise<void> {
    // await itemDB.loadItems(levelMin, levelMax);
    // await calculateBestItems();

    itemDB.filterCategoryItems(itemsToCheck);
    itemDB.filterPanoplies(panopliesToCheck);
    // itemDB.logFilteredItems();
    // console.log(itemDB.itemsCategoryFiltered);
    // let build: Build = {
    //     // hat: itemDB.getItem("Coiffe du Meulou"),
    //     // amulet: itemDB.getItem("Talisman Songe"),
    //     // ring1: itemDB.getItem("Bague Trithon"),
    //     ring2: itemDB.getItem("Gelano"),
    //     shield: itemDB.getItem("Bouclier Terrdala"),
    //     weapon: itemDB.getItem("Sabre Sandanwa"),
    //     // belt: itemDB.getItem("Cape Ovri"),
    //     // cloak: itemDB.getItem("Cape des Justiciers"),
    //     // boots: itemDB.getItem("Bottes Trithon"),
    // }
    // Sacri
    // let build: Build = {
    //     // hat: itemDB.getItem("Coiffe du Meulou"),
    //     // amulet: itemDB.getItem("Talisman Songe"),
    //     ring1: itemDB.getItem("Bague Trithon"),
    //     // ring2: itemDB.getItem("Gelano"),
    //     shield: itemDB.getItem("Trompe-la-Mort"),
    //     // weapon: itemDB.getItem("Masse Étacée"),
    //     // belt: itemDB.getItem("Ceintacé"),
    //     // cloak: itemDB.getItem("Cape des Justiciers"),
    //     // boots: itemDB.getItem("Bottes Trithon"),
    // };
    // Zobal
    let build: Build = {
        hat: itemDB.getItem("Casque Dragoeuf"),
        // amulet: itemDB.getItem("Talisman Songe"),
        ring2: itemDB.getItem("Bracelet Jande"),
        // ring2: itemDB.getItem(""),
        // shield: itemDB.getItem(""),
        // weapon: itemDB.getItem(""),
        // belt: itemDB.getItem("Cape Ovri"),
        // cloak: itemDB.getItem(""),
        // boots: itemDB.getItem("Bottes Trithon"),
    };

    const emptySlots = BUILD_SLOTS.filter((slot) => !build[slot]);
    console.log(emptySlots);

    // let slotToItems: Partial<Record<BuildSlots, Items>> = {}

    // if (build.ring1 == undefined && build.ring2 == undefined) {
    //     const rings = Object.entries(itemDB.itemsCategoryFiltered.ring)
    //     const halfIndex = Math.floor(rings.length / 2)
    //     const halfItems = rings.slice(0, halfIndex)
    //     const otherHalfItems = rings.slice(halfIndex)
    //     slotToItems.ring1 = Object.fromEntries(halfItems)
    //     slotToItems.ring2 = Object.fromEntries(otherHalfItems)
    // }

    let combination = 1;
    for (const slot of emptySlots) {
        const category = SLOT_TO_CATEGORY[slot];
        const itemsNumber = Object.keys(itemDB.itemsCategoryFiltered[category]).length;
        console.log(category, itemsNumber);
        if (itemsNumber > 0) combination *= itemsNumber;
    }
    if (emptySlots.includes("ring1") && emptySlots.includes("ring2")) {
        const R = Object.keys(itemDB.itemsCategoryFiltered.ring).length;
        combination = (combination / (R * R)) * ((R * (R - 1)) / 2);
    }
    console.log(
        new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(
            combination,
        ),
        "combinations",
    );

    // let bestValue = 0
    // let processed = 0
    let bestBuildsData: BestBuildsData = {
        processed: 0,
        bestValue: 0,
        bestBuilds: { emptyBuild: 0 },
    };

    generateBuilds(emptySlots, build, baseStats, bestBuildsData);

    const sortedEntries = Object.entries(bestBuildsData.bestBuilds).sort(([, a], [, b]) => b - a);

    console.log(sortedEntries);

    // for (const _ of ) {
    // }
}

function generateBuilds(
    slots: BuildSlots[],
    currentBuild: Build = {},
    baseStats: Partial<Stats>,
    bestBuildsData: BestBuildsData,
    slotIndex = 0,
) {
    const slot = slots[slotIndex];
    if (slot == undefined) {
        checkBuildValue(currentBuild, baseStats, bestBuildsData);
        return;
    }
    const category = SLOT_TO_CATEGORY[slot];
    const items = itemDB.itemsCategoryFiltered[category];

    if (!items || Object.keys(items).length === 0) {
        generateBuilds(slots, currentBuild, baseStats, bestBuildsData, slotIndex + 1);
        return;
    }

    // console.log(`Slot: ${slot}, Category: ${category}, Items: ${Object.values(items).length}`)
    for (const item of Object.values(items)) {
        if (slot == "ring2" && currentBuild.ring1) {
            if (currentBuild.ring1.name >= item.name) {
                console.log(currentBuild.ring1.name);
                console.log(item.name);
                continue;
            }
        }
        currentBuild[slot] = item;
        bestBuildsData.processed++;
        generateBuilds(slots, currentBuild, baseStats, bestBuildsData, slotIndex + 1);
        // delete currentBuild[slot] // backtrack
    }
}

function checkBuildValue(
    currentBuild: Build,
    baseStats: Partial<Stats>,
    bestBuildsData: BestBuildsData,
) {
    const stats = calculateStats(baseStats, currentBuild);
    const value = calculateCharStatsValue(stats, minStats, maxStats);
    // console.log(value)

    let itemIsBetter = false;
    for (const allBestValue of Object.values(bestBuildsData.bestBuilds)) {
        if (value > allBestValue) {
            itemIsBetter = true;
            break;
        }
    }
    if (itemIsBetter) {
        let bestBuildStr = "";
        for (const [slot, item] of Object.entries(currentBuild)) {
            // const currentItem = build[currentSlot]
            bestBuildStr = `${bestBuildStr} | ${slot}: ${item.name}`;
        }
        // console.log(bestBuildStr)
        // console.log(`Value : ${value}. Best value : ${bestBuildsData.bestValue}. Processed : ${bestBuildsData.processed} builds`)

        bestBuildsData.bestBuilds[bestBuildStr] = value;

        if (Object.keys(bestBuildsData.bestBuilds).length > 20) {
            let worstValue = 999999999;
            let worstBuild = "";
            for (const [buildName, allWorstValue] of Object.entries(bestBuildsData.bestBuilds)) {
                if (allWorstValue < worstValue) {
                    worstValue = allWorstValue;
                    worstBuild = buildName;
                }
            }
            delete bestBuildsData.bestBuilds[worstBuild];
        }

        if (value > bestBuildsData.bestValue) {
            bestBuildsData.bestValue = value;
        }
        // console.log(bestBuildsData.bestBuilds)
        // process.stdout.write(bestBuildsData.bestBuilds.toString())
        // console.log(`Value : ${value}. Best value : ${bestBuildsData.bestValue}. Processed : ${bestBuildsData.processed} builds`)
    }
}

export async function calculateBestItems(): Promise<void> {
    // await itemDB.loadItems(levelMin, levelMax);

    for (const [category, items] of Object.entries(itemDB.itemsCategory)) {
        let bestItems: Record<string, number> = {};
        let bestValueFound: number = 0;

        for (const [itemName, item] of Object.entries(items)) {
            const itemValue = calculateItemValue(item);

            if (
                itemValue * distanceFromBestRatio >=
                bestValueFound
                // Object.keys(bestItems).length < minBestItems
            ) {
                bestItems[itemName] = itemValue;
                if (itemValue > bestValueFound) {
                    bestValueFound = itemValue;

                    for (const [name, value] of Object.entries(bestItems)) {
                        if (value * distanceFromBestRatio < bestValueFound) {
                            delete bestItems[name];
                        }
                    }
                    // console.log(itemName, item.stats)
                    // console.log(itemName, item.stats)
                }
            }
        }

        const sortedEntries = Object.entries(bestItems)
            .sort(([, a], [, b]) => b - a)
            .slice(0, maxBestItems);
        console.log(category, sortedEntries.length);
        console.log(sortedEntries);
        // for (const [name, value] of Object.entries(bestItems)) {
        //     console.log(itemName, item.stats)
        // }
        const itemsString: string[] = sortedEntries.map(([key]) => key);
        // console.log(itemsString);
        // itemDB.filterItems(itemsString);
    }
}
export async function calculateBestPanoplies(): Promise<void> {
    // await itemDB.loadItems(levelMin, levelMax);

    let bestPanoplies: Record<string, number> = {};
    let bestValueFound: number = 0;
    for (const [panoplyName, panoply] of Object.entries(itemDB.panoplies)) {
        const panoValue = calculatePanoplyValue(panoply);

        if (panoValue * distanceFromBestRatio >= bestValueFound) {
            bestPanoplies[panoplyName] = panoValue;
            if (panoValue > bestValueFound) {
                bestValueFound = panoValue;

                for (const [name, value] of Object.entries(bestPanoplies)) {
                    if (value * distanceFromBestRatio < bestValueFound) {
                        delete bestPanoplies[name];
                    }
                }
            }
        }
    }
    // console.log(bestPanoplies);

    const sortedEntries = Object.entries(bestPanoplies)
        .sort(([, a], [, b]) => b - a)
        .slice(0, maxBestItems);
    // console.log(category, sortedEntries.length);
    console.log(sortedEntries);
    // for (const [name, value] of Object.entries(bestItems)) {
    //     console.log(itemName, item.stats)
    // }
    const itemsString: string[] = sortedEntries.map(([key]) => key);
    // console.log(itemsString);
    // itemDB.filterItems(itemsString);
}
