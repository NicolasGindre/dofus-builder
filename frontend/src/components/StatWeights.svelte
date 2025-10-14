<script lang="ts">
    import {
        STAT_DEFENSE_KEYS,
        STAT_KEYS,
        STAT_OFFENSE_KEYS,
        STAT_UTILITY_KEYS,
        type StatKey,
    } from "../types/stats";
    import { automaticWeights, maxStats, minStats, weights, words } from "../stores/builder";
    import { get } from "svelte/store";
    import { checkWeightUpdate, copyDefaultWeights, getDefaultWeight } from "../types/statWeights";
    // import { Crosshair } from "lucide-svelte";
    import Plus from "lucide-svelte/icons/plus";

    function setAllWeightsTo0() {
        // let newWeights: Partial<Stats> = {};
        // for (const statKey of STAT_KEYS) {
        //     newWeights[statKey] = 0;
        // }
        // weights.set(newWeights);
        weights.set({});
    }
    function setAllWeightsToDefault() {
        weights.set(copyDefaultWeights());
    }
</script>

{#snippet showStatsWeights(title: string, stats: readonly StatKey[])}
    <table>
        <caption>{title}</caption>
        <thead>
            <tr>
                <th>Stat</th>
                <th>{$words.weight}</th>
                <th>Min</th>
                <th>Max</th>
            </tr>
        </thead>
        <tbody>
            {#each stats as statKey}
                <tr>
                    <td
                        >{$words.stats[statKey]}
                        <button
                            class="icon-button"
                            class:rotated={$weights[statKey]}
                            title={$weights[statKey] ? $words.clearWeight : $words.setToDefault}
                            on:click={() =>
                                weights.update((w) => {
                                    const next = { ...w };
                                    if ($weights[statKey]) {
                                        delete next[statKey];
                                    } else {
                                        next[statKey] = getDefaultWeight(statKey);
                                    }
                                    return next;
                                })}
                        >
                            <Plus size="14" />
                        </button>
                    </td>
                    <td
                        ><input
                            type="number"
                            step={Math.max($weights[statKey] / 10, 0.01).toPrecision(1)}
                            bind:value={$weights[statKey]}
                            on:input={(e) => {
                                const value = e.currentTarget.value;
                                weights.update((w) => {
                                    const next = { ...w };
                                    if (value === "") {
                                        delete next[statKey];
                                    } else {
                                        next[statKey] = +value;
                                    }
                                    return next;
                                });
                            }}
                        />
                    </td>
                    <td
                        ><input
                            type="number"
                            min="-999"
                            max="9999"
                            bind:value={$minStats[statKey]}
                            on:input={(e) => {
                                const value = e.currentTarget.value;
                                minStats.update((w) => {
                                    const next = { ...w };
                                    if (value === "") {
                                        delete next[statKey];
                                    } else {
                                        next[statKey] = +value;
                                    }
                                    return next;
                                });
                            }}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            min="-999"
                            max="9999"
                            bind:value={$maxStats[statKey]}
                            on:input={(e) => {
                                const value = e.currentTarget.value;
                                maxStats.update((w) => {
                                    const next = { ...w };
                                    if (value === "") {
                                        delete next[statKey];
                                    } else {
                                        next[statKey] = +value;
                                    }
                                    return next;
                                });
                            }}
                        />
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{/snippet}

<div class="controls">
    <button on:click={setAllWeightsTo0}>{$words.setAllWeightsTo0}</button>
    <button on:click={setAllWeightsToDefault}>{$words.setAllWeightsToDefault}</button>

    <label class="checkbox-label">
        <input
            type="checkbox"
            bind:checked={$automaticWeights}
            on:change={() => checkWeightUpdate($weights)}
        />
        {$words.automaticWeightCalculation}
    </label>
</div>
<div class="stats-grid">
    <!-- <h3>ok</h3> -->
    {@render showStatsWeights($words.statsType.utility, STAT_UTILITY_KEYS)}
    {@render showStatsWeights($words.statsType.offense, STAT_OFFENSE_KEYS)}
    {@render showStatsWeights($words.statsType.defense, STAT_DEFENSE_KEYS)}
</div>

<style>
    .icon-button {
        padding: 0.25em;
        border-radius: 4px;
        border: none;
        background: transparent;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
    }

    .rotated {
        transform: rotate(45deg);
        transition: transform 0.2s ease;
    }

    table caption {
        font-weight: bold;
        text-align: center;
        margin-bottom: 0.25rem;
    }

    .stats-grid {
        margin-top: 1rem;
        display: flex;
        gap: 2rem;
        align-items: flex-start;
    }
    .stats-grid thead {
        background-color: #1e1e1e;
    }
    .stats-grid td:first-child {
        text-align: right;
        padding-right: 10px;
    }
    .stats-grid table tbody tr:nth-child(odd) {
        background-color: #222222;
    }
    .stats-grid table tbody tr:nth-child(even) {
        background-color: #1e1e1e;
    }

    .stats-grid table tbody tr:hover {
        background-color: #333;
    }
    .stats-grid table {
        border-collapse: collapse;
        flex: 1;
    }

    /* .stats-grid th,
    .stats-grid td {
        border: 1px solid #ddd;
        padding: 0.25rem 0.5rem;
    } */

    .stats-grid th:nth-child(2),
    .stats-grid th:nth-child(3),
    .stats-grid th:nth-child(4),
    .stats-grid td:nth-child(2),
    .stats-grid td:nth-child(3),
    .stats-grid td:nth-child(4) {
        width: 60px;
        text-align: center;
    }

    .stats-grid input[type="number"] {
        width: 100%;
        box-sizing: border-box;
        border: none;
        font-size: 0.9rem;
    }
</style>
