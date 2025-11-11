import {
    type Item,
    type Items,
    type ItemCategory,
    type Panoplies,
    ITEM_CATEGORIES,
} from "../../shared/types/item";
import * as dofusDB from "../clients/dofusDB";
import { sortItemsIds } from "./base62inc";

const dbPath = "./src/db/data";

export let itemsCategory: Record<ItemCategory, Items> = getEmptyItemsCategory();

function getEmptyItemsCategory(): Record<ItemCategory, Items> {
    return Object.fromEntries(ITEM_CATEGORIES.map((cat) => [cat, {}])) as Record<
        ItemCategory,
        Items
    >;
}

export let itemsCategoryFiltered: Record<ItemCategory, Items> = Object.fromEntries(
    ITEM_CATEGORIES.map((cat) => [cat, {}]),
) as Record<ItemCategory, Items>;

export let itemsDB: Items = {};
export let itemsFiltered: Items = {};
export let panoplies: Panoplies = {};

export function getItem(id: string): Item | undefined {
    return itemsDB[id];
}
// export function getItemFromShortId(shortId: string): Item | undefined {
//     for (const item of Object.values(itemsDB)) {
//         if (item.idShort == shortId) {
//             return item;
//         }
//     }
//     return undefined;
// }

export function getItemFromNameFrench(nameFr: string, category: ItemCategory): Item | undefined {
    for (const item of Object.values(itemsCategory[category])) {
        if (item.name.fr == nameFr) {
            return item;
        }
    }
    return undefined;
}

export function getAllItems(): Items {
    return itemsDB;
}
export function getAllPanoplies(): Panoplies {
    return panoplies;
}

export async function loadItemsAndPanos(): Promise<void> {
    panoplies = await Bun.file(`${dbPath}/panoplies.json`).json();

    for (const category of ITEM_CATEGORIES) {
        const itemsCategoryDB: Items = await Bun.file(`${dbPath}/${category}.json`).json();

        for (const [itemId, item] of Object.entries(itemsCategoryDB)) {
            // if (item.level >= levelMin && item.level <= levelMax) {
            // itemsFiltered[itemName] = item
            itemsCategory[category][itemId] = item;
            // }
            itemsDB[itemId] = item;
        }

        console.log("Loaded " + Object.keys(itemsCategory[category]).length + " " + category);
    }
    console.log("Loaded " + Object.keys(itemsDB).length + " items");
}
export function filterPanoplies(panopliesToFilter: string[]) {
    for (const panoplyName of panopliesToFilter) {
        const panoply = panoplies[panoplyName];
        if (panoply == undefined) {
            console.log("can't filter panoply");
            continue;
        }
        filterItems(panoply.items);
    }
}

export function filterCategoryItems(itemsToFilter: Partial<Record<ItemCategory, Array<string>>>) {
    for (const items of Object.values(itemsToFilter)) {
        filterItems(items);
    }
}

export function filterItems(itemsToFilter: string[]) {
    // itemsFiltered = {};
    // itemsCategoryFiltered = {}
    // for (const category of ITEM_CATEGORIES) {
    // for (const [category, items] of Object.entries(itemsCategory) as [ItemCategory, Items][]) {
    for (const itemId of itemsToFilter) {
        // console.log(itemName);
        const item = getItem(itemId);
        if (item == undefined) {
            console.log("can't filter item");
            continue;
        }
        itemsFiltered[itemId] = item;
        itemsCategoryFiltered[item.category][itemId] = item;
    }
    // console.log(itemsFiltered);
    // console.log(itemsCategoryFiltered);
    // }
}

export function logFilteredItems() {
    for (const [category, items] of Object.entries(itemsCategoryFiltered)) {
        for (const itemId of Object.keys(items)) {
            console.log(category, itemId);
        }
    }
}

export async function saveAllItems() {
    for (const [category, items] of Object.entries(itemsCategory)) {
        await saveItems(category as ItemCategory, items);
    }
}

export async function saveItems(
    category: ItemCategory,
    items: Record<string, Item>,
): Promise<void> {
    await Bun.write(`${dbPath}/${category}.json`, JSON.stringify(items, null, 2));
}

export async function savePanoplies(panoplies: Panoplies): Promise<void> {
    await Bun.write(`${dbPath}/panoplies.json`, JSON.stringify(panoplies, null, 2));
}

export async function downloadItems(): Promise<void> {
    console.log("Starting download from DofusDB");

    let newItemsDB: Items = {};
    for (const category of ITEM_CATEGORIES) {
        let newItemsCategory: Record<string, Item> = {};
        const itemsDofusDB = await dofusDB.downloadItems(category);

        for (const [dofusDBId, dofusDBitem] of Object.entries(itemsDofusDB)) {
            newItemsCategory[dofusDBId] = dofusDBitem;
            newItemsDB[dofusDBId] = dofusDBitem;
        }

        itemsCategory[category] = newItemsCategory;
        saveItems(category, newItemsCategory);
    }
    itemsDB = newItemsDB;
}

export async function downloadPanoplies(): Promise<void> {
    panoplies = await dofusDB.downloadPanopliesStats();

    fillPanopliesItems();
    savePanoplies(panoplies);
    console.log("Downloaded items and panoplies from DofusDB");
}

export function fillPanopliesItems() {
    for (const [itemId, item] of Object.entries(itemsDB)) {
        if (item.panoply != undefined) {
            if (panoplies[item.panoply] != undefined) {
                panoplies[item.panoply]!.items.push(itemId);
            } else {
                console.error("couldn't find matching panoply from item", item.name.fr);
            }
        }
    }
    sortPanopliesItems();
    addPanopliesLevel();
}

export function sortPanopliesItems() {
    for (const pano of Object.values(panoplies)) {
        pano.items = sortItemsIds(pano.items);
    }
}
export function addPanopliesLevel() {
    for (const pano of Object.values(panoplies)) {
        for (const itemId of pano.items) {
            const itemLevel = itemsDB[itemId]!.level;
            if (itemLevel > (pano.level ?? 0)) {
                pano.level = itemLevel;
            }
        }
    }
}
