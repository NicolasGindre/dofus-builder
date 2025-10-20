<script lang="ts">
    import { onDestroy } from "svelte";
    import { saveHistoryEntry } from "../logic/encoding/urlEncode";

    let copied = false;
    let timeout: number;

    function saveToClipboard() {
        saveHistoryEntry();

        // Copy to clipboard
        const url = new URL(window.location.href);
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
