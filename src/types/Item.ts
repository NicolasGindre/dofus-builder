import type { Stats } from "./character"

export const ITEM_CATEGORIES = [
  "amulet", "belt", "boots", "cloak", "dofus",
  "ring", "hat", "pet", "weapon", "shield"
] as const

export type ItemCategory = typeof ITEM_CATEGORIES[number]

export type Item = {
    level : number
    name : string
    // value : number | undefined
    panoply : string | undefined
    category : ItemCategory
    stats : ItemStats
}
export type ItemStats = Partial<Stats>

export type Items = Record<string, Item>

export type Panoply = {
    name : string
    items : string[]
    stats : ItemStats[]
}
export type Panoplies = Record<string, Panoply>
