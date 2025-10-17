import LZString from "lz-string"; // optional
import { weights } from "../stores/builder";
import type { Stats } from "../types/stats";
import { get } from "svelte/store";

export function encodeWeights(urlString: string) {
    console.log("encoding weights...?");
    // const weights =
    const json = JSON.stringify(get(weights));
    const packed = LZString.compressToEncodedURIComponent(json); // URL-safe and short
    // const url = new URL(window.location.href);
    const url = new URL(urlString);
    url.hash = `w=${packed}`;
    console.log(url.toString());
    // return url.toString();
}

export function decodeWeightsFromUrl(params: URLSearchParams) {
    // if (typeof window === "undefined") {
    // }
    // const params = new URLSearchParams(window.location.hash.slice(1));
    console.log("decoding weights...?");
    const packed = params.get("w");
    if (!packed) throw new Error("No weights in URL");
    const json = LZString.decompressFromEncodedURIComponent(packed);
    if (!json) throw new Error("Bad data");
    const importedWeights: Partial<Stats> = JSON.parse(json);
    // weights.set(importedWeights);
}

// base64url helpers
// const b64u = {
//     enc: (buf: ArrayBuffer) =>
//         btoa(String.fromCharCode(...new Uint8Array(buf)))
//             .replace(/\+/g, "-")
//             .replace(/\//g, "_")
//             .replace(/=+$/g, ""),
//     dec: (s: string) =>
//         Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))
//             .buffer,
// };

// gzip (Compression Streams API is widely supported)
// async function gzipBytes(bytes: Uint8Array): Promise<Uint8Array> {
//     const cs = new CompressionStream("gzip");
//     const writer = cs.writable.getWriter();
//     writer.write(bytes);
//     writer.close();
//     const buf = await new Response(cs.readable).arrayBuffer();
//     return new Uint8Array(buf);
// }
// async function gunzipBytes(bytes: Uint8Array): Promise<Uint8Array> {
//     const ds = new DecompressionStream("gzip");
//     const writer = ds.writable.getWriter();
//     writer.write(bytes);
//     writer.close();
//     const buf = await new Response(ds.readable).arrayBuffer();
//     return new Uint8Array(buf);
// }

// export async function buildShareUrl(payload: unknown) {
//     const json = new TextEncoder().encode(JSON.stringify(payload));
//     const gz = await gzipBytes(json);
//     const token = b64u.enc(gz.buffer);
//     const url = new URL(location.href);
//     url.hash = `d=${token}`; // use fragment so nothing hits the server
//     // history.replaceState(null, "", url); // optional: avoid huge history entries
//     return url.toString();
// }

// export async function readFromUrl<T = unknown>(): Promise<T> {
//     const params = new URLSearchParams(location.hash.slice(1));
//     const token = params.get("d");
//     if (!token) throw new Error("No data in URL");
//     const gz = new Uint8Array(b64u.dec(token));
//     const json = await gunzipBytes(gz);
//     return JSON.parse(new TextDecoder().decode(json)) as T;
// }
