import type { StatKey, Stats } from "./stats";

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
    idDofusDB: number;
    idDofusBook: number;
    level: number;
    name: Name;
    requirements?: Requirement[][]; // []and -> []or
    minRequirement?: MinRequirement;
    criterions?: string;
    panoply?: string;
    category: ItemCategory;
    subCategory: SubCategory;
    stats: ItemStats;
    weaponEffect?: SpellEffect;
    specialEffect?: SpecialEffect;
};

export const MIN_REQUIREMENT_TYPE = [
    "apLessThanOrMpLessThan",
    "apLessThanAndMpLessThan",
    "apLessThan",
    "mpLessThan",
] as const;
export type MinRequirementType = (typeof MIN_REQUIREMENT_TYPE)[number] | string;
export type MinRequirement = {
    type: string;
    value: number;
    value2?: number;
};

export type SpecialEffect = {
    name: Name;
    description: Name;
};

export type Name = {
    fr: string;
    en: string;
    de: string;
    pt: string;
    es: string;
};

export const ELEMENT = [
    "neutral",
    "fire",
    "earth",
    "water",
    "air",
    "bestElem",

    "mpReduce",
    "apReduce",

    "pull",
    "push",
] as const;
export type Element = (typeof ELEMENT)[number];

export const EFFECT_TYPE = ["damage", "steal", "heal", "pull", "push", "other"] as const;
export type EffectType = (typeof EFFECT_TYPE)[number];
export type SpellEffect = {
    name?: string;
    cost: number;
    critChance: number;
    effects: SpellEffectLine[];
};
export type SpellEffectLine = {
    type: EffectType;
    element: Element;
    min: number;
    max: number;
    minCrit?: number;
    maxCrit?: number;
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

export type Panoply = {
    id: string;
    idDofusDB: number;
    name: Name;
    level: number;
    items: string[];
    stats: ItemStats[];
    requirements?: Requirement[][][]; // []and -> []or
};
export type Panoplies = Record<string, Panoply>;
