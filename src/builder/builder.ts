

import type { Character } from "../types/character"
import * as itemDB from "../db/item"
import { type Item, type Items, type ItemCategory, type Panoply, type Panoplies, ITEM_CATEGORIES } from "../types/item"
import { calculateItemValue } from "./value"

// let character: Character = {
//     baseStats: {
//         AP: 7,
//         MP: 3,

//         health: 1050,
//         pods: 1995,
//     }
// }
// type ItemsValue = Record<Item, number>

const distanceFromBestRatio = 1.3

export async function calculateBestBuilds(): Promise<void> {
    await itemDB.loadItems(195, 200)

    let bestItems: Record<string, number> = {}
    let bestValueFound: number = 0

    for (const [itemName, item] of Object.entries(itemDB.items)) {
        const itemValue = calculateItemValue(item)

        if (itemValue > bestValueFound) {

            bestValueFound = itemValue
            for (const [name, value] of Object.entries(bestItems)) {
                if (value * distanceFromBestRatio < bestValueFound) {
                    delete bestItems[name]
                }
            }
        } else if (itemValue * distanceFromBestRatio >= bestValueFound) {
            bestItems[itemName] = itemValue
        }
    }

    console.log(bestItems)
}
