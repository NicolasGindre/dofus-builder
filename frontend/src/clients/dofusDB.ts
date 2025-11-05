import { get } from "svelte/store";
import { getLeveledStats, type Build } from "../types/build";
import { exoAp, exoMp, exoRange, exoSummon, level } from "../stores/builder";
import type { StatKey, Stats } from "../types/stats";
import { STAT_ID_DOFUSDB } from "../../../src/clients/dofusDB";
const dofusDBApi = "https://api.dofusdb.fr";
const dofusDBWebsite = "https://dofusdb.fr";

export async function createDofusDBBuild(build: Build) {
    // const levelNow = get(level);
    // const leveledStats = getLeveledStats(levelNow);
    const exoApNow = get(exoAp);
    const exoMpNow = get(exoMp);
    const exoRangeNow = get(exoRange);
    const exoSummonNow = get(exoSummon);

    const payload = {
        level: build.level ?? 200,
        name: "Export - " + (build.name ?? build.id),
        breed: 1, // 1–18 means class
        sexe: "female",
        shared: "public",

        items: {
            amulet: build.slots.amulet?.idDofusBook ?? null,
            rings: [build.slots.ring1?.idDofusBook, build.slots.ring2?.idDofusBook].filter(Boolean),
            boots: build.slots.boots?.idDofusBook ?? null,
            helmet: build.slots.hat?.idDofusBook ?? null,
            cape: build.slots.cloak?.idDofusBook ?? null,
            belt: build.slots.belt?.idDofusBook ?? null,
            pet: build.slots.pet?.idDofusBook ?? null,
            dofus: [
                build.slots.dofus1?.idDofusBook,
                build.slots.dofus2?.idDofusBook,
                build.slots.dofus3?.idDofusBook,
                build.slots.dofus4?.idDofusBook,
                build.slots.dofus5?.idDofusBook,
                build.slots.dofus6?.idDofusBook,
            ].filter(Boolean),
            weapon: build.slots.weapon?.idDofusBook ?? null,
            shield: build.slots.shield?.idDofusBook ?? null,
        },

        stats: getDofusDBStats(build.stats),
        exo: getDofusDBExos(exoApNow, exoMpNow, exoRangeNow, exoSummonNow),
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
        console.log("✅ DofusDB build created:", finalUrl);

        window.open(finalUrl, "_blank");
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
function getDofusDBExos(
    exoAp: boolean,
    exoMp: boolean,
    exoRange: boolean,
    exoSummon: boolean,
): DofusDBExos {
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
    if (exoSummon) {
        dofusDBExos.push({ stat: 26, value: 1 });
    }
    return dofusDBExos;
}
