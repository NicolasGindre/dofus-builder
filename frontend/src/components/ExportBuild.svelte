<script lang="ts">
    import { ExternalLink } from "lucide-svelte"; // any external-link icon
    import { onMount } from "svelte";
    import { createDofusDBBuild } from "../clients/dofusDB";
    import type { Build } from "../types/build";
    import { encodeDofusStufferUrlFromSlots } from "../clients/dofusBookUrl";
    import { words } from "../stores/builder";
    import { encodeBuildItems } from "../logic/encoding/encodeItems";
    import { setUrlHash } from "../logic/encoding/urlEncode";

    export let build: Build;
    // export let words = { export: "Export", dofusDB: "DofusDB", dofusBook: "DofusBook" };

    let open = false;
    let loading = false;
    let root: HTMLDivElement;

    async function exportTo(type: "dofusDB" | "dofusBook" | "asNewSearch") {
        open = false;

        if (type === "dofusBook") {
            window.open(encodeDofusStufferUrlFromSlots(build.slots), "_blank");
            return;
        }

        if (type === "dofusDB") {
            loading = true;
            try {
                const dofusDBBuildUrl = await createDofusDBBuild(build);
                window.open(dofusDBBuildUrl);
            } finally {
                loading = false;
            }
        }

        if (type === "asNewSearch") {
            const buildEncoded = encodeBuildItems(build);
            const buildNewUrl = new URL(window.location.href);
            const hash = window.location.hash.slice(1);
            const pairs = Object.fromEntries(hash.split("&").map((p) => p.split("=")));
            const encodedStats = pairs.s || "";
            // const encodedItems = pairs.i || "";
            setUrlHash(buildNewUrl, encodedStats, buildEncoded);
            window.open(buildNewUrl);
        }
    }

    function handleClickOutside(e: MouseEvent) {
        if (root && !root.contains(e.target as Node)) {
            open = false;
        }
    }
    onMount(() => {
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    });
</script>

<div bind:this={root} class="export-dropdown">
    <button class="button-export" on:click={() => (open = !open)} disabled={loading}>
        {$words.export}
    </button>

    {#if open}
        <div class="menu">
            <button on:click={() => exportTo("dofusDB")}>
                DofusDB
                <ExternalLink size={14} />
            </button>
            <button on:click={() => exportTo("dofusBook")}>
                <!-- {words.dofusBook} -->
                DofusBook
                <ExternalLink size={14} />
            </button>
            <button on:click={() => exportTo("asNewSearch")}>
                {$words.asNewSearch}
                <ExternalLink size={14} />
            </button>
        </div>
    {/if}
</div>

<style>
    /* .button-export {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0.75rem;
        border-radius: 0.375rem;
        background: #2563eb;
        color: white;
        cursor: pointer;
        border: none;
    } */
    /* .button-export:hover {
        background: #1d4ed8;
    } */
    .export-dropdown {
        position: relative;
        display: inline-block;
    }
    .menu {
        position: absolute;
        left: 0;
        margin-top: 0.25rem;
        width: 10rem;
        background: rgb(34, 34, 34);
        /* border: 1px solid #e5e7eb; */
        border: 1px solid white;
        /* border-radius: 0.375rem; */
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        z-index: 20;
        overflow: hidden;
    }
    .menu button {
        display: flex;
        width: 100%;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        border-radius: unset;
        background: none;
        /* border: none; */
        text-align: left;
        cursor: pointer;
    }
    .menu button:hover {
        background: #747474;
        border-color: #747474;
    }
    /* .spinner {
        width: 1rem;
        height: 1rem;
        border: 2px solid white;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    } */
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
