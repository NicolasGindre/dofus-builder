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

export type SubCategory = (typeof SUB_CATEGORIES)[number];
export const SUB_CATEGORIES = [
    "amulet",
    "belt",
    "boots",
    "cloak",
    "dofus",
    "trophy",
    "ring",
    "hat",
    "shield",

    "hammer",
    "scythe",
    "lance",
    "bow",
    "sword",
    "staff",
    "dagger",
    "axe",
    "shovel",
    "wand",
    "pickaxe",

    "pet",
    "dragoturkey", // mount
    "rhineetle", // volkorne petsmount ?
    "seemyool", // petsmount ?
    "petmount", // montilier
] as const;

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
    subCategory: SubCategory;
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

export const REQUIREMENT_TYPE = [
    "lessThan",
    "moreThan",
    "lessThanOrEquals",
    "moreThanOrEquals",
] as const;
export type RequirementType = (typeof REQUIREMENT_TYPE)[number];
export type Requirement = {
    type: RequirementType;
    stat: StatKey | "level" | "panopliesBonus";
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
    bestComboValue: number[];
    requirements?: Requirement[][][]; // []and -> []or
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
