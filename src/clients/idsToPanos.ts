import { nextValue } from "../db/base62inc";
import * as itemDB from "../db/itemDB";
import type { Requirement } from "../../shared/types/item";
import type { PanoMap } from "./dofusDB";

await itemDB.loadItemsAndPanos();
let dofusMinMaxId = "Z";

let panoplies = Object.values(itemDB.panoplies);

panoplies = panoplies.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.name.fr.localeCompare(b.name.fr);
});

let panopliesIdMap: PanoMap = {};
let panopliesNameMap: PanoMap = {};

for (const pano of panoplies) {
    dofusMinMaxId = nextValue(dofusMinMaxId);
    panopliesIdMap[pano.idDofusDB] = {
        id: dofusMinMaxId,
        name: pano.name.fr,
        level: pano.level,
        dofusDBId: pano.idDofusDB,
    };
    panopliesNameMap[pano.name.fr] = {
        id: dofusMinMaxId,
        name: pano.name.fr,
        level: pano.level,
        dofusDBId: pano.idDofusDB,
    };
    if (pano.name.fr == "Malédiction de Cire Momore") {
        const req: Requirement[][][] = [
            [],
            [
                [{ type: "lessThanOrEquals", stat: "mp", value: 4 }],
                [{ type: "lessThanOrEquals", stat: "range", value: 4 }],
                [{ type: "lessThanOrEquals", stat: "summon", value: 4 }],
            ],
            [
                [{ type: "lessThanOrEquals", stat: "mp", value: 3 }],
                [{ type: "lessThanOrEquals", stat: "range", value: 3 }],
                [{ type: "lessThanOrEquals", stat: "summon", value: 3 }],
            ],
            [
                [{ type: "lessThanOrEquals", stat: "mp", value: 3 }],
                [{ type: "lessThanOrEquals", stat: "range", value: 3 }],
                [{ type: "lessThanOrEquals", stat: "summon", value: 3 }],
            ],
            [
                [{ type: "lessThanOrEquals", stat: "mp", value: 3 }],
                [{ type: "lessThanOrEquals", stat: "range", value: 3 }],
                [{ type: "lessThanOrEquals", stat: "summon", value: 3 }],
            ],
            [
                [{ type: "lessThanOrEquals", stat: "mp", value: 2 }],
                [{ type: "lessThanOrEquals", stat: "range", value: 2 }],
                [{ type: "lessThanOrEquals", stat: "summon", value: 2 }],
            ],
        ];
        panopliesIdMap[pano.idDofusDB]!.requirements = req;
        panopliesNameMap[pano.name.fr]!.requirements = req;
    }
}

const dbPath = "./src/db/data";
await Bun.write(`${dbPath}/dofusBookMap/panoIdMap.json`, JSON.stringify(panopliesIdMap, null, 2));
await Bun.write(
    `${dbPath}/dofusBookMap/panoNameMap.json`,
    JSON.stringify(panopliesNameMap, null, 2),
);
