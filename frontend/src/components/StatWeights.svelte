<script lang="ts">
    import {
        STAT_DEFENSE_KEYS,
        STAT_KEYS,
        STAT_OFFENSE_KEYS,
        STAT_UTILITY_KEYS,
        type StatDefenseKey,
        type StatKey,
        type StatOffenseKey,
        type Stats,
        type StatUtilityKey,
    } from "../types/stats";
    import { maxStats, minStats, weights } from "../stores/builder";
    import { get } from "svelte/store";
</script>

{#snippet showStatsWeights(title: string, stats: readonly StatKey[])}
    <table>
        <caption>{title}</caption>
        <thead>
            <tr>
                <th>Stat</th>
                <th>Weight</th>
                <th>Min</th>
                <th>Max</th>
            </tr>
        </thead>
        <tbody>
            {#each stats as statKey}
                <tr>
                    <td>{statKey}</td>
                    <td>
                        <input
                            type="number"
                            bind:value={$weights[statKey]}
                            on:input={(e) =>
                                weights.update((w) => ({
                                    ...w,
                                    [statKey]: +e.currentTarget.value,
                                }))}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            bind:value={$minStats[statKey]}
                            on:input={(e) =>
                                minStats.update((w) => ({
                                    ...w,
                                    [statKey]: +e.currentTarget.value,
                                }))}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            bind:value={$maxStats[statKey]}
                            on:input={(e) =>
                                maxStats.update((w) => ({
                                    ...w,
                                    [statKey]: +e.currentTarget.value,
                                }))}
                        />
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{/snippet}

<div class="stats-grid">
    <!-- <h3>ok</h3> -->
    {@render showStatsWeights("Utility Stats", STAT_UTILITY_KEYS)}
    {@render showStatsWeights("Offense Stats", STAT_OFFENSE_KEYS)}
    {@render showStatsWeights("Defense Stats", STAT_DEFENSE_KEYS)}
</div>

<style>
    table caption {
        font-weight: bold;
        text-align: center;
        margin-bottom: 0.25rem;
    }

    .stats-grid {
        display: flex;
        gap: 2rem;
        align-items: flex-start;
    }

    .stats-grid table {
        border-collapse: collapse;
        flex: 1;
    }

    .stats-grid th,
    .stats-grid td {
        border: 1px solid #ddd;
        padding: 0.25rem 0.5rem;
    }

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
    }
</style>
