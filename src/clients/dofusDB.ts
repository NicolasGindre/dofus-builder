import { z } from "zod";
import {
    type Item,
    type ItemStats,
    type ItemCategory,
    type Panoplies,
    type Requirement,
    convertItemRequirement,
} from "../types/item";
import { type StatKey } from "../types/character";
import { nextValue } from "../db/base62inc";

const dofusDBUrl: string = "https://api.dofusdb.fr";
let shortId: string = "";
export function initShortId() {
    shortId = "Z";
}

const StatSchema = z.object({
    from: z.number(),
    to: z.number(),
    characteristic: z.number(),
    effectId: z.number(),
});
type StatResp = z.infer<typeof StatSchema>;

const NameSchema = z.object({
    fr: z.string(),
    en: z.string(),
    pt: z.string(),
    de: z.string(),
    es: z.string(),
});

const ItemRespSchema = z.object({
    _id: z.string(),
    level: z.number().int(),
    name: NameSchema,
    criterions: z.string().optional(), // max AP / MP
    itemSet: z
        .union([
            z.object({
                // panoply
                _id: z.string(),
                name: NameSchema,
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

        const resp = await fetch(url, { headers: { Referer: "https://secret-project.net" } });

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
            shortId = nextValue(shortId);
            const newItem = translateItem(dofusDbItem, category, shortId);
            if (!newItem.panoply && Object.keys(newItem.stats).length == 0) {
                continue;
            } else {
                items[dofusDbItem._id] = newItem;
            }
        }

        totalItems = itemsResp.total;
        itemIndex += 50;
    }

    return items;
}

export function translateItem(
    dofusDbItem: ItemResp,
    category: ItemCategory,
    shortId: string,
): Item {
    const requirements = translateCriterions(dofusDbItem.criterions);
    const minRequirement = convertItemRequirement(requirements);
    let item: Item = {
        id: dofusDbItem._id,
        idShort: shortId,
        name: {
            fr: dofusDbItem.name.fr,
            en: dofusDbItem.name.en,
            pt: dofusDbItem.name.pt,
            de: dofusDbItem.name.de,
            es: dofusDbItem.name.es,
        },
        level: dofusDbItem.level,
        // panoply: dofusDbItem.itemSet?.name.fr,
        ...(dofusDbItem.itemSet ? { panoply: dofusDbItem.itemSet._id } : {}),
        category: category,
        ...(requirements[0] && requirements[0].length > 0 ? { requirements: requirements } : {}),
        ...(minRequirement ? { minRequirement: minRequirement } : {}),
        ...(dofusDbItem.criterions ? { criterions: dofusDbItem.criterions } : {}),
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

const validCriterions: Record<string, StatKey | "panopliesBonus"> = {
    Pk: "panopliesBonus",
    CP: "ap",
    CM: "mp",
    CS: "strength",
    CC: "chance",
    CI: "intelligence",
    CA: "agility",
    CW: "wisdom",
    CV: "health",
};

function translateCriterions(criterions: string | undefined): Requirement[][] {
    if (criterions === undefined) {
        return [];
    }
    let andRequirements: Requirement[][] = [];
    const andCriterions = criterions.replace(/[()]/g, "").split("&");

    for (const andCrit of andCriterions) {
        const orCriterions = andCrit.split("|");
        let orRequirements: Requirement[] = [];
        for (const orCrit of orCriterions) {
            const lessThanSplit = orCrit.split("<");
            if (lessThanSplit[0] && lessThanSplit[1] && validCriterions[lessThanSplit[0]]) {
                orRequirements.push({
                    stat: validCriterions[lessThanSplit[0]]!,
                    type: "lessThan",
                    value: parseInt(lessThanSplit[1]),
                });
                continue;
            }
            const moreThanSplit = orCrit.split(">");
            if (moreThanSplit[0] && moreThanSplit[1] && validCriterions[moreThanSplit[0]]) {
                orRequirements.push({
                    stat: validCriterions[moreThanSplit[0]]!,
                    type: "moreThan",
                    value: parseInt(moreThanSplit[1]),
                });
            }
        }
        if (orRequirements.length > 0) {
            andRequirements.push(orRequirements);
        }
    }
    return andRequirements;
}

const PanoplyRespSchema = z.object({
    _id: z.string(),
    name: NameSchema,
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

        const resp = await fetch(url, { headers: { Referer: "https://secret-project.net" } });

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
            // shortId = nextValue(shortId);
            panoplies[dofusDbPano._id] = {
                id: dofusDbPano._id,
                // idShort: shortId,
                name: {
                    fr: dofusDbPano.name.fr,
                    en: dofusDbPano.name.en,
                    pt: dofusDbPano.name.pt,
                    de: dofusDbPano.name.de,
                    es: dofusDbPano.name.es,
                },
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
