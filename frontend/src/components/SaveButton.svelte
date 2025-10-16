<script lang="ts">
    import { weights, minStats, maxStats } from "../stores/builder";
    import { decodeStats, encodeStats } from "../logic/encoding/encoding";
    import type { StatKey } from "../types/stats";
    import { onDestroy } from "svelte";

    let copied = false;
    let timeout: number;

    import { defaultMax } from "../types/statWeights";

    function saveToClipboard() {
        // Get stats that have weights, min, or max values set
        const statsToEncode = new Set<StatKey>();

        // Add stats with weights
        $weights &&
            Object.entries($weights)
                .filter(([_, value]) => value > 0)
                .forEach(([key]) => statsToEncode.add(key as StatKey));

        // Add stats with min values (any non-zero min is non-default)
        $minStats &&
            Object.entries($minStats)
                .filter(([_, value]) => value > 0)
                .forEach(([key]) => statsToEncode.add(key as StatKey));

        // Add stats with max values that differ from defaults
        $maxStats &&
            Object.entries($maxStats)
                .filter(([key, value]) => {
                    const defaultValue = defaultMax[key as StatKey];
                    return defaultValue === undefined || value !== defaultValue;
                })
                .forEach(([key]) => statsToEncode.add(key as StatKey)); // Convert Set to Array and encode

        console.log("statsToEncode", statsToEncode);
        const encoded = encodeStats([...statsToEncode]);
        console.log("encoded", encoded);
        const decoded = decodeStats(encoded);
        console.log("decoded", decoded);

        // Create the full URL
        const url = new URL(window.location.href);
        url.searchParams.set("w", encoded);

        // Copy to clipboard
        navigator.clipboard.writeText(url.toString()).then(() => {
            copied = true;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                copied = false;
            }, 2000) as unknown as number;
        });
    }

    // Clean up the timeout on component destruction
    onDestroy(() => {
        clearTimeout(timeout);
    });
</script>

<button class="save-button" on:click={saveToClipboard} class:copied>
    {#if copied}
        Copied! 📋
    {:else}
        Share build 🔗
    {/if}
</button>

<style>
    .save-button {
        position: fixed;
        right: 0px;
        top: 50px;
        padding: 10px 20px;
        background-color: #4a4a4a;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .save-button:hover {
        background-color: #5a5a5a;
        transform: translateY(-1px);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
    }

    .save-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .save-button.copied {
        background-color: #45a045;
    }
</style>
