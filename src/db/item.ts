import { type Item, type Items, type ItemCategory, type Panoply, type Panoplies, ITEM_CATEGORIES } from "../types/item"
import * as dofusDB from "../clients/dofusDB"

const dbPath = "./src/db/data"

// export let items: Items = Object.fromEntries(
//     ITEM_CATEGORIES.map((category): [ItemCategory, Item[]] => [category, []])
// ) as Items

export let items: Items = {}
export let panoplies: Panoplies = {}

export async function loadItems() {
    const content = await Bun.file(`${dbPath}/panoplies.json`).json()
    panoplies = await JSON.parse(content)

    for (const category of ITEM_CATEGORIES) {
        const content = await Bun.file(`${dbPath}/${category}.json`).json()
        items[category] = await JSON.parse(content)
    }
}

export async function saveItems(category: ItemCategory, items: Record<string, Item>): Promise<void> {
    await Bun.write(`${dbPath}/${category}.json`, JSON.stringify(items, null, 2))
}

export async function savePanoplies(panoplies: Panoplies): Promise<void> {
    await Bun.write(`${dbPath}/panoplies.json`, JSON.stringify(panoplies, null, 2))
}

export async function downloadItems(): Promise<void> {

    for (const category of ITEM_CATEGORIES) {
        const itemsCategory = await dofusDB.downloadItems(category)
        for (const [itemName, item] of Object.entries(itemsCategory)) {
            items[itemName] = item
        }

        saveItems(category, itemsCategory)
    }
    panoplies = await dofusDB.downloadPanopliesStats()

    fillPanopliesItems()
    savePanoplies(panoplies)
}

export function fillPanopliesItems() {
    for (const [itemName, item] of Object.entries(items)) {
        if (item.panoply != undefined) {
            panoplies[item.panoply]?.items.push(itemName)
        }
    }
}
