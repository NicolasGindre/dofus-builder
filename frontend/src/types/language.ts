import type { ItemCategory } from "./item";
import type { StatKey } from "./stats";

export const LANGUAGES = ["en", "fr", "pt", "es", "de"];

export type CountryCode = (typeof LANGUAGES)[number];

export type Translations = Record<CountryCode, any & StatsTranslation & CategoryTranslation>;

export type StatsTranslation = {
    stats: Record<StatKey, string>;
};

export type CategoryTranslation = {
    category: Record<ItemCategory, string>;
};
