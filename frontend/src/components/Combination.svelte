<script lang="ts">
    import { itemsCategoryToCalculate } from "../stores/builder";
    import { ITEM_CATEGORIES } from "../types/item";
    let best: { score: number; names: string[] } | null = null;
    let error: string | null = null;
    let running = false;

    function runComboSearch() {
        error = null;
        best = null;
        running = true;
        let worker: Worker | null = null;

        if (!worker) {
            worker = new Worker(new URL("../workers/combinationSearch.ts", import.meta.url), {
                type: "module",
            });
            worker.onmessage = (e) => {
                running = false;
                if (e.data?.error) {
                    error = e.data.error;
                } else {
                    best = e.data;
                }
            };
        }

        worker.postMessage({
            selected: $itemsCategoryToCalculate, // Record<ItemCategory, Items>
        });
    }
</script>

<button on:click={runComboSearch} disabled={running}>
    {running ? "Calculating…" : "Calculate Best Combination"}
</button>

{#if error}
    <p style="color: red;">{error}</p>
{:else if best}
    <h3>Best combination (score: {best.score.toFixed(2)})</h3>
    <ul>
        {#each best.names as name, i}
            <li>{ITEM_CATEGORIES[i]}: {name}</li>
        {/each}
    </ul>
{/if}
