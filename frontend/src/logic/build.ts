import { get } from "svelte/store";
import { preStats } from "../stores/builder";
import type { BestBuildsResp, BuildSlots, CharacterBuild } from "../types/character";
import { concatStats } from "../types/stats";
import { getItem, getPanoply } from "./frontendDB";

export function buildsFromWasm(bestBuildsResp: BestBuildsResp) {
    let bestBuilds: CharacterBuild[] = [];
    for (const buildResp of bestBuildsResp) {
        const slotCounter: { ring: number; dofus: number } = { ring: 0, dofus: 0 };

        let build: CharacterBuild = {
            slots: {},
            panoplies: {},
            stats: {},
            value: buildResp.value,
        };
        for (const itemNameRaw of buildResp.names) {
            for (const itemName of itemNameRaw.split("+")) {
                const item = getItem(itemName);
                const category = item.category;

                if (category === "ring") {
                    slotCounter.ring++;
                    const slot = `ring${slotCounter.ring}` as BuildSlots;
                    build.slots[slot] = item;
                } else if (category === "dofus") {
                    slotCounter.dofus++;
                    const slot = `dofus${slotCounter.dofus}` as BuildSlots;
                    build.slots[slot] = item;
                } else {
                    build.slots[category as BuildSlots] = item;
                }

                if (item.panoply != undefined) {
                    build.panoplies[item.panoply] = 1 + (build.panoplies[item.panoply] ?? 0);
                }

                build.stats = concatStats(build.stats, item.statsWithBonus);
            }
        }
        for (const [panoName, setNumber] of Object.entries(build.panoplies)) {
            build.stats = concatStats(
                build.stats,
                getPanoply(panoName).statsWithBonus[setNumber - 1]!,
            );
        }
        build.stats = concatStats(build.stats, get(preStats));
        bestBuilds.push(build);
    }
    console.log("bestBuilds : ", bestBuilds);
    return bestBuilds;
}
