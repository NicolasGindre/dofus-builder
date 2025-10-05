import type { Stats } from "./character";

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
    // value : number | undefined
    panoply?: string;
    category: ItemCategory;
    stats: ItemStats;
};
export type Requirement = {
    type: string;
    value?: number;
    apValue?: number;
    mpValue?: number;
};
export type ItemStats = Partial<Stats>;

export type Items = Record<string, Item>;

export type Panoply = {
    name: string;
    items: string[];
    stats: ItemStats[];
};
export type Panoplies = Record<string, Panoply>;
