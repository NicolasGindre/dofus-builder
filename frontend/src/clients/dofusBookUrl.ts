import { encode } from "@msgpack/msgpack";
import { CATEGORY_TO_SLOTS, getLeveledStats, type Slots } from "../types/build";
import { get } from "svelte/store";
import { exoAp, exoMp, exoRange, level, preStats } from "../stores/builder";
import type { ItemCategory } from "../types/item";

// Default number of picks per category (must be 17 entries). Dofus = 6.
const NUM_PICK_MAP: ItemCategory[] = [
    "cloak", // cloak
    "hat", // hat
    "belt", // belt
    "boots", // boots
    "amulet", // amulet
    "ring", // rings
    "dofus", // dofus/trophies
    "shield", // shield
    "weapon", // weapon
    "pet", // pet
    // 1, // unknown
    // 1, // unknown
    // 1, // unknown
    // 1, // unknown
    // 1, // unknown
    // 1, // unknown
];

export function encodeDofusStufferUrlFromSlots(slots: Slots): string {
    // --- base caracs (from the default decoded example) ---
    //  get(preStats)
    const levelStore = get(level);
    const leveledStats = getLeveledStats(levelStore);
    const baseCaracs = {
        0: leveledStats.vitality! + 100, // parcho 100 is forced
        1: 0, // wisdom fm
        2: 0, // str
        3: 0, // int
        4: 0, // cha
        5: 0, // agi
        6: leveledStats.ap,
        7: leveledStats.mp,
        9: 100, // prospecting
        10: 0, // po
        11: leveledStats.summon, // 1
        23: leveledStats.pods,
        // 23: 1000,
    };

    // --- additional points ---
    const additionalPoints = [0, 0, 0, 0, 0, 0];

    // --- flags bitfield ---
    let flags = 0;
    if (get(exoAp)) flags |= 1 << 2;
    if (get(exoMp)) flags |= 1 << 1;
    if (get(exoRange)) flags |= 1 << 0;

    // --- item IDs, ordered as the site expects ---
    const ids: number[] = [];
    // const push = (id?: number) => {
    //     if (id) ids.push(id);
    // };
    // --- numPick overrides (zeros for categories 1–16) ---
    const numPickOverrides: Record<number, number> = {};
    for (let i = 0; i <= 16; i++) {
        const category = NUM_PICK_MAP[i];
        if (!category) {
            numPickOverrides[i] = 0;
            continue;
        }
        const slotsCheck = CATEGORY_TO_SLOTS[category];
        let itemsAdded = 0;
        for (const slot of slotsCheck) {
            if (slots[slot]) {
                ids.push(slots[slot].idDofusBook);
                itemsAdded++;
            }
        }
        if (itemsAdded != 1) {
            numPickOverrides[i] = itemsAdded;
        }
    }
    // console.log("numPickOverrides", numPickOverrides);
    // console.log("ids", ids);

    const t: Record<number, any> = {
        0: baseCaracs,
        1: additionalPoints,
        2: levelStore,
        3: flags,
        4: numPickOverrides,
        5: ids,
    };
    // console.log("t", t);

    // --- MessagePack → Base64 ---
    const packed = encode(t);

    // Bun/browser-safe Base64 encoder
    const base64 = btoa(String.fromCharCode(...packed));

    const baseUrl = "https://www.dofusbook.net/fr/equipement/dofus-stuffer/objets";
    const fullUrl = `${baseUrl}?stuff=${base64}`;

    return fullUrl;
}
