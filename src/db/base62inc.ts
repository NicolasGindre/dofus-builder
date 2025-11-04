const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function nextValue(prev?: string): string {
    if (!prev) return "0";
    if (prev == "ZZ") {
        throw new Error("Reached maximum allowed encoding");
    }
    const base = ALPHABET.length;
    const chars = prev.split("");
    let i = chars.length - 1;

    while (i >= 0) {
        const current = chars[i]!;
        const pos = ALPHABET.indexOf(current);

        if (pos < base - 1) {
            chars[i] = ALPHABET[pos + 1]!;
            return chars.join("");
        }

        chars[i] = ALPHABET[0]!;
        i--;
    }

    return ALPHABET[0]! + chars.join("");
}

function idToIndex(id: string): number {
    const a = ALPHABET.indexOf(id[0]!);
    const b = ALPHABET.indexOf(id[1]!);
    return a * ALPHABET.length + b;
}

export function sortItemsIds(itemIds: string[]): string[] {
    return [...itemIds].sort((a, b) => idToIndex(a) - idToIndex(b));
}
