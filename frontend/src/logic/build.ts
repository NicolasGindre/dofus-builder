import { get } from "svelte/store";
import { itemsLocked, itemsSelected, preStats } from "../stores/builder";
import {
    slotLength,
    type BestBuildsResp,
    type BuildSlot,
    type CharacterBuild,
} from "../types/build";
import { concatStats } from "../types/stats";
import { getItem, getPanoply } from "./frontendDB";
import type { Item, ItemCategory, Items } from "../types/item";

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
        for (const itemIdRaw of buildResp.ids) {
            for (const itemId of itemIdRaw.split("+")) {
                const item = getItem(itemId);
                const category = item.category;

                if (category === "ring") {
                    slotCounter.ring++;
                    const slot = `ring${slotCounter.ring}` as BuildSlot;
                    build.slots[slot] = item;
                } else if (category === "dofus") {
                    slotCounter.dofus++;
                    const slot = `dofus${slotCounter.dofus}` as BuildSlot;
                    build.slots[slot] = item;
                } else {
                    build.slots[category as BuildSlot] = item;
                }

                if (item.panoply != undefined) {
                    build.panoplies[item.panoply] = 1 + (build.panoplies[item.panoply] ?? 0);
                }

                build.stats = concatStats(build.stats, item.statsWithBonus);
            }
        }
        for (const [panoId, setNumber] of Object.entries(build.panoplies)) {
            build.stats = concatStats(
                build.stats,
                getPanoply(panoId).statsWithBonus[setNumber - 1]!,
            );
        }
        build.stats = concatStats(build.stats, get(preStats));
        bestBuilds.push(build);
    }
    console.log("bestBuilds : ", bestBuilds);
    return bestBuilds;
}
export function totalCombinations(
    itemsSelected: Record<ItemCategory, Items>,
    itemsLocked: Record<ItemCategory, Items>,
): number {
    let totalCombinations = 1;
    let atLeast1: boolean = false;
    for (const [cat, selectedItem] of Object.entries(itemsSelected)) {
        const category = cat as ItemCategory;
        // const categoryLocks = itemsLocked[category as ItemCategory];
        const items = Object.values(selectedItem);
        const itemCount = items.length;
        const itemsLockedArr = Object.values(itemsLocked[category as ItemCategory]);
        const lockedCount = itemsLockedArr.length;

        // console.log("category", category);
        // console.log("itemcount", itemCount);
        // console.log("lockedCount", lockedCount);
        // console.log("slotLength(category)", slotLength(category));

        let categoryCombinations = combinations(
            itemCount - lockedCount,
            slotLength(category) - lockedCount,
        );
        // console.log("categoryCombinations", categoryCombinations);
        if (categoryCombinations >= 1) {
            if (category == "dofus") {
                // TODO CHECK
                if (shouldAddComboNoBonusPanoLessThan3(items, itemsLockedArr)) {
                    categoryCombinations += 1;
                }
            }
            totalCombinations *= categoryCombinations;
            atLeast1 = true;
        }
    }
    console.log("totalCombinations", totalCombinations);
    return atLeast1 ? totalCombinations : 0;
}
export function combinations(itemCount: number, groupSize: number): number {
    if (itemCount == 0) return 0;
    if (groupSize === 0 || groupSize === itemCount || groupSize > itemCount) return 1;
    let result = 1;
    for (let i = 1; i <= groupSize; i++) {
        result = (result * (itemCount - i + 1)) / i;
    }
    return result;
}

export function shouldAddComboNoBonusPanoLessThan3(items: Item[], itemsLocked: Item[]): boolean {
    for (const itemLocked of itemsLocked) {
        if (itemLocked.requirement && itemLocked.requirement.type == "panopliesBonusLessThan") {
            return false;
        }
    }
    let itemCountWithPanoLessThan3Req = 0;
    for (const item of items) {
        if (item.requirement && item.requirement.type == "panopliesBonusLessThan") {
            itemCountWithPanoLessThan3Req++;
        }
    }
    // console.log("itemCountWithPanoLessThan3Req", itemCountWithPanoLessThan3Req);
    if (itemCountWithPanoLessThan3Req == 0) {
        return false;
    }
    const itemCountWithNOPanoLessThan3Req = items.length - itemCountWithPanoLessThan3Req;
    // console.log("itemCountWithNOPanoLessThan3Req", itemCountWithNOPanoLessThan3Req);
    // console.log("slotLength() - itemsLocked.length", slotLength("dofus") - itemsLocked.length);
    if (itemCountWithNOPanoLessThan3Req < slotLength("dofus") - itemsLocked.length) {
        return true;
    }
    return false;
}
