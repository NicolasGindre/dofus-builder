import type { ItemCategory, SubCategory } from "../../../shared/types/item";
import type { StatKey } from "../../../shared/types/stats";

export const LANGUAGES = ["en", "fr", "pt", "es", "de"];

export type CountryCode = (typeof LANGUAGES)[number];

export type Translations = Record<
    CountryCode,
    any & StatsTranslation & CategoryTranslation & SubCategoryTranslation
>;

export type StatsTranslation = {
    stats: Record<StatKey, string>;
};

export type CategoryTranslation = {
    category: Record<ItemCategory, string>;
};

export type SubCategoryTranslation = {
    subCategory: Record<SubCategory, string>;
};
