import { get } from "svelte/store";
import { itemsLocked, itemsSelected, panoplies } from "../../stores/builder";
import {
    ALPHABET,
    decodeBase64,
    encodeBase64,
    rankCombination,
    unrankCombination,
} from "./encoding";
import { addItem, lockItem } from "../item";
import { getItem } from "../frontendDB";
import type { Panoply } from "../../types/item";

const ITEM_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" as const;
const ITEM_ALPHABET_LENGTH = ITEM_ALPHABET.length;

let allPanoplies: Panoply[] = [];
export function setPanopliesSorted() {
    // allPanoplies = panoSorted;
    allPanoplies = Object.values(get(panoplies)).sort((a, b) => idToIndex(a.id) - idToIndex(b.id));
}

function idToIndex(id: string): number {
    const a = ITEM_ALPHABET.indexOf(id[0]!);
    const b = ITEM_ALPHABET.indexOf(id[1]!);
    return a * ITEM_ALPHABET_LENGTH + b;
}
function indexToId(index: number): string {
    const a = Math.floor(index / ITEM_ALPHABET_LENGTH);
    const b = index % ITEM_ALPHABET_LENGTH;
    return ITEM_ALPHABET[a]! + ITEM_ALPHABET[b]!;
}
export function sortItemsIds(itemIds: string[]): string[] {
    return [...itemIds].sort((a, b) => idToIndex(a) - idToIndex(b));
}

function encodeK(k: number): string {
    if (k === 0) return "0";
    let out = "";
    while (k > 0) {
        out = ALPHABET[k % ITEM_ALPHABET_LENGTH] + out;
        k = Math.floor(k / ITEM_ALPHABET_LENGTH);
    }
    return out;
}
function decodeK(kStr: string): number {
    let k = 0;
    for (const ch of kStr) {
        k = k * ITEM_ALPHABET_LENGTH + ALPHABET.indexOf(ch);
    }
    return k;
}

export function encodeItems(): string {
    let encodedItems: string[] = [];
    // let lockedItems: string[] = [];
    for (const items of Object.values(get(itemsSelected))) {
        for (const item of Object.values(items)) {
            encodedItems.push(item.id);
        }
    }
    if (encodedItems.length == 0) {
        return "";
    }
    encodedItems = sortItemsIds(encodedItems);
    const lockedItemsStr = encodeLocked(encodedItems);
    const encodedPanosStr = encodePanoplies(encodedItems);
    const encodedItemsStr = encodeConsecutive(encodedItems);

    // const encodedItemsStr = encodedItems.sort().join("");
    // const lockedItemsStr = lockedItems.sort().join("");
    return lockedItemsStr
        ? `${encodedPanosStr}|${encodedItemsStr}|${lockedItemsStr}`
        : `${encodedPanosStr}|${encodedItemsStr}`;
    // return encodedItemsStr;
}

// Modifies encodedItems : Takes out items that were encoded in pano
export function encodePanoplies(encodedItems: string[]): string {
    if (encodedItems.length === 0) return "";

    const selectedPanoIndices: number[] = [];

    // For each panoply, check if all its items are selected consecutively
    for (let panoIndex = 0; panoIndex < allPanoplies.length; panoIndex++) {
        const pano = allPanoplies[panoIndex]!;
        const panoItems = pano.items;

        // Find the first index of the first item in encodedItems
        const startIdx = encodedItems.indexOf(panoItems[0]!);
        if (startIdx === -1) continue;

        // Check if all items match consecutively
        let fullMatch = true;
        for (let i = 0; i < panoItems.length; i++) {
            if (encodedItems[startIdx + i] !== panoItems[i]) {
                fullMatch = false;
                break;
            }
        }

        if (fullMatch) {
            // Mark this panoply as selected
            selectedPanoIndices.push(panoIndex);
            // Remove its items from encodedItems
            encodedItems.splice(startIdx, panoItems.length);
            // Adjust scanning after removal
        }
    }

    const k = selectedPanoIndices.length;
    if (k === 0) return "";

    const rank = rankCombination(selectedPanoIndices);
    const encodedRank = encodeBase64(rank);
    // const kChar = ALPHABET[k];
    let kChar = encodeK(k);
    if (kChar.length > 1) {
        kChar = `[${kChar}]`;
    }
    return kChar + encodedRank;
}

function encodeConsecutive(encodedItems: string[]): string {
    if (encodedItems.length === 0) return "";

    let result = "";
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
            runCount = 0;
        }
    }

    // flush last run
    result += encodedItems[encodedItems.length - 1 - runCount];
    if (runCount > 0) result += "+" + ALPHABET[runCount];

    return result;
}

function encodeLocked(encodedItems: string[]): string {
    // console.log("encodedItems", encodedItems);
    encodedItems = sortItemsIds(encodedItems);

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
                lockedIndices.push(encodedItems.indexOf(id));
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

export function decodeItems(encodedItems: string) {
    if (!encodedItems) {
        return;
    }
    const split = encodedItems.split("|");
    let decodedItems: string[] = [];
    if (split[0]) {
        decodedItems.push(...decodePanoplies(split[0]));
    }
    if (split[1]) {
        decodedItems.push(...decodeSingleItems(split[1]));
    }
    for (const itemId of decodedItems) {
        addItem(getItem(itemId));
    }
    if (split[2]) {
        const lockedItemsId = decodeLockedItems(split[2], decodedItems);
        for (const lockedItemId of lockedItemsId) {
            lockItem(getItem(lockedItemId));
        }
    }
}

export function decodeLockedItems(encodedLockeds: string, decodedItems: string[]): string[] {
    decodedItems = sortItemsIds(decodedItems);
    // console.log("decoded items", decodedItems);
    const k = ALPHABET.indexOf(encodedLockeds[0]!);
    const rank = decodeBase64(encodedLockeds.slice(1));
    return unrankCombination(rank, k, decodedItems);
}

export function decodeSingleItems(encodedItems: string): string[] {
    const decodedItems: string[] = [];
    let i = 0;

    while (i < encodedItems.length) {
        // Read the current 2-char item ID
        const id = encodedItems.slice(i, i + 2);
        decodedItems.push(id);
        i += 2;

        // If there’s a '+' next, expand the run
        if (encodedItems[i] === "+") {
            const countChar = encodedItems[i + 1]!;
            const count = ALPHABET.indexOf(countChar);

            const startIndex = idToIndex(id);
            for (let j = 1; j <= count; j++) {
                decodedItems.push(indexToId(startIndex + j));
            }
            i += 2;
        }
    }
    return decodedItems;
}

export function decodePanoplies(encodedPanos: string): string[] {
    let k: number;
    let rank: bigint;
    const firstChar = encodedPanos[0]!;

    if (firstChar == "[") {
        const endKIndex = encodedPanos.indexOf("]");
        k = decodeK(encodedPanos.slice(1, endKIndex));
        rank = decodeBase64(encodedPanos.slice(endKIndex + 1));
    } else {
        k = decodeK(firstChar);
        rank = decodeBase64(encodedPanos.slice(1));
    }
    const decodedPanoplies = unrankCombination(rank, k, allPanoplies);

    let decodedItems: string[] = [];
    for (const pano of decodedPanoplies) {
        decodedItems.push(...pano.items);
    }
    return decodedItems;
}
