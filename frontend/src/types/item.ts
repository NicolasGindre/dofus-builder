import type { Stats } from "./stats";

export const ITEM_CATEGORIES = [
    "amulet",
    "belt",
    "boots",
    "cloak",
    "dofus",
    "ring",
    "hat",
    "pet",
    "weapon",
    "shield",
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export type Item = {
    level: number;
    name: string;
    requirement?: Requirement;
    panoply?: string;
    category: ItemCategory;
    stats: ItemStats;
    statsWithBonus: ItemStats;
    value: number;
    valueWithPano: number;
};
export type Requirement = {
    type: string;
    value?: number;
    apValue?: number;
    mpValue?: number;
};
export type ItemStats = Partial<Stats>;

export type Items = Record<string, Item>;

export type CategoryItems = Record<ItemCategory, Items>;

export type CategoryItemsArr = Record<ItemCategory, Item[]>;

export type Panoply = {
    name: string;
    items: string[];
    itemsReal: Item[];
    stats: ItemStats[];
    statsWithBonus: ItemStats[];
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
