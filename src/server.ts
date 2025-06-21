import { Hono } from 'hono'
import { serve } from 'bun'
import { logError } from './error'
import { registerRoutes } from './api/routes'

try {
    // const service = new Service(config.payoutLimit)
    // initDb(config.dbUrl)
    // initEscrowClient(config.escrowUrl)

    const app = new Hono()
    registerRoutes(app)

    serve({
        fetch: app.fetch,
        port: 8080,
    })
    console.log("Dofus builder started and listening")

} catch (err) {
    logError('Startup error', err)
    process.exit(1)
}
