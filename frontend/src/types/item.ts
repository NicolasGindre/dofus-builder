import type { MinRequirement } from "../workers/orchestrator";
import type { StatKey, Stats } from "./stats";

export const ITEM_CATEGORIES = [
    "amulet",
    "ring",
    "hat",
    "cloak",
    "belt",
    "boots",
    "weapon",
    "shield",
    "pet",
    "dofus",
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export type Item = {
    id: string;
    idDofusDB: string;
    idDofusBook: number;
    level: number;
    name: Name;
    requirements?: Requirement[][]; // []and -> []or
    minRequirement?: MinRequirement;
    panoply?: string;
    category: ItemCategory;
    stats: ItemStats;
    statsWithBonus: ItemStats;
    value: number;
    valueWithPano: number;
};
export type Name = {
    fr: string;
    en: string;
    de: string;
    pt: string;
    es: string;
};
export type Requirement = {
    type: string;
    stat: StatKey | string;
    value: number;
};
export type ItemStats = Partial<Stats>;

export type Items = Record<string, Item>;

export type CategoryItems = Record<ItemCategory, Items>;

export type CategoryItemsArr = Record<ItemCategory, Item[]>;

export type Panoply = {
    id: string;
    name: Name;
    level: number;
    items: string[];
    itemsReal: Item[];
    stats: ItemStats[];
    statsWithBonus: ItemStats[];
    value: number[];
    valuePerItem: number;
    avgRelativeValue: number;
};
export type Panoplies = Record<string, Panoply>;

export function getEmptyCategoriesItems(): Record<ItemCategory, Items> {
    return Object.fromEntries(ITEM_CATEGORIES.map((cat) => [cat, {}])) as CategoryItems;
}
export function getEmptyCategoriesItemsArr(): Record<ItemCategory, Item[]> {
    return Object.fromEntries(
        ITEM_CATEGORIES.map((cat) => [cat, [] as Item[]]),
    ) as CategoryItemsArr;
}

export function sumStats(items: Item[]): ItemStats {
    const sumStats: ItemStats = {};
    for (const item of items) {
        for (const [statKey, statValue] of Object.entries(item.stats)) {
            sumStats[statKey as keyof Stats] = (sumStats[statKey as keyof Stats] ?? 0) + statValue;
        }
    }
    return sumStats;
}

export function sumStatsWithBonus(items: Item[]): ItemStats {
    const sumStatsWithBonus: ItemStats = {};
    for (const item of items) {
        for (const [statKey, statValue] of Object.entries(item.statsWithBonus)) {
            sumStatsWithBonus[statKey as keyof Stats] =
                (sumStatsWithBonus[statKey as keyof Stats] ?? 0) + statValue;
        }
    }
    return sumStatsWithBonus;
}

// export function getBiggestCategory(itemsCategory: Record<ItemCategory, Items>): ItemCategory {
//     let biggestCatCount = -1;
//     let biggestCat: ItemCategory = "ring";
//     for (const [category, items] of Object.entries(itemsCategory)) {
//         const categoryLength = Object.keys(items).length;
//         if (categoryLength > biggestCatCount) {
//             biggestCatCount = categoryLength;
//             biggestCat = category as ItemCategory;
//         }
//     }
//     return biggestCat;
// }
