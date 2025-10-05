import { z } from "zod";
import {
    type Item,
    type ItemStats,
    type ItemCategory,
    type Panoplies,
    type Requirement,
} from "../types/item";
import { type StatKey } from "../types/character";

const dofusDBUrl: string = "https://api.dofusdb.fr";

const StatSchema = z.object({
    from: z.number(),
    to: z.number(),
    characteristic: z.number(),
    effectId: z.number(),
});
type StatResp = z.infer<typeof StatSchema>;

const ItemRespSchema = z.object({
    level: z.number().int(),
    name: z.object({
        fr: z.string(),
    }),
    criterions: z.string().optional(), // max AP / MP
    itemSet: z
        .union([
            z.object({
                // panoply
                name: z.object({
                    fr: z.string(),
                }),
            }),
            z.any().transform(() => undefined),
        ])
        .optional(),
    type: z.object({
        // category
        name: z.object({
            en: z.string(),
        }),
    }),
    effects: z.array(StatSchema), // stats
});
const ItemsRespSchema = z.object({
    total: z.number(),
    data: z.array(ItemRespSchema),
});

type ItemsResp = z.infer<typeof ItemsRespSchema>;
type ItemResp = z.infer<typeof ItemRespSchema>;

export async function downloadItems(category: ItemCategory): Promise<Record<string, Item>> {
    let items: Record<string, Item> = {};
    const url = new URL(`${dofusDBUrl}/items`);

    for (const categoryId of CATEGORY_ID_DOFUSDB[category]) {
        url.searchParams.append("typeId[$in][]", categoryId.toString());
    }
    url.searchParams.set("$limit", "50");

    let totalItems = 10000;
    let itemIndex = 0;

    while (itemIndex < totalItems) {
        url.searchParams.set("$skip", itemIndex.toString());

        const resp = await fetch(url);

        if (!resp.ok) {
            const jsonErr = (await resp.json()) as { message: string };
            throw new Error(
                `Fetch dofusDB items: ${resp.status} ${resp.statusText}: ${jsonErr.message}`,
            );
        }
        const json = await resp.json();
        const itemsResp: ItemsResp = ItemsRespSchema.parse(json);

        for (const dofusDbItem of itemsResp.data) {
            if (shouldSkipItem(dofusDbItem)) {
                continue;
            }
            const newItem = translateItems(dofusDbItem, category);
            if (!newItem.panoply && Object.keys(newItem.stats).length == 0) {
                continue;
            } else {
                items[dofusDbItem.name.fr] = newItem;
            }
        }

        totalItems = itemsResp.total;
        itemIndex += 50;
    }

    return items;
}

export function translateItems(dofusDbItem: ItemResp, category: ItemCategory): Item {
    const requirement = translateCriterions(dofusDbItem.criterions);
    let item: Item = {
        name: dofusDbItem.name.fr,
        level: dofusDbItem.level,
        panoply: dofusDbItem.itemSet?.name.fr,
        category: category,
        ...(requirement ? { requirement: requirement } : {}),
        stats: {},
    };
    for (const dofusDbStat of dofusDbItem.effects) {
        const statKey: StatKey = STAT_ID_DOFUSDB[dofusDbStat.characteristic]!;
        if (statKey == undefined) {
            continue;
        }
        item.stats[statKey] = translateStat(dofusDbStat);
    }
    return item;
}
function translateStat(dofusDbStat: StatResp): number {
    if (dofusDbStat.to == 0) {
        return dofusDbStat.from;
    }
    if (dofusDbStat.from == 0) {
        return dofusDbStat.to;
    }
    return dofusDbStat.to > dofusDbStat.from ? dofusDbStat.to : dofusDbStat.from;
}
function translateCriterions(criterions: string | undefined): Requirement | undefined {
    // let requirement: Requirement = {}
    if (criterions === undefined) {
        return undefined;
    }
    if (criterions == "Pk<3") {
        const requirement: Requirement = {
            type: "panopliesBonusLessThan",
            value: 3,
        };
        return requirement;
    } else if (criterions.includes("CP<12|CM<6")) {
        const requirement: Requirement = {
            type: "apLessThanOrMpLessThan",
            apValue: 12,
            mpValue: 6,
        };
        return requirement;
    } else if (criterions.includes("CP<12&CM<6")) {
        const requirement: Requirement = {
            type: "apLessThanAndMpLessThan",
            apValue: 12,
            mpValue: 6,
        };
        return requirement;
    } else {
        const matchApLessThan = criterions.match(/CP<(\d+)/);
        if (matchApLessThan && matchApLessThan[1] !== undefined) {
            const requirement: Requirement = {
                type: "apLessThan",
                value: parseInt(matchApLessThan[1], 10),
            };
            return requirement;
        }
        const matchMpLessThan = criterions.match(/CM<(\d+)/);
        if (matchMpLessThan && matchMpLessThan[1] !== undefined) {
            const requirement: Requirement = {
                type: "mpLessThan",
                value: parseInt(matchMpLessThan[1], 10),
            };
            return requirement;
        }
    }
    return undefined;
    // const validCriterions: Record<string, string> = {
    //     Pk: "panoplyBonus",
    //     CP: "ap",
    //     CM: "mp",
    //     // CS: "strength",
    //     // CC: "chance",
    //     // CI: "intelligence",
    //     // CA: "agility",
    //     // CW: "wisdom",
    //     // CV: "health",
    // };
}

const PanoplyRespSchema = z.object({
    name: z.object({
        fr: z.string(),
    }),
    effects: z.array(z.array(StatSchema)), // stats
    criterions: z.string().optional(), // max AP / MP
});
const PanopliesRespSchema = z.object({
    total: z.number(),
    data: z.array(PanoplyRespSchema),
});
type PanopliesResp = z.infer<typeof PanopliesRespSchema>;
type PanoplyResp = z.infer<typeof PanoplyRespSchema>;

export async function downloadPanopliesStats(): Promise<Panoplies> {
    let panoplies: Panoplies = {};
    const url = new URL(`${dofusDBUrl}/item-sets`);

    url.searchParams.set("isCosmetic", "false");
    url.searchParams.set("$limit", "50");

    let totalItems = 10000;
    let itemIndex = 0;

    while (itemIndex < totalItems) {
        url.searchParams.set("$skip", itemIndex.toString());

        const resp = await fetch(url);

        if (!resp.ok) {
            const jsonErr = (await resp.json()) as { message: string };
            throw new Error(
                `Fetch dofusDB items: ${resp.status} ${resp.statusText}: ${jsonErr.message}`,
            );
        }
        const json = await resp.json();
        const panopliesResp: PanopliesResp = PanopliesRespSchema.parse(json);

        for (const dofusDbPano of panopliesResp.data) {
            if (shouldSkipPano(dofusDbPano)) {
                continue;
            }
            panoplies[dofusDbPano.name.fr] = {
                name: dofusDbPano.name.fr,
                items: [],
                stats: translatePanoplyStats(dofusDbPano),
            };
        }
        totalItems = panopliesResp.total;
        itemIndex += 50;
    }
    return panoplies;
}

function translatePanoplyStats(panoplyResp: PanoplyResp): ItemStats[] {
    let panoplyStats: ItemStats[] = [];
    for (const panoplyRespStats of panoplyResp.effects) {
        let panoplyIndexStats: ItemStats = {};
        for (const panoplyRespStat of panoplyRespStats) {
            const statKey: StatKey = STAT_ID_DOFUSDB[panoplyRespStat.characteristic]!;
            if (statKey == undefined) {
                continue;
            }
            panoplyIndexStats[statKey] = translateStat(panoplyRespStat);
        }
        panoplyStats.push(panoplyIndexStats);
    }
    return panoplyStats;
}

export const CATEGORY_ID_DOFUSDB: Record<ItemCategory, number[]> = {
    amulet: [1],
    belt: [10],
    boots: [11],
    cloak: [17],
    ring: [9],
    hat: [16],
    weapon: [2, 3, 4, 5, 6, 7, 8, 19, 20, 21, 22, 83, 99, 102, 114, 271],
    shield: [82],
    pet: [18, 97, 121, 196, 207],
    dofus: [151, 23],
};

export const STAT_ID_DOFUSDB: Record<number, StatKey> = {
    1: "ap",
    23: "mp",
    19: "range",
    26: "summon",

    11: "health",

    10: "strength",
    14: "agility",
    13: "chance",
    15: "intelligence",

    25: "power",
    12: "wisdom",
    48: "prospecting",

    79: "lock",
    78: "dodge",

    18: "criticalChance",

    86: "criticalDamage",
    84: "pushbackDamage",
    70: "trapDamage",
    69: "trapPower",

    123: "spellDamagePer",
    122: "weaponDamagePer",
    120: "rangedDamagePer",
    125: "meleeDamagePer",
    // xxx: "finalDamagePer",

    16: "damage",
    92: "neutralDamage",
    88: "earthDamage",
    91: "airDamage",
    90: "waterDamage",
    89: "fireDamage",

    87: "criticalResist",
    85: "pushbackResist",

    58: "neutralResist",
    54: "earthResist",
    57: "airResist",
    56: "waterResist",
    55: "fireResist",

    37: "neutralResistPer",
    33: "earthResistPer",
    36: "airResistPer",
    35: "waterResistPer",
    34: "fireResistPer",

    121: "rangedResistPer",
    124: "meleeResistPer",
    // xxx: "spellResistPer",
    // xxx: "weaponResistPer",

    83: "mpReduction",
    82: "apReduction",

    28: "mpResist",
    27: "apResist",

    49: "heal",
    50: "reflect",

    44: "initiative",
    40: "pods",
};

function shouldSkipItem(dofusDbItem: ItemResp): boolean {
    if (itemsToSkip.includes(dofusDbItem.name.fr)) {
        return true;
    }
    if (dofusDbItem.criterions?.includes("BI")) {
        return true;
    }
    if (dofusDbItem.criterions?.includes("OS=505")) {
        return true;
    }
    if (dofusDbItem.criterions?.includes("PX=")) {
        return true;
    }
    return false;
}

const itemsToSkip: string[] = [
    "Amourlette Hernel",
    "Amourlette Hernelle",
    "La Broche Céleste Ankarton",
    "Pagniglou défectueux",
    "Dofus Verdoyant",
];
function shouldSkipPano(dofusDbPano: PanoplyResp): boolean {
    if (panopliesToSkip.includes(dofusDbPano.name.fr)) {
        return true;
    }
    return false;
}
const panopliesToSkip: string[] = ["Panoplie Ankarton"];
