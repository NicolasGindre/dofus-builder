// import { panoplies } from "../db/itemDB";
import type { Item, ItemCategory } from "./item";
import type { StatKey, Stats } from "./stats";

export const baseStats: Partial<Stats> = {
    health: 50,
    ap: 6,
    mp: 3,
    range: 0,
    summon: 1,
    prospecting: 100,
    pods: 995,
};

export function getLeveledStats(level: number): Partial<Stats> {
    let leveledStats: Partial<Stats> = {};
    for (const [statKey, value] of Object.entries(baseStats)) {
        leveledStats[statKey as StatKey] = value;
    }
    leveledStats.health! += level * 5;
    leveledStats.pods! += level * 5;
    if (level >= 100) {
        leveledStats.ap! += 1;
    }
    return leveledStats;
}

export type CharacterBuild = {
    slots: Slots;
    panoplies: Record<string, number>;
    stats: Partial<Stats>;
    value: number;
};

export type BestBuildsResp = { value: number; ids: string[] }[];

export type Slots = Partial<Record<BuildSlot, Item>>;

export const BUILD_SLOT = [
    "amulet",
    "ring1",
    "ring2",
    "hat",
    "cloak",
    "belt",
    "boots",
    "weapon",
    "shield",
    "pet",
    "dofus1",
    "dofus2",
    "dofus3",
    "dofus4",
    "dofus5",
    "dofus6",
] as const;

export type BuildSlot = (typeof BUILD_SLOT)[number];
export const SLOT_TO_CATEGORY: Record<BuildSlot, ItemCategory> = {
    amulet: "amulet",
    ring1: "ring",
    ring2: "ring",
    hat: "hat",
    cloak: "cloak",
    belt: "belt",
    boots: "boots",
    weapon: "weapon",
    shield: "shield",
    pet: "pet",
    dofus1: "dofus",
    dofus2: "dofus",
    dofus3: "dofus",
    dofus4: "dofus",
    dofus5: "dofus",
    dofus6: "dofus",
};
export const CATEGORY_TO_SLOTS: Record<ItemCategory, BuildSlot[]> = {
    amulet: ["amulet"],
    ring: ["ring1", "ring2"],
    hat: ["hat"],
    cloak: ["cloak"],
    belt: ["belt"],
    boots: ["boots"],
    weapon: ["weapon"],
    shield: ["shield"],
    pet: ["pet"],
    dofus: ["dofus1", "dofus2", "dofus3", "dofus4", "dofus5", "dofus6"],
};

export function slotLength(category: ItemCategory) {
    return CATEGORY_TO_SLOTS[category].length;
}
