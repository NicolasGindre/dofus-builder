import { nextValue } from "../db/base62inc";
import * as itemDB from "../db/itemDB";
import type { PanoMap } from "./dofusDB";

await itemDB.loadItemsAndPanos();
let dofusMinMaxId = "Z";

// export type PanoMap = Record<
//     string,
//     { id: string; dofusDBId: string; name: string; level: number }
// >;

let panoplies = Object.values(itemDB.panoplies);
panoplies.sort((a, b) => b.level - a.level);

let panopliesIdMap: PanoMap = {};
let panopliesNameMap: PanoMap = {};

for (const pano of panoplies) {
    dofusMinMaxId = nextValue(dofusMinMaxId);
    panopliesIdMap[pano.id] = {
        id: dofusMinMaxId,
        name: pano.name.fr,
        level: pano.level,
        dofusDBId: pano.id,
    };
    panopliesNameMap[pano.name.fr] = {
        id: dofusMinMaxId,
        name: pano.name.fr,
        level: pano.level,
        dofusDBId: pano.id,
    };
}

const dbPath = "./src/db/data";
await Bun.write(`${dbPath}/dofusBookMap/panoIdMap.json`, JSON.stringify(panopliesIdMap, null, 2));
await Bun.write(
    `${dbPath}/dofusBookMap/panoNameMap.json`,
    JSON.stringify(panopliesNameMap, null, 2),
);
