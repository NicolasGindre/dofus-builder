<script lang="ts">
    import { ExternalLink } from "lucide-svelte"; // any external-link icon
    import { onMount } from "svelte";
    import { createDofusDBBuild } from "../clients/dofusDB";
    import type { Build } from "../types/build";

    export let build: Build;
    export let words = { export: "Export", dofusDB: "DofusDB", dofusBook: "DofusBook" };

    let open = false;
    let loading = false;
    let root: HTMLDivElement;

    async function exportTo(type: "dofusDB" | "dofusBook") {
        open = false;

        if (type === "dofusBook") {
            // just open the existing URL
            window.open(build.export.dofusBookUrl, "_blank");
            return;
        }

        if (type === "dofusDB") {
            loading = true;
            try {
                await createDofusDBBuild(build);
            } finally {
                loading = false;
            }
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
        {#if loading}
            <span class="spinner"></span>
            <span>Exporting…</span>
        {:else}
            {words.export}
        {/if}
    </button>

    {#if open}
        <div class="menu">
            <button on:click={() => exportTo("dofusDB")}>
                {words.dofusDB}
                <ExternalLink size={14} />
            </button>
            <button on:click={() => exportTo("dofusBook")}>
                {words.dofusBook}
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
        border-radius: 0.375rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        z-index: 20;
    }
    .menu button {
        display: flex;
        width: 100%;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: none;
        /* border: none; */
        text-align: left;
        cursor: pointer;
    }
    .menu button:hover {
        background: #f3f4f6;
    } /* gray-100 */
    .spinner {
        width: 1rem;
        height: 1rem;
        border: 2px solid white;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
