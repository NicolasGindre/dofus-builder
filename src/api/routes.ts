import { Hono } from "hono";
// import { Service } from '../services/service'
import * as handler from "./handlers";

export function registerRoutes(app: Hono) {
    app.post("/api/load-items-dofusDB", (c) => handler.loadItemsDofusDB(c));
    app.post("/api/load-panoplies-dofusDB", (c) => handler.loadPanopliesDofusDB(c));

    app.post("/api/reload-all-items", (c) => handler.reloadAllItems(c));

    app.get("/api/items", (c) => handler.getAllItems(c));
    app.get("/api/panoplies", (c) => handler.getAllPanoplies(c));
}
