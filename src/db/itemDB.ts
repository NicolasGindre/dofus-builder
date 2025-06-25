import { type Item, type Items, type ItemCategory, type Panoply, type Panoplies, ITEM_CATEGORIES } from "../types/item"
import * as dofusDB from "../clients/dofusDB"

const dbPath = "./src/db/data"

export let itemsCategory: Record<ItemCategory, Items> = Object.fromEntries(
  ITEM_CATEGORIES.map(cat => [cat, {}])
) as Record<ItemCategory, Items>

export let items: Items = {}
export let panoplies: Panoplies = {}

export function getItem(name: string): Item | undefined {
    return items[name]
}

export async function loadItems(levelMin: number, levelMax: number): Promise<void> {

    panoplies = await Bun.file(`${dbPath}/panoplies.json`).json()

    for (const category of ITEM_CATEGORIES) {
        const itemsCategoryDB: Items = await Bun.file(`${dbPath}/${category}.json`).json()

        for (const [itemName, item] of Object.entries(itemsCategoryDB)) {
            if (item.level >= levelMin && item.level <= levelMax) {
                items[itemName] = item
                itemsCategory[category][itemName] = item
            }
        }

        console.log("Loaded "+ Object.keys(itemsCategory[category]).length + " " + category)
    }
    console.log("Loaded "+ Object.keys(items).length + " items")
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
