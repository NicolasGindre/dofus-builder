import { Hono } from "hono";
import { serve } from "bun";
import { serveStatic } from "hono/bun";
import { logError } from "./error";
import { registerRoutes } from "./api/routes";
import * as itemDB from "./db/itemDB";

try {
    const app = new Hono();
    registerRoutes(app);
    await itemDB.loadItems();
    // app.use("/assets/*", serveStatic({ root: "./frontend/dist" }));

    // serve index.html for the root and any unknown path (SPA fallback)
    app.get("*", serveStatic({ path: "./frontend/dist/index.html" }));

    serve({
        fetch: app.fetch,
        port: 8080,
    });
    console.log("Dofus builder started and listening");
} catch (err) {
    logError("Startup error", err);
    process.exit(1);
}
