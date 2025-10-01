import { writable } from "svelte/store";
import type { Stats } from "../types/stats";
import {
    getEmptyCategoriesItems,
    getEmptyCategoriesItemsArr,
    type Items,
    type Panoplies,
    type Panoply,
} from "../types/item";

export const distanceFromBestRatio = writable<number>(1.5);
export const maxBestResults = writable<number>(10);

export const weights = writable<Partial<Stats>>({});
export const minStats = writable<Partial<Stats>>({});
export const maxStats = writable<Partial<Stats>>({});

export const preStats = writable<Partial<Stats>>({
    AP: 7,
    MP: 3,
    health: 2000,
    pods: 2000,
});

export const items = writable<Items>({});
export const panoplies = writable<Panoplies>({});

export const itemsCategory = writable(getEmptyCategoriesItemsArr());
export const itemsCategoryBest = writable(getEmptyCategoriesItemsArr());
export const itemsCategoryWithPanoBest = writable(getEmptyCategoriesItemsArr());
export const itemsCategoryToCalculate = writable(getEmptyCategoriesItems());

export const panopliesBest = writable<Panoply[]>([]);
export const panopliesToCalculate = writable<Panoply[]>([]);
