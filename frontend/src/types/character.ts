// import { panoplies } from "../db/itemDB";
import type { Item, ItemCategory } from "../types/item";
import type { Stats } from "./stats";

// export type Character = {
//     level: number;
//     baseStats: Partial<Stats>;
// };

// export const baseCharacter: Character = {
//     level: 200,
//     baseStats: {
//         ap: 7,
//         mp: 3,
//         health: 2000,
//         pods: 2000,
//     },
// };

export const baseStats: Partial<Stats> = {
    health: 50,
    ap: 6,
    mp: 3,
    range: 0,
    summon: 1,
    pods: 995,
};

export function getLeveledStats(level: number): Partial<Stats> {
    let leveledStats: Partial<Stats> = {
        ap: baseStats.ap,
        mp: baseStats.mp,
        range: baseStats.range,
        health: baseStats.health,
        pods: baseStats.pods,
    };
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

export type BestBuildsResp = { value: number; names: string[] }[];

export type Slots = Partial<Record<BuildSlots, Item>>;

export const BUILD_SLOTS = [
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

export type BuildSlots = (typeof BUILD_SLOTS)[number];

export const SLOT_TO_CATEGORY: Record<BuildSlots, ItemCategory> = {
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
