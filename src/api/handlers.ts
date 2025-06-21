import type { Context } from 'hono'
import { logError } from '../error'
import * as item from "../db/item"

export async function loadItemsDofusDB(c: Context) {

    try {
        await item.downloadItems()
    } catch (err) {
        logError('Download items failed', err)
        return c.text('Internal Server Error', 500)
    }

    return c.body(null, 200)
}
