import { Hono } from 'hono'
// import { Service } from '../services/service'
import * as handler from './handlers'

export function registerRoutes(app: Hono) {

    app.get('/load-items-dofusDB', (c) => handler.loadItemsDofusDB(c))
}
