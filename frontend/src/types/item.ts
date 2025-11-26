import {
    ITEM_CATEGORIES,
    type Item as BaseItem,
    type Panoply as BasePanoply,
    type ItemCategory,
    type ItemStats,
} from "../../../shared/types/item";
import type { Stats } from "../../../shared/types/stats";

export type Item = Omit<BaseItem, "criterions"> & {
    statsWithBonus: ItemStats;
    value: number;
    valueWithPano: number;
};

export type Items = Record<string, Item>;

export type CategoryItems = Record<ItemCategory, Items>;
export type CategoryItemsArr = Record<ItemCategory, Item[]>;

export type Panoply = BasePanoply & {
    itemsReal: Item[];
    statsWithBonus: ItemStats[];
    value: number[];
    bestValuePerItem: number;
    bestRelativeValue: number;
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
