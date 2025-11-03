import { nextValue } from "../../db/base62inc";
import * as itemDB from "../../db/itemDB";
import type { Item, ItemCategory } from "../../types/item";
import type { DofusBookDBIdMap, DofusBookDBNameMap } from "../dofusDB";

const dbPath = "./src/db/data";

const categoryMap: Record<string, ItemCategory> = {
    am: "amulet",
    ce: "belt",
    bo: "boots",
    ca: "cloak",
    do: "dofus",
    tr: "dofus",
    an: "ring",
    ch: "hat",
    br: "shield",
    mo: "pet",
    vo: "pet",
    mu: "pet",
    fa: "pet",
    mt: "pet",
    // W: "weapon",
};

type DofusBookItem = {
    data: {
        id: number;
        official: number;
        level: number;
        category_id: number;
        name: string;
        category_name: string;
        category_type: string;
    }[];
};

const itemsDofusBook: DofusBookItem = await Bun.file(
    `src/clients/dofusBook/merged_items.json`,
).json();
const weaponsDofusBook: DofusBookItem = await Bun.file(
    `src/clients/dofusBook/merged_weapons.json`,
).json();

await itemDB.loadItems();
let dofusMinMaxId = "Z";

let dofusBookDBIdMap: DofusBookDBIdMap = {};
let dofusBookDBNameMap: DofusBookDBNameMap = {};

for (const item of itemsDofusBook.data) {
    const category = categoryMap[item.category_name];
    if (!category) {
        console.error("no matching category", item.name, item.category_name);
        continue;
    }
    // const dbItem = itemDB.itemsCategory[category][item.name]
    let dbItem = itemDB.getItemFromNameFrench(item.name, category);
    if (!dbItem) {
        console.error("no matching item", item.name, item.category_name);
        continue;
    }
    dbItem.idDofusBook = item.official;
    dofusMinMaxId = nextValue(dofusMinMaxId);

    dofusBookDBIdMap[dbItem.idDofusDB] = {
        id: dofusMinMaxId,
        dofusBookId: item.official,
        name: item.name,
    };
    dofusBookDBNameMap[item.name] = {
        id: dofusMinMaxId,
        dofusDBId: dbItem.id,
        dofusBookId: item.id,
    };
}

for (const item of weaponsDofusBook.data) {
    const category: ItemCategory = "weapon";
    let dbItem = itemDB.getItemFromNameFrench(item.name, category);
    if (!dbItem) {
        console.error("no matching item", item.name, item.category_name);
        continue;
    }
    dbItem.idDofusBook = item.official;
    dofusMinMaxId = nextValue(dofusMinMaxId);

    dofusBookDBIdMap[dbItem.idDofusDB] = {
        id: dofusMinMaxId,
        dofusBookId: item.official,
        name: item.name,
    };
    dofusBookDBNameMap[item.name] = {
        id: dofusMinMaxId,
        dofusDBId: dbItem.id,
        dofusBookId: item.id,
    };
}

for (const [category, items] of Object.entries(itemDB.itemsCategory)) {
    for (const item of Object.values(items)) {
        if (!item.idDofusBook) {
            console.log("item didn't have a dofusbook ID", item.name.fr);
        }
    }
}

await itemDB.saveAllItems();
await Bun.write(`${dbPath}/dofusBookMap/idMap.json`, JSON.stringify(dofusBookDBIdMap, null, 2));
await Bun.write(`${dbPath}/dofusBookMap/nameMap.json`, JSON.stringify(dofusBookDBNameMap, null, 2));
