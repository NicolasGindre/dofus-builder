<script lang="ts">
    import {
        itemsSelected,
        maxStats,
        minStats,
        panopliesSelected,
        preStats,
        weights,
    } from "../stores/builder";
    import { buildsFromWasm } from "../logic/build";
    import { ITEM_CATEGORIES } from "../types/item";
    import { get } from "svelte/store";
    import { bestBuilds, totalPossibilities } from "../stores/builder";
    import {
        STAT_DEFENSE_KEYS,
        STAT_OFFENSE_KEYS,
        STAT_UTILITY_KEYS,
        type StatKey,
        type Stats,
    } from "../types/stats";
    // let bestBuilds: { score: number; names: string[] }[] | null = null;
    let error: string | null = null;
    let running = false;

    function runComboSearch() {
        error = null;
        // bestBuilds = null;
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
                    // const bestBuildsResp: BestBuild = e.data;
                    console.log("Rust response :", e.data);
                    bestBuilds.set(buildsFromWasm(e.data));
                    // Set(buildsFromWasm(e.data);
                    // console.log(bestBuilds);
                }
            };
        }

        console.log("getPanoToCalculate");
        // const panoplies = getPanopliesToCalculate($itemsSelected);
        console.log(get(panopliesSelected));

        worker.postMessage({
            selectedItems: $itemsSelected,
            weights: $weights,
            minStats: $minStats,
            maxStats: $maxStats,
            preStats: $preStats,
            panoplies: get(panopliesSelected),
        });
        console.log("posted message to worker");
    }
    // get($bestBuilds)
    $: builds = $bestBuilds;
</script>

<button on:click={runComboSearch} disabled={running}>
    {running ? "Calculating…" : "Calculate Best Combination"}
</button>
<p>
    Total possibilities: {new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
    }).format($totalPossibilities)}
</p>

{#if error}
    <p style="color: red;">{error}</p>
{:else if builds.length > 0}
    <!-- <h3>Best combination value: {$bestBuilds[0]?.value.toFixed(2)}</h3> -->
    {#each builds as build}
        <div class="build">
            <div class="build-items">
                <h3>Value {build.value?.toFixed(2)}</h3>
                <div class="panoplies">
                    {#each Object.entries(build.panoplies) as [pname, count]}
                        {#if count > 1}
                            <div class="panoply">{pname}: {count} pieces</div>
                        {/if}
                    {/each}
                </div>

                <ul class="slots">
                    {#each Object.entries(build.slots) as [slot, item]}
                        <li>
                            <strong>{slot}:</strong>
                            {#if item}{item.name} (Lvl {item.level}){:else}<em>Empty</em>{/if}
                        </li>
                    {/each}
                </ul>
            </div>

            <div class="build-stats">
                {@render showStats("Utility Stats", build.stats, STAT_UTILITY_KEYS)}
                {@render showStats("Offense Stats", build.stats, STAT_OFFENSE_KEYS)}
                {@render showStats("Defense Stats", build.stats, STAT_DEFENSE_KEYS)}
            </div>
        </div>
    {/each}
{/if}
{#snippet showStats(title: string, stats: Partial<Stats>, statsKeys: readonly StatKey[])}
    <table>
        <!-- <caption>{title}</caption> -->
        <thead>
            <tr>
                <th>Stat</th>
                <th>Value</th>
            </tr>
        </thead>
        <tbody>
            {#each statsKeys as statKey}
                <tr>
                    <td>{statKey}</td>
                    <td>{stats[statKey]}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{/snippet}

<style>
    .build-stats {
        display: flex;
        gap: 2rem;
        align-items: flex-start;
        vertical-align: right;
        /* align-self: right; */
    }
    .build {
        display: flex;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 0.5rem;
        margin-bottom: 1rem;
    }
    .panoplies {
        margin-bottom: 0.5rem;
        font-style: italic;
    }
    .slots li {
        list-style: none;
        padding: 2px 0;
    }
</style>
