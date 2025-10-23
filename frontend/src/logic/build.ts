import { get } from "svelte/store";
import {
    itemsLocked,
    itemsSelected,
    maxStats,
    minStats,
    preStats,
    weights,
} from "../stores/builder";
import {
    categoryLength,
    type BestBuildsResp,
    type BuildSlot,
    type Build,
    type Slots,
    BUILD_SLOT,
    getEmptySlots,
    SLOT_TO_CATEGORY,
    CATEGORY_TO_SLOTS,
} from "../types/build";
import { concatStats, type StatKey, type Stats } from "../types/stats";
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
            overStats: {},
            requirements: [],
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

                if (item.requirement) {
                    build.requirements.push(item.requirement);
                }
            }
        }
        for (const [panoId, setNumber] of Object.entries(build.panoplies)) {
            build.stats = concatStats(
                build.stats,
                getPanoply(panoId).statsWithBonus[setNumber - 1]!,
            );
            // if (pano.requirement) {
            //     build.requirements.push(pano.requirement);
            // }
        }
        build.stats = concatStats(build.stats, get(preStats));

        for (const [key, maxStat] of Object.entries(get(maxStats))) {
            const keyStat = key as StatKey;
            if ((build.stats[keyStat] ?? -999999) > maxStat) {
                build.overStats[keyStat] = build.stats[keyStat];
                build.stats[keyStat] = maxStat;
            }
        }
        for (const requirement of build.requirements) {
            switch (requirement.type) {
                case "apLessThanOrMpLessThan":
                    if (
                        build.stats["mp"] &&
                        build.stats["mp"] >= (requirement.mpValue ?? 9999) &&
                        build.stats["ap"] &&
                        build.stats["ap"] >= (requirement.apValue ?? 9999)
                    ) {
                        const min = get(minStats);
                        if ((min["ap"] ?? 0) >= requirement.apValue!) {
                            if (!build.overStats["mp"]) {
                                build.overStats["mp"] = build.stats["mp"];
                            }
                            build.stats["mp"] = requirement.mpValue! - 1;
                        } else if ((min["mp"] ?? 0) >= requirement.mpValue!) {
                            if (!build.overStats["ap"]) {
                                build.overStats["ap"] = build.stats["ap"];
                            }
                            build.stats["ap"] = requirement.apValue! - 1;
                        } else {
                            const w = get(weights);
                            if ((w["ap"] ?? 0) > (w["mp"] ?? 0)) {
                                if (!build.overStats["mp"]) {
                                    build.overStats["mp"] = build.stats["mp"];
                                }
                                build.stats["mp"] = requirement.mpValue! - 1;
                            } else {
                                if (!build.overStats["ap"]) {
                                    build.overStats["ap"] = build.stats["ap"];
                                }
                                build.stats["ap"] = requirement.apValue! - 1;
                            }
                        }
                    }
                    break;
                case "apLessThanAndMpLessThan":
                    if (build.stats["ap"] && build.stats["ap"] >= (requirement.apValue ?? 9999)) {
                        if (!build.overStats["ap"]) {
                            build.overStats["ap"] = build.stats["ap"];
                        }
                        build.stats["ap"] = requirement.apValue! - 1;
                    }
                    if (build.stats["mp"] && build.stats["mp"] >= (requirement.mpValue ?? 9999)) {
                        if (!build.overStats["mp"]) {
                            build.overStats["mp"] = build.stats["mp"];
                        }
                        build.stats["mp"] = requirement.mpValue! - 1;
                    }
                    break;
                case "apLessThan":
                    if (build.stats["ap"] && build.stats["ap"] >= (requirement.value ?? 9999)) {
                        if (!build.overStats["ap"]) {
                            build.overStats["ap"] = build.stats["ap"];
                        }
                        build.stats["ap"] = requirement.value! - 1;
                    }
                    break;
                case "mpLessThan":
                    if (build.stats["mp"] && build.stats["mp"] >= (requirement.value ?? 9999)) {
                        if (!build.overStats["mp"]) {
                            build.overStats["mp"] = build.stats["mp"];
                        }
                        build.stats["mp"] = requirement.value! - 1;
                    }
                    break;
            }
        }
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
        overStats: {},
        requirements: [],
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
        diffBuild.panoplies[id] = comparedBuild.panoplies[id] ?? 0;
    }
    for (const [id, count] of Object.entries(comparedBuild.panoplies)) {
        if (!diffBuild.panoplies[id]) {
            diffBuild.panoplies[id] = count;
        }
    }

    // stats
    for (const key of Object.keys(build.stats)) {
        diffBuild.stats[key as keyof Stats] = comparedBuild.stats[key as keyof Stats] ?? 0;
    }
    for (const [key, value] of Object.entries(comparedBuild.stats)) {
        if (!diffBuild.stats[key as keyof Stats]) {
            diffBuild.stats[key as keyof Stats] = value;
        }
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
        // console.log("categoryLength(category)", categoryLength(category));

        let categoryCombinations = combinations(
            itemCount - lockedCount,
            categoryLength(category) - lockedCount,
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
    // console.log("categoryLength() - itemsLocked.length", categoryLength("dofus") - itemsLocked.length);
    if (itemCountWithNOPanoLessThan3Req < categoryLength("dofus") - itemsLocked.length) {
        return true;
    }
    return false;
}
