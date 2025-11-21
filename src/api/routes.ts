import { Hono } from "hono";
// import { Service } from '../services/service'
import * as handler from "./handlers";

export function registerRoutes(app: Hono) {
    // app.get("/load-items-dofusDB", (c) => handler.loadItemsDofusDB(c));
    // app.get("/load-panoplies-dofusDB", (c) => handler.loadPanopliesDofusDB(c));

    app.get("/api/items", (c) => handler.getAllItems(c));
    app.get("/api/panoplies", (c) => handler.getAllPanoplies(c));
}
