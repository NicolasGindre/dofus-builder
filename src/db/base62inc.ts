const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function nextValue(prev?: string): string {
    if (!prev) return "0";
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

// Example
// let val = "";
// for (let i = 0; i < 400000; i++) {
//     val = nextValue(val);
//     console.log(val);
// }
