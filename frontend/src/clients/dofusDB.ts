import { get } from "svelte/store";
import { type Build } from "../types/build";
import { exoAp, exoMp, exoRange, level } from "../stores/builder";
import type { StatKey, Stats } from "../types/stats";
import { STAT_ID_DOFUSDB } from "../../../src/clients/dofusDB";
const dofusDBApi = "https://api.dofusdb.fr";
const dofusDBWebsite = "https://dofusdb.fr";

export async function createDofusDBBuild(build: Build): Promise<string> {
    // const levelNow = get(level);
    // const leveledStats = getLeveledStats(levelNow);
    const exoApNow = get(exoAp);
    const exoMpNow = get(exoMp);
    const exoRangeNow = get(exoRange);

    const payload = {
        level: build.level ?? 200,
        name: "Export - " + (build.name ?? build.id),
        breed: 1, // 1–18 means class
        sexe: "female",
        shared: "public",

        items: {
            amulet: build.slots.amulet?.idDofusDB ?? null,
            rings: [build.slots.ring1?.idDofusDB, build.slots.ring2?.idDofusDB].filter(Boolean),
            boots: build.slots.boots?.idDofusDB ?? null,
            helmet: build.slots.hat?.idDofusDB ?? null,
            cape: build.slots.cloak?.idDofusDB ?? null,
            belt: build.slots.belt?.idDofusDB ?? null,
            pet: build.slots.pet?.idDofusDB ?? null,
            dofus: [
                build.slots.dofus1?.idDofusDB,
                build.slots.dofus2?.idDofusDB,
                build.slots.dofus3?.idDofusDB,
                build.slots.dofus4?.idDofusDB,
                build.slots.dofus5?.idDofusDB,
                build.slots.dofus6?.idDofusDB,
            ].filter(Boolean),
            weapon: build.slots.weapon?.idDofusDB ?? null,
            shield: build.slots.shield?.idDofusDB ?? null,
        },

        stats: getDofusDBStats(build.stats),
        exo: getDofusDBExos(exoApNow, exoMpNow, exoRangeNow),
        base: {
            vitality: 0,
            strength: 0,
            intelligence: 0,
            agility: 0,
            chance: 0,
            wisdom: 0,
        },
        parchment: {
            vitality: 0,
            strength: 0,
            intelligence: 0,
            agility: 0,
            chance: 0,
            wisdom: 0,
        },
        pinned_spells: [],
        forgemagie: {},
    };

    try {
        const res = await fetch(`${dofusDBApi}/stuffs`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Referer: "https://secret-project.net" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const id = data._id as string;

        const finalUrl = `${dofusDBWebsite}/fr/tools/stuff/${id}`;
        return finalUrl;
    } catch (err) {
        console.error("❌ Failed to create DofusDB build:", err);
        throw err;
    }
}

// 1: "ap",
// 23: "mp",
// 19: "range",
// 26: "summon",
function getDofusDBStats(stats: Partial<Stats>): Record<number, number> {
    let dofusDBStats: Record<number, number> = {};
    for (const [idStr, statKey] of Object.entries(STAT_ID_DOFUSDB)) {
        const id = Number(idStr);
        dofusDBStats[id] = Math.floor(stats[statKey as StatKey] ?? 0);
    }
    return dofusDBStats;
}

type DofusDBExos = {
    _id?: string;
    stat: number;
    value: number;
}[];
function getDofusDBExos(exoAp: boolean, exoMp: boolean, exoRange: boolean): DofusDBExos {
    let dofusDBExos: DofusDBExos = [];
    if (exoAp) {
        dofusDBExos.push({ stat: 1, value: 1 });
    }
    if (exoMp) {
        dofusDBExos.push({ stat: 23, value: 1 });
    }
    if (exoRange) {
        dofusDBExos.push({ stat: 19, value: 1 });
    }
    return dofusDBExos;
}
