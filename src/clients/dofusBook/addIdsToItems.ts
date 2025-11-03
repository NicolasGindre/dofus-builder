import { nextValue } from "../../db/base62inc";
import * as itemDB from "../../db/itemDB";
import type { Item, ItemCategory, Items } from "../../types/item";
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
    ma: "weapon",
    fx: "weapon",
    la: "weapon",
    ar: "weapon",
    ep: "weapon",
    bn: "weapon",
    da: "weapon",
    ha: "weapon",
    pe: "weapon",
    ba: "weapon",
    pi: "weapon",
};

type DofusBookItem = {
    id: number;
    official: number;
    level: number;
    category_id: number;
    name: string;
    category_name: string;
    category_type: string;
};

const itemsDofusBook: { data: DofusBookItem[] } = await Bun.file(
    `src/clients/dofusBook/merged_items.json`,
).json();
const weaponsDofusBook: { data: DofusBookItem[] } = await Bun.file(
    `src/clients/dofusBook/merged_weapons.json`,
).json();

await itemDB.loadItems();
let dofusMinMaxId = "Z";

let dofusBookDBIdMap: DofusBookDBIdMap = {};
let dofusBookDBNameMap: DofusBookDBNameMap = {};

const allItemsDofusBook = [...itemsDofusBook.data, ...weaponsDofusBook.data].sort(
    (a, b) => a.level - b.level,
);

// let newItemsDB: Items = {};
let indexesToSkip: number[] = [];
for (let index = 0; index < allItemsDofusBook.length; index++) {
    if (indexesToSkip.includes(index)) {
        continue;
    }

    const dofusBookitem = allItemsDofusBook[index]!;
    const category = categoryMap[dofusBookitem.category_name] as ItemCategory;
    if (!category) {
        console.error("no matching category", dofusBookitem.name, dofusBookitem.category_name);
        continue;
    }
    // const dbItem = itemDB.itemsCategory[category][item.name]
    let dbItem = itemDB.getItemFromNameFrench(dofusBookitem.name, category);
    if (!dbItem) {
        console.error("no matching item", dofusBookitem.name, dofusBookitem.category_name);
        continue;
    }
    addItem(dofusBookitem, dbItem);

    const minMaxItem = itemDB.itemsDB[dbItem.id];

    if (minMaxItem?.panoply) {
        const panoply = itemDB.panoplies[minMaxItem.panoply]!;
        for (const panoItemId of Object.values(panoply.items)) {
            const itemToAdd = itemDB.itemsDB[panoItemId];
            if (!itemToAdd) {
                console.error("didn't find pano item to add", panoItemId, minMaxItem.name.fr);
                continue;
            }
            if (itemToAdd.name.fr == dofusBookitem.name) {
                continue;
            }
            let panoIndex = 0;
            let found = false;
            for (panoIndex; panoIndex < allItemsDofusBook.length; panoIndex++) {
                if (itemToAdd?.idDofusBook === allItemsDofusBook[panoIndex]?.official) {
                    found = true;
                    break;
                }
            }
            if (found) {
                const dofusBookitemFromPano = allItemsDofusBook[panoIndex]!;
                const category = categoryMap[dofusBookitemFromPano.category_name] as ItemCategory;
                if (!category) {
                    console.error(
                        "no matching category",
                        dofusBookitemFromPano.name,
                        dofusBookitemFromPano.category_name,
                    );
                    continue;
                }
                // const dbItemFromPano = itemDB.itemsCategory[category][item.name]
                let dbItemFromPano = itemDB.getItemFromNameFrench(
                    dofusBookitemFromPano.name,
                    category,
                );
                if (!dbItemFromPano) {
                    console.error(
                        "no matching item",
                        dofusBookitemFromPano.name,
                        dofusBookitemFromPano.category_name,
                    );
                    continue;
                }
                addItem(dofusBookitemFromPano, dbItemFromPano);
                indexesToSkip.push(panoIndex);
            } else {
                console.error("didn't find pano item", minMaxItem, itemToAdd);
            }
        }
    }
}

function addItem(dofusBookitem: DofusBookItem, dbItem: Item) {
    // dbItem.idDofusBook = item.official;
    dofusMinMaxId = nextValue(dofusMinMaxId);

    dofusBookDBIdMap[dbItem.idDofusDB] = {
        id: dofusMinMaxId,
        dofusBookId: dofusBookitem.official,
        name: dofusBookitem.name,
        level: dofusBookitem.level,
    };
    dofusBookDBNameMap[dofusBookitem.name] = {
        id: dofusMinMaxId,
        dofusDBId: dbItem.idDofusDB,
        dofusBookId: dofusBookitem.official,
        level: dofusBookitem.level,
    };
}

for (const [category, items] of Object.entries(itemDB.itemsCategory)) {
    for (const item of Object.values(items)) {
        if (!item.idDofusBook) {
            console.log("item didn't have a dofusbook ID", item.name.fr);
        }
    }
}

// await itemDB.saveAllItems();
await Bun.write(`${dbPath}/dofusBookMap/idMap.json`, JSON.stringify(dofusBookDBIdMap, null, 2));
await Bun.write(`${dbPath}/dofusBookMap/nameMap.json`, JSON.stringify(dofusBookDBNameMap, null, 2));
