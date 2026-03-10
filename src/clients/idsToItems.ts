import { nextValue } from "../db/base62inc";
import * as itemDB from "../db/itemDB";
// import type { Requirement } from "../../shared/types/item";
import type { ItemMap } from "./dofusDB";

await itemDB.loadItemsAndPanos();
// let dofusMinMaxId = "Z";

let items = Object.values(itemDB.itemsDB);

items = items.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.id.localeCompare(b.id);
});

let itemsIdMap: ItemMap = {};

for (const item of items) {
    // dofusMinMaxId = nextValue(dofusMinMaxId);
    itemsIdMap[item.idDofusDB] = {
        id: item.id,
        name: item.name.fr,
        level: item.level,
        dofusDBId: item.idDofusDB,
        dofusBookId: item.idDofusBook,
        subcategory: item.subCategory,
    };
}

const dbPath = "./src/db/data";
await Bun.write(`${dbPath}/dofusBookMap/idMap.json`, JSON.stringify(itemsIdMap, null, 2));
