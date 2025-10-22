import { get } from "svelte/store";
import { itemsLocked, itemsSelected, preStats } from "../stores/builder";
import {
    slotLength,
    type BestBuildsResp,
    type BuildSlot,
    type Build,
    type Slots,
    BUILD_SLOT,
    getEmptySlots,
    SLOT_TO_CATEGORY,
    CATEGORY_TO_SLOTS,
} from "../types/build";
import { concatStats, type Stats } from "../types/stats";
import { getItem, getPanoply } from "./frontendDB";
import { ITEM_CATEGORIES, type Item, type ItemCategory, type Items } from "../types/item";

export function buildsFromWasm(bestBuildsResp: BestBuildsResp) {
    let bestBuilds: Build[] = [];
    console.log("rust response", bestBuildsResp);
    for (const buildResp of bestBuildsResp) {
        const slotCounter: { ring: number; dofus: number } = { ring: 0, dofus: 0 };

        let build: Build = {
            slots: getEmptySlots(),
            panoplies: {},
            stats: {},
            value: buildResp.value,
        };
        for (const itemIdRaw of buildResp.ids) {
            for (const itemId of itemIdRaw.split("+")) {
                const item = getItem(itemId);
                if (!item) {
                    continue;
                }
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

export function diffBuild(build: Build, comparedBuild: Build) {
    const diffBuild: Build = {
        slots: getEmptySlots(),
        panoplies: {},
        stats: {},
        value: build.value - comparedBuild.value,
    };

    // items
    for (const category of ITEM_CATEGORIES) {
        const categorySlots = CATEGORY_TO_SLOTS[category];

        let slotIndex = 0;
        let newCategorySlots: Partial<Record<BuildSlot, Item | undefined>> = {};
        let matchedItems: Item[] = [];
        for (const buildSlot of categorySlots) {
            const item = build.slots[buildSlot];
            if (!item) {
                continue;
            }
            for (const compareSlot of categorySlots) {
                if (item == comparedBuild.slots[compareSlot]) {
                    matchedItems.push(item);
                    const currSlot = categorySlots[slotIndex] as BuildSlot;
                    diffBuild.slots[currSlot] = item;
                    newCategorySlots[currSlot] = item;
                    slotIndex++;
                }
            }
        }

        let slotNewItemsIndex = slotIndex;
        for (const buildSlot of categorySlots) {
            const item = build.slots[buildSlot];
            if (!item) {
                continue;
            }
            if (!matchedItems.includes(item)) {
                const currSlot = categorySlots[slotNewItemsIndex] as BuildSlot;
                newCategorySlots[currSlot] = item;
                slotNewItemsIndex++;
            }
        }
        for (const [slot, item] of Object.entries(newCategorySlots)) {
            build.slots[slot as BuildSlot] = item;
        }
        console.log("matchedItems", matchedItems);
        console.log("newCategorySlots", newCategorySlots);

        let slotRemovedItemsIndex = slotIndex;
        for (const comparedSlot of categorySlots) {
            const comparedSlotItem = comparedBuild.slots[comparedSlot];
            if (!comparedSlotItem) {
                continue;
            }
            console.log("comparedSlotItem.id", comparedSlotItem.id);
            if (!matchedItems.includes(comparedSlotItem)) {
                const currSlot = categorySlots[slotRemovedItemsIndex] as BuildSlot;
                diffBuild.slots[currSlot] = comparedSlotItem;
                slotRemovedItemsIndex++;
            }
        }
        console.log("diffBuild.slots", diffBuild.slots);
    }

    // panoplies
    for (const id of Object.keys(build.panoplies)) {
        // const prevCount = comparedBuild.panoplies[id] ?? 0;
        diffBuild.panoplies[id] = comparedBuild.panoplies[id] ?? 0;
    }
    for (const [id, count] of Object.entries(comparedBuild.panoplies)) {
        if (!diffBuild.panoplies[id]) {
            diffBuild.panoplies[id] = count;
        }
    }

    // stats
    for (const [key, value] of Object.entries(build.stats)) {
        const prevValue = comparedBuild.stats[key as keyof Stats] ?? 0;
        const delta = value - prevValue;
        if (delta !== 0) diffBuild.stats[key as keyof Stats] = delta;
    }

    console.log(diffBuild);
    build.diffBuild = diffBuild;
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
    // console.log("totalCombinations", totalCombinations);
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
