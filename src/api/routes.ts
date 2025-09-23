import { Hono } from "hono";
// import { Service } from '../services/service'
import * as handler from "./handlers";

export function registerRoutes(app: Hono) {
    app.get("/load-items-dofusDB", (c) => handler.loadItemsDofusDB(c));

    app.get("/best-builds", (c) => handler.getBestBuilds(c));

    app.get("/best-items", (c) => handler.getBestItems(c));

    app.get("/best-panoplies", (c) => handler.getBestPanoplies(c));
}
