import { get } from "svelte/store";
import {
    bestBuilds,
    buildsDisplayed,
    comparedBuild,
    exoAp,
    exoMp,
    exoRange,
    itemsLocked,
    itemsSelected,
    level,
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
import { concatStats } from "../types/stats";
import { getItem, getPanoply } from "./frontendDB";
import { type Item, type Items } from "../types/item";
import { calculateStatsValue } from "./value";
import { PANO_CIRE_MOMORE_ID } from "./item";
import type { MinItem } from "../workers/orchestrator";
import { calculateBuildToDisplay } from "./display";
import { sortItemsIds } from "./encoding/encodeItems";
import {
    ITEM_CATEGORIES,
    type ItemCategory,
    type MinRequirement,
    type Requirement,
} from "../../../shared/types/item";
import type { StatKey, Stats } from "../../../shared/types/stats";

function initBuild(name: string, buildId?: string, value?: number): Build {
    return {
        id: buildId ?? "",
        level: 1,
        name: name,
        slots: getEmptySlots(),
        panoplies: {},
        panopliesBonus: 0,
        noCharStats: {},
        stats: {},
        cappedStats: {},
        requirements: [],
        minRequirements: [],
        value: value ?? 0,
    };
}
function addItemToBuild(
    build: Build,
    item: Item,
    slotCounter: Partial<Record<ItemCategory, number>>,
): boolean {
    const category = item.category;
    if (slotCounter[category] == undefined) {
        slotCounter[category] = 0;
    }
    const slot = CATEGORY_TO_SLOTS[category][slotCounter[category]];

    if (!slot) {
        console.error("Used all available slots for category", category);
        return false;
    }
    build.slots[slot] = item;
    slotCounter[category]++;

    if (item.level > build.level) {
        build.level = item.level;
    }
    return true;
}

export function buildsFromIds(buildIds: Record<string, string>): Build[] {
    let builds: Build[] = [];
    // console.log("buildsIds", buildIds);

    for (const [buildId, name] of Object.entries(buildIds)) {
        builds.push(buildFromId(buildId, name));
    }
    builds.sort((a, b) => b.value - a.value);
    return builds;
}
export function buildFromId(buildId: string, name: string): Build {
    const slotCounter: Partial<Record<ItemCategory, number>> = {};

    let build: Build = initBuild(name, buildId);
    for (let i = 0; i < buildId.length; i += 2) {
        const itemId = buildId.slice(i, i + 2);
        const item = getItem(itemId);
        if (!item) {
            console.error("No matching item found from Id", itemId);
            continue;
        }
        if (!addItemToBuild(build, item, slotCounter)) {
            continue;
        }

        if (item.panoply != undefined) {
            build.panoplies[item.panoply] = 1 + (build.panoplies[item.panoply] ?? 0);
        }

        build.noCharStats = concatStats(build.noCharStats, item.statsWithBonus);

        addBuildMinRequirement(build, item.minRequirement);
        addBuildRequirement(build, item.requirements);
    }
    finaliseBuild(build);
    return build;
}

export function buildsFromWasm(bestBuildsResp: BestBuildsResp): Build[] {
    let bestBuilds: Build[] = [];
    // console.log("rust response", bestBuildsResp);

    let buildIndex = 1;
    for (const buildResp of bestBuildsResp) {
        if (buildResp.value == 0 && Object.keys(get(weights)).length > 0) {
            continue;
        }

        const slotCounter: Partial<Record<ItemCategory, number>> = {};
        let build: Build = initBuild(`#${buildIndex}`);

        let idBuilder: string[] = [];
        buildIndex++;
        for (const itemIdRaw of buildResp.ids) {
            if (itemIdRaw == "") {
                continue;
            }
            for (const itemId of itemIdRaw.split("+")) {
                const item = getItem(itemId);
                if (!item) {
                    console.error(
                        "No matching item found from Rust response",
                        itemId,
                        itemIdRaw,
                        buildResp,
                    );
                    continue;
                }
                idBuilder.push(item.id);
                if (!addItemToBuild(build, item, slotCounter)) {
                    continue;
                }

                if (item.panoply != undefined) {
                    build.panoplies[item.panoply] = 1 + (build.panoplies[item.panoply] ?? 0);
                }

                build.noCharStats = concatStats(build.noCharStats, item.statsWithBonus);

                addBuildMinRequirement(build, item.minRequirement);
                addBuildRequirement(build, item.requirements);
            }
        }
        finaliseBuild(build);

        if (Math.round(build.value * 10) != Math.round(buildResp.value * 10)) {
            console.error(
                "Build response value and calculated value are different",
                Math.round(buildResp.value * 10) / 10,
                Math.round(build.value * 10) / 10,
            );
        }
        build.id = sortItemsIds(idBuilder).join("");
        bestBuilds.push(build);
    }
    updateBestBuildsNames(bestBuilds);
    return bestBuilds;
}

function finaliseBuild(build: Build) {
    addBuildRequirement(build, [[{ type: "moreThanOrEquals", stat: "level", value: build.level }]]);
    for (const [panoId, setNumber] of Object.entries(build.panoplies)) {
        const pano = getPanoply(panoId);
        build.noCharStats = concatStats(
            build.noCharStats,
            getPanoply(panoId).statsWithBonus[setNumber - 1]!,
        );
        build.panopliesBonus += setNumber - 1;
        if (pano.requirements) {
            build.requirements.push(...pano.requirements[setNumber - 1]!);
        }
    }
    build.requirements = mergeRequirements(build.requirements);
    build.stats = concatStats(build.noCharStats, get(preStats));

    calculateBuildValue(build);
}

function addBuildRequirement(build: Build, requirements?: Requirement[][]) {
    if (requirements) {
        build.requirements.push(...requirements);
    }
}
function addBuildMinRequirement(build: Build, requirement?: MinRequirement) {
    if (!requirement) {
        return;
    }

    let requirementExists = false;
    for (const buildReq of build.minRequirements) {
        if (buildReq.type == requirement.type) {
            requirementExists = true;
            if (requirement.type.includes("LessThan")) {
                if (requirement.value && requirement.value < buildReq.value!) {
                    buildReq.value = requirement.value;
                }
                if (requirement.value2 && requirement.value2 < buildReq.value2!) {
                    buildReq.value2 = requirement.value2;
                }
                if (requirement.value && requirement.value < buildReq.value!) {
                    buildReq.value = requirement.value;
                }
            } else {
                if (requirement.value && requirement.value > buildReq.value!) {
                    buildReq.value = requirement.value;
                }
                if (requirement.value2 && requirement.value2 > buildReq.value2!) {
                    buildReq.value2 = requirement.value2;
                }
                if (requirement.value && requirement.value > buildReq.value!) {
                    buildReq.value = requirement.value;
                }
            }
            break;
        }
    }
    if (!requirementExists) {
        build.minRequirements.push(requirement);
    }
}

let timeout: number;
export function refreshBuildsValue() {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => {
        bestBuilds.update(refreshBuildsValueNoThrottle);
        savedBuilds.update(refreshBuildsValueNoThrottle);
        calculateBuildToDisplay();
        const buildToCompare = get(comparedBuild);
        if (buildToCompare) {
            comparedBuild.update(refreshBuildValue);
            const builds = get(buildsDisplayed);
            for (const build of builds) {
                diffBuild(build, buildToCompare);
            }
            buildsDisplayed.set([...builds]);
        }
    }, 150);
}
export function refreshBuildsValueNoThrottle(builds: Build[]): Build[] {
    for (const build of builds) {
        refreshBuildValue(build);
    }
    builds.sort((a, b) => b.value - a.value);
    return builds;
}
export function refreshBuildValue(build: Build) {
    build.stats = concatStats(build.noCharStats, get(preStats));

    calculateBuildValue(build);

    return build;
}

export function calculateBuildValue(build: Build) {
    capBuildStats(build);
    if (isBuildMinStatsOk(build) && checkAndRequirement(build) != "invalid") {
        build.value = calculateStatsValue(build.cappedStats);
    } else {
        build.value = 0;
    }
}
function isBuildMinStatsOk(build: Build): boolean {
    for (const [key, minStat] of Object.entries(get(minStats))) {
        const keyStat = key as StatKey;
        if ((build.cappedStats[keyStat] ?? 0) < minStat) {
            return false;
        }
    }
    return true;
}

function capBuildStats(build: Build) {
    build.cappedStats = { ...build.stats };

    function capStat(cappedStats: Partial<Stats>, statKey: StatKey, value: number) {
        if (cappedStats[statKey] == undefined || cappedStats[statKey] > value) {
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

    // const PANO_CIRE_MOMORE_ID = "6h";
    const count = build.panoplies[PANO_CIRE_MOMORE_ID];
    if (count && count >= 2) {
        switch (count) {
            case 2:
                capStat(build.cappedStats, "mp", 4);
                capStat(build.cappedStats, "range", 4);
                capStat(build.cappedStats, "summon", 4);
                break;
            case 3:
            case 4:
            case 5:
                capStat(build.cappedStats, "mp", 3);
                capStat(build.cappedStats, "range", 3);
                capStat(build.cappedStats, "summon", 3);
                break;
            default:
                capStat(build.cappedStats, "mp", 2);
                capStat(build.cappedStats, "range", 2);
                capStat(build.cappedStats, "summon", 2);
                break;
        }
    }

    for (const requirement of build.minRequirements) {
        switch (requirement.type) {
            case "apLessThanOrMpLessThan":
                if (
                    build.cappedStats["ap"] &&
                    build.cappedStats["ap"] >= (requirement.value ?? 9999) &&
                    build.cappedStats["mp"] &&
                    build.cappedStats["mp"] >= (requirement.value2 ?? 9999)
                ) {
                    const min = get(minStats);
                    if (
                        (min["ap"] ?? 0) >= requirement.value! &&
                        (min["mp"] ?? 0) >= requirement.value2!
                    ) {
                        build.value = 0;
                    }
                    if ((min["ap"] ?? 0) >= requirement.value!) {
                        capStat(build.cappedStats, "mp", requirement.value2! - 1);
                    } else if ((min["mp"] ?? 0) >= requirement.value2!) {
                        capStat(build.cappedStats, "ap", requirement.value! - 1);
                    } else {
                        const w = get(weights);
                        if ((w["ap"] ?? 0) > (w["mp"] ?? 0)) {
                            capStat(build.cappedStats, "mp", requirement.value2! - 1);
                        } else {
                            capStat(build.cappedStats, "ap", requirement.value! - 1);
                        }
                    }
                }
                break;
            case "apLessThanAndMpLessThan":
                if (
                    build.cappedStats["ap"] &&
                    build.cappedStats["ap"] >= (requirement.value ?? 9999)
                ) {
                    capStat(build.cappedStats, "ap", requirement.value! - 1);
                }
                if (
                    build.cappedStats["mp"] &&
                    build.cappedStats["mp"] >= (requirement.value2 ?? 9999)
                ) {
                    capStat(build.cappedStats, "mp", requirement.value2! - 1);
                }
                break;
            case "apLessThan":
                if (
                    build.cappedStats["ap"] &&
                    build.cappedStats["ap"] >= (requirement.value ?? 9999)
                ) {
                    capStat(build.cappedStats, "ap", requirement.value! - 1);
                }
                break;
            case "mpLessThan":
                if (
                    build.cappedStats["mp"] &&
                    build.cappedStats["mp"] >= (requirement.value ?? 9999)
                ) {
                    capStat(build.cappedStats, "mp", requirement.value2! - 1);
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
    const diffBuild = initBuild(
        comparedBuild.name,
        comparedBuild.id,
        build.value - comparedBuild.value,
    );

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

export function totalCombinations(minItems: MinItem[][]): number {
    if (!minItems) {
        return 0;
    }
    let totalCombinations = 1;
    let atLeast1: boolean = false;
    for (const minItemsCat of minItems) {
        totalCombinations *= minItemsCat.length ?? 1;
        if (minItemsCat.length > 0) {
            atLeast1 = true;
        }
    }
    // console.log("totalCombinations", totalCombinations);
    return atLeast1 ? totalCombinations : 0;
}

export function addToSavedBuilds(build: Build) {
    let alreadyExists = false;
    for (const savedBuild of get(savedBuilds)) {
        if (savedBuild.id == build.id) {
            alreadyExists = true;
            savedBuild.name = build.name;

            // const updated = [...savBuilds];
            // updated[index] = { ...updated[index], name: build.name } as Build;
            // savedBuilds.set(updated);
            savedBuilds.update((builds) => [...builds, savedBuild]);
            break;
        }
    }
    if (!alreadyExists) {
        // savedBuilds.update((builds) => [...builds, build]);
        savedBuilds.update((builds) => [...builds, build].sort((a, b) => b.value - a.value));
    }
}
export function deleteSavedBuild(id: string) {
    savedBuilds.update((builds) => builds.filter((b) => b.id !== id));
}
export function getSavedBuild(id: string): Build | undefined {
    for (const savedBuild of get(savedBuilds)) {
        if (savedBuild.id == id) {
            return savedBuild;
        }
    }
    return undefined;
}

export function updateComparedBuildName(build: Build) {
    comparedBuild.update((comparedB) => {
        if (comparedB && comparedB.id == build.id) {
            // console.log("replacing name", build.name);
            return { ...comparedB, name: build.name };
        }
        return comparedB;
    });
}
export function updateBestBuildsNames(bestBuilds: Build[]) {
    for (const savedBuild of get(savedBuilds)) {
        updateComparedBuildName(savedBuild);
        for (const bestBuild of bestBuilds) {
            if (savedBuild.id == bestBuild.id) {
                // console.log("check name", savedBuild.name);
                bestBuild.name = savedBuild.name;
            }
        }
    }
    // return undefined;
    // for (const build of bestBuilds) {
    //     const savedBuild = getSavedBuild(build.id);
    //     if (savedBuild) {
    //         console.log("check name", savedBuild.name);
    //         build.name = savedBuild.name;
    //         updateComparedBuildName(build);
    //     }
    // }
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
export type RequirementResult = "ok" | "warning" | "invalid";

export function checkAndRequirement(
    build: Build,
    // andRequirements: Requirement[][],
): RequirementResult {
    let andStatuses: RequirementResult[] = [];
    for (const orRequirements of build.requirements) {
        const orRequirement = checkOrRequirement(
            orRequirements,
            build.cappedStats,
            build.panopliesBonus,
        );
        if (orRequirement == "invalid") {
            return "invalid";
        } else {
            andStatuses.push(orRequirement);
        }
    }
    if (andStatuses.includes("warning")) return "warning";
    return "ok";
}

const warningStats: StatKey[] = ["vitality", "strength", "intelligence", "chance", "agility"];
export function checkOrRequirement(
    orRequirements: Requirement[],
    statsToCheck: Partial<Stats>,
    panopliesBonus?: number,
): RequirementResult {
    let orStatuses: RequirementResult[] = [];
    for (const requirement of orRequirements) {
        let requirementValue: number = requirement.value;
        let statValueToCheck: number;
        let failResult: RequirementResult;

        if (requirement.stat == "level") {
            statValueToCheck = get(level);
            failResult = "invalid";
        } else if (requirement.stat == "panopliesBonus") {
            statValueToCheck = panopliesBonus ? panopliesBonus : 0;
            failResult = "invalid";
        } else {
            // statValueToCheck = build.cappedStats[requirement.stat] ?? 0;
            statValueToCheck = statsToCheck[requirement.stat] ?? 0;
            failResult = warningStats.includes(requirement.stat) ? "warning" : "invalid";
        }
        if (requirement.stat == "vitality") {
            requirementValue += get(preStats).vitality ?? 0;
        }
        switch (requirement.type) {
            case "lessThan":
                if (requirementValue <= statValueToCheck) {
                    orStatuses.push(failResult);
                } else {
                    return "ok";
                }
                break;
            case "moreThan":
                if (requirementValue >= statValueToCheck) {
                    orStatuses.push(failResult);
                } else {
                    return "ok";
                }
                break;
            case "lessThanOrEquals":
                if (requirementValue < statValueToCheck) {
                    orStatuses.push(failResult);
                } else {
                    return "ok";
                }
                break;
            case "moreThanOrEquals":
                if (requirementValue > statValueToCheck) {
                    orStatuses.push(failResult);
                } else {
                    return "ok";
                }
                break;
        }
    }
    // if (orStatuses.includes("ok")) return "ok";
    if (orStatuses.includes("warning")) return "warning";
    return "invalid";
}

export function mergeRequirements(andRequirements: Requirement[][]): Requirement[][] {
    let indexesToMerge: number[] = [];

    for (let i = 0; i < andRequirements.length; i++) {
        const iOrRequirement = andRequirements[i]!;
        for (let j = i + 1; j < andRequirements.length; j++) {
            const jOrRequirement = andRequirements[j]!;
            // console.log("i - j", i, j);

            if (orImpliesOr(iOrRequirement, jOrRequirement)) {
                indexesToMerge.push(j);
                continue;
            }
            if (orImpliesOr(jOrRequirement, iOrRequirement)) {
                indexesToMerge.push(i);
                continue;
            }
        }
    }
    // console.log("indexesToMerge", indexesToMerge);
    // for (const orRequirements of andRequirements) {
    let newRequirements: Requirement[][] = [];
    for (let i = 0; i < andRequirements.length; i++) {
        if (!indexesToMerge.includes(i)) {
            newRequirements.push(andRequirements[i]!);
        }
    }
    // console.log("andRequirements", andRequirements);
    // console.log("newRequirements", newRequirements);
    return newRequirements;
}

function orImpliesOr(A: Requirement[], B: Requirement[]): boolean {
    return A.every((a) => B.some((b) => impliesReq(a, b)));
}
function impliesReq(a: Requirement, b: Requirement): boolean {
    if (a.stat !== b.stat) return false;

    if (
        (a.type === "lessThan" || a.type === "lessThanOrEquals") &&
        (b.type === "lessThan" || b.type === "lessThanOrEquals")
    ) {
        return a.value <= b.value;
    }
    if (
        (a.type === "moreThan" || a.type === "moreThanOrEquals") &&
        (b.type === "moreThan" || b.type === "moreThanOrEquals")
    ) {
        return a.value >= b.value;
    }
    return false;
}
