import type { Context } from "hono";
import { logError } from "../error";
import * as itemDB from "../db/itemDB";

// export async function loadItemsDofusDB(c: Context) {
//     try {
//         await itemDB.downloadItems();
//     } catch (err) {
//         logError("Download items failed", err);
//         return c.text("Internal Server Error", 500);
//     }
//     return c.body(null, 200);
// }

// export async function loadPanopliesDofusDB(c: Context) {
//     try {
//         await itemDB.downloadPanoplies();
//     } catch (err) {
//         logError("Download panoplies failed", err);
//         return c.text("Internal Server Error", 500);
//     }
//     return c.body(null, 200);
// }

const PASSWORD = "n0h4ckm3plz";
let lastReloadAt = 0;
export async function reloadAllItems(c: Context) {
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer ")) return c.text("Unauthorized", 401);

    const provided = auth.slice("Bearer ".length).trim();
    if (provided !== PASSWORD) return c.text("Forbidden", 403);

    const now = Date.now();
    const diff = now - lastReloadAt;

    if (diff < 10_000) {
        return c.text(`Why hack ? wait ${Math.ceil((10_000 - diff) / 1000)}s`, 429);
    }
    lastReloadAt = now;

    try {
        console.log("Reloading items and panos");
        await itemDB.loadItemsAndPanos();
        return c.text("Reloaded", 200);
    } catch (err) {
        logError("reload All Items failed", err);
        return c.text("Internal Server Error", 500);
    }
}

export async function getAllItems(c: Context) {
    try {
        // console.log("get all items queried");
        return c.json(itemDB.getAllItems());
    } catch (err) {
        logError("Get all items failed", err);
        return c.text("Internal Server Error", 500);
    }
}

export async function getAllPanoplies(c: Context) {
    try {
        // console.log("get all panoplies queried");
        return c.json(itemDB.getAllPanoplies());
    } catch (err) {
        logError("Get all panoplies failed", err);
        return c.text("Internal Server Error", 500);
    }
}
