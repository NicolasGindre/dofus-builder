import { get } from "svelte/store";
import { itemsLocked, itemsSelected } from "../../stores/builder";
import { ALPHABET, encodeBase64, rankCombination } from "./encoding";

const ITEM_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" as const;
const ITEM_ALPHABET_LENGTH = ITEM_ALPHABET.length;

export function encodeItems(): string {
    let encodedItems: string[] = [];
    // let lockedItems: string[] = [];
    for (const items of Object.values(get(itemsSelected))) {
        for (const item of Object.values(items)) {
            encodedItems.push(item.id);
        }
    }
    encodedItems = sortItemsIds(encodedItems);
    const lockedItemsStr = encodeLocked(encodedItems);
    const encodedItemsStr = encodeConsecutive(encodedItems);

    // const encodedItemsStr = encodedItems.sort().join("");
    // const lockedItemsStr = lockedItems.sort().join("");
    return lockedItemsStr ? `${encodedItemsStr}|${lockedItemsStr}` : encodedItemsStr;
    // return encodedItemsStr;
}

function encodeConsecutive(encodedItems: string[]): string {
    if (encodedItems.length === 0) return "";

    let result = "";
    // let runStart = idToIndex(encodedItems[0]!);
    let runCount = 0;

    for (let i = 1; i < encodedItems.length; i++) {
        const current = idToIndex(encodedItems[i]!);
        const previous = idToIndex(encodedItems[i - 1]!);

        if (current === previous + 1 && runCount < ITEM_ALPHABET_LENGTH - 1) {
            runCount++;
        } else {
            // flush previous run
            result += encodedItems[i - 1 - runCount];
            if (runCount > 0) result += "+" + ITEM_ALPHABET[runCount];
            // runStart = current;
            runCount = 0;
        }
    }

    // flush last run
    result += encodedItems[encodedItems.length - 1 - runCount];
    if (runCount > 0) result += "+" + ALPHABET[runCount];

    return result;
}

function idToIndex(id: string): number {
    const a = ITEM_ALPHABET.indexOf(id[0]!);
    const b = ITEM_ALPHABET.indexOf(id[1]!);
    return a * ITEM_ALPHABET_LENGTH + b;
}

export function sortItemsIds(itemIds: string[]): string[] {
    return [...itemIds].sort((a, b) => idToIndex(a) - idToIndex(b));
}

function encodeLocked(encodedItems: string[]): string {
    const lockeds = Object.values(get(itemsLocked));
    const n = encodedItems.length;
    if (n === 0) {
        return "";
    }
    // gather locked indices
    const lockedIndices: number[] = [];
    for (let i = 0; i < n; i++) {
        const id = encodedItems[i]!;
        for (const lockedGroup of lockeds) {
            if (lockedGroup[id]) {
                lockedIndices.push(i);
                break;
            }
        }
    }

    const k = lockedIndices.length;
    if (k === 0) return ""; // no locked items

    const rank = rankCombination(lockedIndices);
    const encodedRank = encodeBase64(rank);

    const kChar = ALPHABET[k];
    return kChar + encodedRank;
}
