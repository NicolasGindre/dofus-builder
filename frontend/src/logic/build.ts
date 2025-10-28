import { get } from "svelte/store";
import {
    itemsLocked,
    itemsSelected,
    maxStats,
    minStats,
    preStats,
    savedBuilds,
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
import {
    ITEM_CATEGORIES,
    type Item,
    type ItemCategory,
    type Items,
    type Requirement,
} from "../types/item";
import { calculateStatsValue } from "./value";

export function buildsFromWasm(bestBuildsResp: BestBuildsResp) {
    let bestBuilds: Build[] = [];
    console.log("rust response", bestBuildsResp);

    let buildIndex = 1;
    for (const buildResp of bestBuildsResp) {
        const slotCounter: { ring: number; dofus: number } = { ring: 0, dofus: 0 };

        let build: Build = {
            id: "",
            name: `#${buildIndex}`,
            slots: getEmptySlots(),
            panoplies: {},
            stats: {},
            cappedStats: {},
            requirements: [],
            value: 0,
        };
        let idBuilder: string[] = [];
        buildIndex++;
        for (const itemIdRaw of buildResp.ids) {
            for (const itemId of itemIdRaw.split("+")) {
                const item = getItem(itemId);
                if (!item) {
                    console.error("No matching item found from Rust response", itemId);
                    continue;
                }
                idBuilder.push(item.idShort);
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

                addBuildRequirement(build, item.requirement);
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

        calculateBuildValue(build);

        if (build.value > 0 && buildResp.value == 0) {
            continue;
        }

        if (Math.round(build.value * 10) != Math.round(buildResp.value * 10)) {
            console.error(
                "Build response value and calculated value are different",
                Math.round(buildResp.value * 10),
                Math.round(build.value * 10),
            );
        }
        build.id = idBuilder.sort().join("");
        const savedBuild = getSavedBuild(build.id);
        if (savedBuild) {
            build.name = savedBuild.name;
        }
        bestBuilds.push(build);
    }
    console.log("bestBuilds : ", bestBuilds);
    return bestBuilds;
}

function addBuildRequirement(build: Build, requirement?: Requirement) {
    if (!requirement) {
        return;
    }

    let requirementExists = false;
    for (const buildReq of build.requirements) {
        if (buildReq.type == requirement.type) {
            requirementExists = true;
            if (requirement.type.includes("LessThan")) {
                if (requirement.apValue && requirement.apValue < buildReq.apValue!) {
                    buildReq.apValue = requirement.apValue;
                }
                if (requirement.mpValue && requirement.mpValue < buildReq.mpValue!) {
                    buildReq.mpValue = requirement.mpValue;
                }
                if (requirement.value && requirement.value < buildReq.value!) {
                    buildReq.value = requirement.value;
                }
            } else {
                if (requirement.apValue && requirement.apValue > buildReq.apValue!) {
                    buildReq.apValue = requirement.apValue;
                }
                if (requirement.mpValue && requirement.mpValue > buildReq.mpValue!) {
                    buildReq.mpValue = requirement.mpValue;
                }
                if (requirement.value && requirement.value > buildReq.value!) {
                    buildReq.value = requirement.value;
                }
            }
            break;
        }
    }
    if (!requirementExists) {
        build.requirements.push(requirement);
    }
}

export function calculateBuildValue(build: Build) {
    capBuildStats(build);
    build.value = calculateStatsValue(build.cappedStats);
}
function capBuildStats(build: Build) {
    build.cappedStats = { ...build.stats };

    function capStat(cappedStats: Partial<Stats>, statKey: StatKey, value: number) {
        if (!cappedStats[statKey] || cappedStats[statKey] > value) {
            build.cappedStats[statKey] = value;
        }
    }

    for (const [key, maxStat] of Object.entries(get(maxStats))) {
        const keyStat = key as StatKey;
        if ((build.stats[keyStat] ?? -999999) > maxStat) {
            // build.cappedStats[keyStat] = maxStat;
            capStat(build.cappedStats, keyStat, maxStat);
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
                        capStat(build.cappedStats, "mp", requirement.mpValue! - 1);
                    } else if ((min["mp"] ?? 0) >= requirement.mpValue!) {
                        capStat(build.cappedStats, "ap", requirement.apValue! - 1);
                    } else {
                        const w = get(weights);
                        if ((w["ap"] ?? 0) > (w["mp"] ?? 0)) {
                            capStat(build.cappedStats, "mp", requirement.mpValue! - 1);
                        } else {
                            capStat(build.cappedStats, "ap", requirement.apValue! - 1);
                        }
                    }
                }
                break;
            case "apLessThanAndMpLessThan":
                if (build.stats["ap"] && build.stats["ap"] >= (requirement.apValue ?? 9999)) {
                    capStat(build.cappedStats, "ap", requirement.apValue! - 1);
                }
                if (build.stats["mp"] && build.stats["mp"] >= (requirement.mpValue ?? 9999)) {
                    capStat(build.cappedStats, "mp", requirement.mpValue! - 1);
                }
                break;
            case "apLessThan":
                if (build.stats["ap"] && build.stats["ap"] >= (requirement.value ?? 9999)) {
                    capStat(build.cappedStats, "ap", requirement.apValue! - 1);
                }
                break;
            case "mpLessThan":
                if (build.stats["mp"] && build.stats["mp"] >= (requirement.value ?? 9999)) {
                    capStat(build.cappedStats, "mp", requirement.mpValue! - 1);
                }
                break;
        }
    }
}

export function diffBuild(build: Build, comparedBuild: Build | undefined) {
    if (!comparedBuild) {
        build.diffBuild = undefined;
        return;
    }
    const diffBuild: Build = {
        id: comparedBuild.id,
        name: comparedBuild.name,
        slots: getEmptySlots(),
        panoplies: {},
        stats: {},
        cappedStats: {},
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
        // console.log("matchedItems", matchedItems);
        // console.log("newCategorySlots", newCategorySlots);

        let slotRemovedItemsIndex = slotIndex;
        for (const comparedSlot of categorySlots) {
            const comparedSlotItem = comparedBuild.slots[comparedSlot];
            if (!comparedSlotItem) {
                continue;
            }
            // console.log("comparedSlotItem.id", comparedSlotItem.id);
            if (!matchedItems.includes(comparedSlotItem)) {
                const currSlot = categorySlots[slotRemovedItemsIndex] as BuildSlot;
                diffBuild.slots[currSlot] = comparedSlotItem;
                slotRemovedItemsIndex++;
            }
        }
        // console.log("diffBuild.slots", diffBuild.slots);
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
    for (const k of Object.keys(build.cappedStats)) {
        const key: StatKey = k as keyof Stats;
        diffBuild.cappedStats[key] = comparedBuild.cappedStats[key] ?? 0;
    }
    for (const [k, value] of Object.entries(comparedBuild.cappedStats)) {
        const key: StatKey = k as keyof Stats;
        if (!diffBuild.cappedStats[key]) {
            diffBuild.cappedStats[key] = value;
        }
    }

    // console.log(diffBuild);
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
            itemCount ? Math.max(itemCount - lockedCount, 1) : 0,
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

export function addToSavedBuilds(build: Build) {
    let alreadyExists = false;
    for (const savedBuild of get(savedBuilds)) {
        if (savedBuild.id == build.id) {
            alreadyExists = true;
            savedBuild.name = build.name;
            break;
        }
    }
    if (!alreadyExists) {
        // savedBuilds.update((builds) => [...builds, build]);
        savedBuilds.update((builds) => [...builds, build].sort((a, b) => b.value - a.value));
    }
}
export function getSavedBuild(id: string): Build | undefined {
    for (const savedBuild of get(savedBuilds)) {
        if (savedBuild.id == id) {
            return savedBuild;
        }
    }
    return undefined;
}
// export function addToSavedBuilds(build: Build) {
//     const savBuilds = get(savedBuilds);
//     const index = savBuilds.findIndex((b) => b.id === build.id);

//     if (index !== -1) {
//         const updated = [...savBuilds];
//         updated[index] = { ...updated[index], name: build.name } as Build;
//         savedBuilds.set(updated);
//     } else {
//         savedBuilds.set([...savBuilds, build]);
//     }
// }
