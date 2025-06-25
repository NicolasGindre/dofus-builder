import type { Context } from 'hono'
import { logError } from '../error'
import * as itemDB from "../db/itemDB"
import * as builder from "../builder/builder"

export async function loadItemsDofusDB(c: Context) {

    try {
        await itemDB.downloadItems()
    } catch (err) {
        logError('Download items failed', err)
        return c.text('Internal Server Error', 500)
    }

    return c.body(null, 200)
}

export async function getBestBuilds(c: Context) {

    try {
        await builder.calculateBestBuilds()
    } catch (err) {
        logError('Calculate best builds failed', err)
        return c.text('Internal Server Error', 500)
    }

    return c.body(null, 200)
}

export async function getBestItems(c: Context) {

    try {
        await builder.calculateBestItems()
    } catch (err) {
        logError('Calculate best items failed', err)
        return c.text('Internal Server Error', 500)
    }

    return c.body(null, 200)
}
