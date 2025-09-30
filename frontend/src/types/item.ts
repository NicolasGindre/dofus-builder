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
    panoply: string | undefined;
    category: ItemCategory;
    stats: ItemStats;
    statsWithBonus: ItemStats;
    value: number;
    valueWithPano: number;
};
export type ItemStats = Partial<Stats>;

export type Items = Record<string, Item>;

export type CategoryItems = Record<ItemCategory, Items>;

export type CategoryItemsArr = Record<ItemCategory, Item[]>;

export type Panoply = {
    name: string;
    items: string[];
    stats: ItemStats[];
    statsWithBonus: ItemStats[];
    value: number;
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
// export const emptyCategoriesItems: Record<ItemCategory, Items> = Object.fromEntries(
//     ITEM_CATEGORIES.map((cat) => [cat, {}]),
// ) as Record<ItemCategory, Items>;

// export const emptyCategoriesItemArr: Record<ItemCategory, Item[]> =
