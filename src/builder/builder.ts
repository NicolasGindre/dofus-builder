

import { type Character, type Build, type Stats, calculateStats, BUILD_SLOTS, SLOT_TO_CATEGORY, type BuildSlots } from "../types/character"
import * as itemDB from "../db/itemDB"
import { type Item, type Items, type ItemCategory, type Panoply, type Panoplies, ITEM_CATEGORIES } from "../types/item"
import { calculateItemAndPanoValue, calculateStatsValue } from "./value"

type BestBuildsData = {
    processed : number
    bestValue : number
    bestBuilds : Record<string, number>
}

export async function calculateBestBuilds(): Promise<void> {
    await itemDB.loadItems(195, 200)

    let build: Build = {
        hat: itemDB.getItem("Kidibonnet"),
        // amulet: itemDB.getItem("Talisman Glouti"),
        ring1: itemDB.getItem("Alliance Gloursonne"),
        // ring2: itemDB.getItem("Anneau Tique"),
        // shield: itemDB.getItem("Trompe-la-Mort"),
        weapon: itemDB.getItem("Masse Étacée"),
        belt: itemDB.getItem("Ceintacé"),
        cloak: itemDB.getItem("Capchalot"),
        boots: itemDB.getItem("Baleinabottes"),
        // boots: itemDB.getItem("Sandales d'Atcham"),
    }

    let baseStats: Partial<Stats> = {
        AP: 5,
        MP: 3,

        health: 2000,
        pods: 2000,
    }
    // let character: Character = {
    //     baseStats: baseStats,
    //     build: build,
    //     stats: calculateStats(baseStats, build),
    // }

    const emptySlots = BUILD_SLOTS.filter(slot => !build[slot])

    let combination = 1
    for (const slot of emptySlots) {
        const category = SLOT_TO_CATEGORY[slot]
        const itemsNumber = Object.keys(itemDB.itemsCategory[category]).length
        if (itemsNumber > 0) combination *= itemsNumber
    }

    console.log(emptySlots)
    console.log(combination)

    // let bestValue = 0
    // let processed = 0
    let bestBuildsData: BestBuildsData = {
        processed: 0,
        bestValue: 0,
        bestBuilds: {"emptyBuild" : 0}
    }

    generateBuilds(emptySlots, build, baseStats, bestBuildsData)
    console.log(bestBuildsData.bestBuilds)

    // for (const _ of ) {
    // }
}

function generateBuilds(
    slots: BuildSlots[],
    currentBuild: Build = {},
    baseStats: Partial<Stats>,
    bestBuildsData: BestBuildsData,
    slotIndex = 0,
){
    const slot = slots[slotIndex]
    if (slot == undefined) {
        checkBuildValue(currentBuild, baseStats, bestBuildsData)
        return
    }
    const category = SLOT_TO_CATEGORY[slot]
    const items = itemDB.itemsCategory[category]

    if (!items || Object.keys(items).length === 0) {
        generateBuilds(slots, currentBuild, baseStats, bestBuildsData, slotIndex + 1)
        return
    }

    // console.log(`Slot: ${slot}, Category: ${category}, Items: ${Object.values(items).length}`)
    for (const item of Object.values(items)) {
        if (slot == "ring2") {
            if (currentBuild.ring1?.name == item.name) {
                continue
            }
        }
        currentBuild[slot] = item
        bestBuildsData.processed++
        generateBuilds(slots, currentBuild, baseStats, bestBuildsData, slotIndex + 1)
        // delete currentBuild[slot] // backtrack
    }
}

function checkBuildValue(
    currentBuild: Build,
    baseStats: Partial<Stats>,
    bestBuildsData: BestBuildsData
) {

    const stats = calculateStats(baseStats, currentBuild)
    const value = calculateStatsValue(stats)
    // console.log(value)

    let itemIsBetter = false
    for (const allBestValue of Object.values(bestBuildsData.bestBuilds)) {
        if (value > allBestValue) {
            itemIsBetter = true
            break
        }
    }
    if (itemIsBetter) {

        let bestBuildStr = ""
        for (const [slot, item] of Object.entries(currentBuild)) {
            // const currentItem = build[currentSlot]
            bestBuildStr = `${bestBuildStr} | ${slot}: ${item.name}`
            
        }
        // console.log(bestBuildStr)
        // console.log(`Value : ${value}. Best value : ${bestBuildsData.bestValue}. Processed : ${bestBuildsData.processed} builds`)

        bestBuildsData.bestBuilds[bestBuildStr] = value

        if ((Object.keys(bestBuildsData.bestBuilds).length) > 8) {
            let worstValue = 999999999
            let worstBuild = ""
            for (const [buildName, allWorstValue] of Object.entries(bestBuildsData.bestBuilds)) {
                if (allWorstValue < worstValue) {
                    worstValue = allWorstValue
                    worstBuild = buildName
                }
            }
            delete bestBuildsData.bestBuilds[worstBuild]
        }

        if (value > bestBuildsData.bestValue) {
            bestBuildsData.bestValue = value
        }
        // console.log(bestBuildsData.bestBuilds)
        // process.stdout.write(bestBuildsData.bestBuilds.toString())
        // console.log(`Value : ${value}. Best value : ${bestBuildsData.bestValue}. Processed : ${bestBuildsData.processed} builds`)
    }
}

const distanceFromBestRatio = 1.5

export async function calculateBestItems(): Promise<void> {
    await itemDB.loadItems(195, 200)

    for (const [category, items] of Object.entries(itemDB.itemsCategory)) {
        let bestItems: Record<string, number> = {}
        let bestValueFound: number = 0
        
        for (const [itemName, item] of Object.entries(items)) {
            const itemValue = calculateItemAndPanoValue(item)

            if (itemValue * distanceFromBestRatio >= bestValueFound) {
                bestItems[itemName] = itemValue
                if (itemValue > bestValueFound) {
                    bestValueFound = itemValue

                    for (const [name, value] of Object.entries(bestItems)) {
                        if (value * distanceFromBestRatio < bestValueFound) {
                            delete bestItems[name]
                        }
                    }
                    // console.log(itemName, item.stats)
                    // console.log(itemName, item.stats)
                }
            }
        }

        // for (const [name, value] of Object.entries(bestItems)) {
        //     console.log(itemName, item.stats)
        // }
        console.log(category, Object.keys(bestItems).length)
        console.log(bestItems)
    }
}
