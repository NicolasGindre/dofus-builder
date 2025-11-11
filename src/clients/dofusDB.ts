import { z } from "zod";
import {
    type Item,
    type ItemStats,
    type ItemCategory,
    type Panoplies,
    type Requirement,
    convertItemRequirement,
    type SubCategory,
    type Element,
    type EffectType,
    type SpellEffectLine,
    type SpecialEffect,
} from "../types/item";
import { type StatKey } from "../types/character";
import { nextValue } from "../db/base62inc";

// export type DofusBookDBIdMap = Record<
//     string,
//     { name: string; level: number; dofusBookId: number; id: string }
// >;
// export type DofusBookDBNameMap = Record<
//     string,
//     { dofusDBId: string; level: number; dofusBookId: number; id: string }
// >;

export type ItemMap = Record<string, ItemMapValue>;
export type ItemMapValue = {
    id: string;
    dofusDBId: number;
    dofusBookId: number;
    name: string;
    level: number;
    subcategory: SubCategory;
};

export type PanoMap = Record<string, PanoMapValue>;
export type PanoMapValue = {
    id: string;
    dofusDBId: number;
    name: string;
    level: number;
    requirements?: Requirement[][][];
};

const dbPath = "./src/db/data";
const dofusDBUrl: string = "https://api.dofusdb.fr";

const StatSchema = z.object({
    from: z.number(),
    to: z.number(),
    characteristic: z.number(),
    category: z.number(),
    effectId: z.number(),
});
type StatResp = z.infer<typeof StatSchema>;

const EffectSchema = z.object({
    // baseEffectId: z.number(),
    effectId: z.number(),
    diceNum: z.number(),
    // diceSide: z.number(),
});
type EffectResp = z.infer<typeof EffectSchema>;

const NameSchema = z.object({
    fr: z.string(),
    en: z.string(),
    pt: z.string(),
    de: z.string(),
    es: z.string(),
});
const SpellSchema = z.object({
    name: NameSchema,
    description: NameSchema,
});
type SpellResp = z.infer<typeof SpellSchema>;

const ItemRespSchema = z.object({
    _id: z.string(),
    id: z.number(),
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
    criticalHitBonus: z.number().optional(),
    criticalHitProbability: z.number().optional(),
    apCost: z.number().optional(),
    possibleEffects: z.array(EffectSchema), // damages and ?
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
    let itemNames: string[] = [];

    const dofusBookIdMap: ItemMap = await Bun.file(`${dbPath}/dofusBookMap/idMap.json`).json();
    const dofusBookNameMap: ItemMap = await Bun.file(`${dbPath}/dofusBookMap/nameMap.json`).json();
    const panoIdMap: PanoMap = await Bun.file(`${dbPath}/dofusBookMap/panoIdMap.json`).json();
    // const panoNameMap: PanoMap = await Bun.file(`${dbPath}/dofusBookMap/panoNameMap.json`).json();

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
            let itemMap: ItemMapValue;
            // let dofusBookId: number;
            // let dofusMinMaxId: string;
            if (!dofusBookIdMap[dofusDbItem._id]) {
                if (!dofusBookNameMap[dofusDbItem.name.fr]) {
                    console.error("item has no match in dofusbook", dofusDbItem.name.fr);
                    continue;
                } else {
                    itemMap = dofusBookNameMap[dofusDbItem.name.fr]!;
                    console.log("There was no id match but found name match", dofusDbItem.name.fr);
                }
            } else {
                itemMap = dofusBookIdMap[dofusDbItem._id]!;
            }
            let panoMinMaxId: string = "";
            if (dofusDbItem.itemSet) {
                panoMinMaxId = panoIdMap[dofusDbItem.itemSet._id]!.id;
            }

            const newItem = await translateItem(
                dofusDbItem,
                category,
                itemMap,
                // dofusMinMaxId,
                // dofusBookId,
                panoMinMaxId,
            );
            const includeEmptyStatsItems: string[] = [
                "Dofus Argenté Scintillant",
                "Dofus Abyssal",
                "Dofus Nébuleux",
            ];
            if (
                !newItem.panoply &&
                Object.keys(newItem.stats).length == 0 &&
                !includeEmptyStatsItems.includes(newItem.name.fr)
            ) {
                continue;
            } else {
                if (itemNames.includes(dofusDbItem.name.fr)) {
                    console.log("skipping duplicate name item", dofusDbItem.name.fr);
                    continue;
                }
                itemNames.push(dofusDbItem.name.fr);
                items[itemMap.id] = newItem;
            }
        }

        totalItems = itemsResp.total;
        itemIndex += 50;
    }

    return items;
}

export async function translateItem(
    dofusDbItem: ItemResp,
    category: ItemCategory,
    itemMap: ItemMapValue,
    // subCategory: SubCategory,
    // dofusMinMaxId: string,
    // dofusBookId: number,
    panoMinMaxId: string,
): Promise<Item> {
    const requirements = translateCriterions(dofusDbItem.criterions);
    const minRequirement = convertItemRequirement(requirements);
    let item: Item = {
        id: itemMap.id,
        idDofusDB: dofusDbItem.id,
        idDofusBook: itemMap.dofusBookId,
        name: {
            fr: dofusDbItem.name.fr,
            en: dofusDbItem.name.en,
            pt: dofusDbItem.name.pt,
            de: dofusDbItem.name.de,
            es: dofusDbItem.name.es,
        },
        level: dofusDbItem.level,
        // panoply: dofusDbItem.itemSet?.name.fr,
        ...(panoMinMaxId ? { panoply: panoMinMaxId } : {}),
        category: category,
        subCategory: itemMap.subcategory,
        ...(requirements[0] && requirements[0].length > 0 ? { requirements: requirements } : {}),
        ...(minRequirement ? { minRequirement: minRequirement } : {}),
        ...(dofusDbItem.criterions ? { criterions: dofusDbItem.criterions } : {}),
        stats: {},
    };
    const dofusDBStats = dofusDbItem.effects.filter((effect) => effect.category != 2);
    for (const dofusDbStat of dofusDBStats) {
        const statKey: StatKey = STAT_ID_DOFUSDB[dofusDbStat.characteristic]!;
        if (statKey == undefined) {
            continue;
        }
        item.stats[statKey] = translateStat(dofusDbStat);
    }
    const dofusDBEffects = dofusDbItem.effects.filter((effect) => effect.category == 2);
    let effectLines: SpellEffectLine[] = [];
    for (const effect of dofusDBEffects) {
        const elementAndType = ELEMENT_ID_DOFUSDB[effect.effectId]!;
        if (!elementAndType) {
            continue;
        }
        const element = elementAndType[0];
        const type = elementAndType[1];
        let line: SpellEffectLine = {
            type: type,
            element: element,
            min: effect.from,
            max: effect.to,
        };
        if (
            (type == "damage" || type == "steal" || type == "heal") &&
            dofusDbItem.criticalHitBonus &&
            element != "pull" &&
            element != "push" &&
            element != "apReduce" &&
            element != "mpReduce"
        ) {
            line.minCrit = effect.from + dofusDbItem.criticalHitBonus;
            line.maxCrit = effect.to ? effect.to + dofusDbItem.criticalHitBonus : 0;
        }
        effectLines.push(line);
    }
    if (effectLines.length > 0) {
        item.weaponEffect = {
            cost: dofusDbItem.apCost ?? 0,
            critChance: dofusDbItem.criticalHitProbability ?? 0,
            effects: effectLines,
        };
    }

    const dofusDBSpecialDescription = dofusDbItem.possibleEffects.filter(
        (possibleEffect) => possibleEffect.effectId == 1175,
    );
    if (dofusDBSpecialDescription[0] && dofusDBSpecialDescription[0].diceNum) {
        const specialEffect = await fetchDofusDBSpecialEffect(dofusDBSpecialDescription[0].diceNum);
        if (specialEffect) {
            item.specialEffect = specialEffect;
        }
    }
    return item;
}
async function fetchDofusDBSpecialEffect(
    specialEffectId: number,
): Promise<SpecialEffect | undefined> {
    const url = new URL(`${dofusDBUrl}/spells/${specialEffectId}`);
    const resp = await fetch(url, { headers: { Referer: "https://secret-project.net" } });

    const json = await resp.json();
    const spellResp: SpellResp = SpellSchema.parse(json);

    // if (spellResp.name && spellResp.description) {
    return {
        name: spellResp.name,
        description: spellResp.description,
    };
    // }
    // return undefined;
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
    CV: "vitality",
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
    id: z.number(),
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

    let panoIdMap: PanoMap = await Bun.file(`${dbPath}/dofusBookMap/panoIdMap.json`).json();
    let panoNameMap: PanoMap = await Bun.file(`${dbPath}/dofusBookMap/panoNameMap.json`).json();

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
            let panoMap: PanoMapValue;
            if (!panoIdMap[dofusDbPano._id]) {
                if (!panoNameMap[dofusDbPano.name.fr]) {
                    console.error("item has no match in dofusbook", dofusDbPano.name.fr);
                    continue;
                } else {
                    panoMap = panoNameMap[dofusDbPano.name.fr]!;
                    console.log("There was no id match but found name match", panoMap);
                }
            } else {
                panoMap = panoIdMap[dofusDbPano._id]!;
            }
            panoplies[panoMap.id] = {
                id: panoMap.id,
                idDofusDB: dofusDbPano.id,
                name: {
                    fr: dofusDbPano.name.fr,
                    en: dofusDbPano.name.en,
                    pt: dofusDbPano.name.pt,
                    de: dofusDbPano.name.de,
                    es: dofusDbPano.name.es,
                },
                level: panoMap.level,
                items: [],
                stats: translatePanoplyStats(dofusDbPano),
                ...(panoMap.requirements ? { requirements: panoMap.requirements } : {}),
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

export const ELEMENT_ID_DOFUSDB: Record<number, [Element, EffectType]> = {
    100: ["neutral", "damage"],
    97: ["earth", "damage"],
    99: ["fire", "damage"],
    96: ["water", "damage"],
    98: ["air", "damage"],
    2822: ["bestElem", "damage"],

    95: ["neutral", "steal"],
    94: ["fire", "steal"],
    92: ["earth", "steal"],
    91: ["water", "steal"],
    93: ["air", "steal"],

    108: ["fire", "heal"],

    127: ["mpReduce", "other"],
    101: ["apReduce", "other"],

    5: ["push", "push"],
    6: ["pull", "pull"],
};

export const STAT_ID_DOFUSDB: Record<number, StatKey> = {
    1: "ap",
    23: "mp",
    19: "range",
    26: "summon",

    11: "vitality",

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
