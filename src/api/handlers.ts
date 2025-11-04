import type { Context } from "hono";
import { logError } from "../error";
import * as itemDB from "../db/itemDB";

export async function loadItemsDofusDB(c: Context) {
    try {
        await itemDB.downloadItems();
    } catch (err) {
        logError("Download items failed", err);
        return c.text("Internal Server Error", 500);
    }
    return c.body(null, 200);
}

export async function loadPanopliesDofusDB(c: Context) {
    try {
        await itemDB.downloadPanoplies();
    } catch (err) {
        logError("Download panoplies failed", err);
        return c.text("Internal Server Error", 500);
    }
    return c.body(null, 200);
}

export async function getAllItems(c: Context) {
    try {
        console.log("get all items queried");
        return c.json(itemDB.getAllItems());
    } catch (err) {
        logError("Get all items failed", err);
        return c.text("Internal Server Error", 500);
    }
}

export async function getAllPanoplies(c: Context) {
    try {
        console.log("get all panoplies queried");
        return c.json(itemDB.getAllPanoplies());
    } catch (err) {
        logError("Get all panoplies failed", err);
        return c.text("Internal Server Error", 500);
    }
}
