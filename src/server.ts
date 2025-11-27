import { Hono } from "hono";
import { serve } from "bun";
import { serveStatic } from "hono/bun";
import { logError } from "./error";
import { registerRoutes } from "./api/routes";
import * as itemDB from "./db/itemDB";
import { lookup } from "mrmime";

try {
    const app = new Hono();
    registerRoutes(app);
    await itemDB.loadItemsAndPanos();
    // itemDB.addPanopliesLevel();
    // itemDB.savePanoplies(itemDB.panoplies);

    app.use("/favicon/*", async (c, next) => {
        await next();
        const res = c.res;
        if (res) res.headers.set("Cache-Control", "public, max-age=86400"); // 1 day
    });

    app.get("/assets/*", async (c) => {
        const path = c.req.path;
        const accept = c.req.header("Accept-Encoding") || "";

        // Try Brotli first
        if (accept.includes("br")) {
            const brFile = Bun.file(`./frontend/dist${path}.br`);
            if (await brFile.exists()) {
                return new Response(brFile, {
                    headers: {
                        "Content-Encoding": "br",
                        "Content-Type": lookup(path) || "application/octet-stream",
                        "Cache-Control": "public, max-age=31536000, immutable",
                    },
                });
            }
        }

        // Then gzip
        if (accept.includes("gzip")) {
            const gzFile = Bun.file(`./frontend/dist${path}.gz`);
            if (await gzFile.exists()) {
                return new Response(gzFile, {
                    headers: {
                        "Content-Encoding": "gzip",
                        "Content-Type": lookup(path) || "application/octet-stream",
                        "Cache-Control": "public, max-age=31536000, immutable",
                    },
                });
            }
        }

        // Raw file fallback (icons, images, etc.)
        const file = Bun.file(`./frontend/dist${path}`);
        if (await file.exists()) {
            return new Response(file, {
                headers: {
                    "Content-Type": lookup(path) || "application/octet-stream",
                    "Cache-Control": "public, max-age=31536000, immutable",
                },
            });
        }

        return c.notFound();
    });
    // app.use("/assets/*", async (c, next) => {
    //     await next();
    //     const res = c.res;
    //     if (res) {
    //         res.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    //     }
    // });
    app.use(serveStatic({ root: "./frontend/dist" }));

    app.get("*", serveStatic({ path: "./frontend/dist/index.html" }));

    serve({
        fetch: app.fetch,
        port: 8081,
        idleTimeout: 30,
        hostname: "0.0.0.0",
    });
    console.log("Dofus MinMax server started and listening");
} catch (err) {
    logError("Startup error", err);
    process.exit(1);
}
