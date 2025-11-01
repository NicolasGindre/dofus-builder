// import { panoplies } from "../db/itemDB";
import type { MinRequirement } from "../workers/orchestrator";
import type { Item, ItemCategory, Requirement } from "./item";
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

export type Build = {
    name: string;
    level: number;
    id: string;
    slots: Slots;
    panoplies: Record<string, number>;
    stats: Partial<Stats>;
    noCharStats: Partial<Stats>;
    cappedStats: Partial<Stats>;
    value: number;
    requirements: Requirement[][];
    minRequirements: MinRequirement[];
    diffBuild?: Build;

    export: {
        dofusDBUrl: string;
        dofusBookUrl: string;
    };
};
export type Slots = Record<BuildSlot, Item | undefined>;

// export type DiffBuild = Omit<Build, "slots"> & {
//     slots: DiffSlots;
// };
// type DiffSlots = Partial<Record<BuildSlot, Item | null>>;

export type BestBuildsResp = { value: number; ids: string[] }[];

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

export function getEmptySlots(): Record<BuildSlot, Item | undefined> {
    return Object.fromEntries(BUILD_SLOT.map((slot) => [slot, undefined])) as Record<
        BuildSlot,
        Item | undefined
    >;
}

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

export function categoryLength(category: ItemCategory) {
    return CATEGORY_TO_SLOTS[category].length;
}
