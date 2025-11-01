import { decode, encode } from "@msgpack/msgpack";

// Paste a working URL from the site here:
const url =
    "https://www.dofusbook.net/fr/equipement/dofus-stuffer/objets?stuff=hqEwi6EwzQR+oTFkoTJkoTNkoTRkoTVkoTYHoTcDoTlkojExAaIyM80D6KExlgAAAAAAAKEyzMihMwChNIyhMAChNAChNwChOAChOQCiMTAAojExAKIxMgCiMTMAojE0AKIxNQCiMTYAoTWVzUs0zTb1zUszzTbzzT8+";
// const url =
//     "https://www.dofusbook.net/fr/equipement/dofus-stuffer/objets?stuff=hqEwi6EwzQR+oTFkoTJkoTNkoTRkoTVkoTYHoTcDoTlkojExAaIyM80D6KExlgAAAAAAAKEyzMihMwahNN4AEKExAKEyAKEzAKE0AKE1AKE2AKE3AKE4AKE5AKIxMACiMTEAojEyAKIxMwCiMTQAojE1AKIxNgChNZTNM0jNSzPNM0fNSzQ=";

// 1️⃣ Get raw param
let raw = new URL(url).searchParams.get("stuff") || "";
raw = decodeURIComponent(raw);

// 2️⃣ Fix URL-safe Base64 variants
raw = raw.replace(/ /g, "+").replace(/-/g, "+").replace(/_/g, "/");

// 3️⃣ Ensure padding length is multiple of 4
while (raw.length % 4) raw += "=";

// 4️⃣ Decode Base64 to bytes
const buf = Buffer.from(raw, "base64");

// Debug first few bytes
console.log(
    "First bytes:",
    [...buf.subarray(0, 8)].map((b) => b.toString(16).padStart(2, "0")).join(" "),
);

// 5️⃣ Decode MessagePack
try {
    const obj = decode(buf);
    console.dir(obj, { depth: 3 });
} catch (err) {
    console.error("❌ MsgPack decode failed:", err);
}
const t: Record<number, any> = {
    0: { 0: 1150, 1: 100, 2: 100, 3: 100, 4: 100, 5: 100, 6: 7, 7: 3, 9: 100, 11: 1, 23: 1000 },
    1: [0, 0, 0, 0, 0, 0],
    2: 200,
    3: 0,
    4: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0,
        12: 0,
        13: 0,
        14: 0,
        15: 0,
        16: 0,
    },
    5: [13197],
};

const bytes = encode(t);
const b64 = Buffer.from(bytes).toString("base64");
const url2 = `https://www.dofusbook.net/fr/equipement/dofus-stuffer/objets?stuff=${encodeURIComponent(b64)}`;
console.log(url);
