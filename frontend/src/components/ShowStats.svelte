<script lang="ts">
    import {
        STAT_DEFENSE_KEYS,
        STAT_OFFENSE_KEYS,
        STAT_UTILITY_KEYS,
        type StatKey,
        type Stats,
    } from "../types/stats";
    import { words } from "../stores/builder";
    // export let title: string;
    export let stats: Partial<Stats>;
    // export let statsKeys: readonly StatKey[];
</script>

<div class="build-stats">
    {@render showStats(stats, STAT_UTILITY_KEYS)}
    {@render showStats(stats, STAT_OFFENSE_KEYS)}
    {@render showStats(stats, STAT_DEFENSE_KEYS)}
</div>

{#snippet showStats(stats: Partial<Stats>, statsKeys: readonly StatKey[])}
    <table>
        <!-- <thead>
            <tr><th>Stat</th><th>Value</th></tr>
        </thead> -->
        <tbody>
            {#each statsKeys as statKey}
                {#if stats[statKey]}
                    <tr>
                        <td>{stats[statKey]}</td>
                        <td>{$words.stats[statKey]}</td>
                    </tr>
                {/if}
            {/each}
        </tbody>
    </table>
{/snippet}

<style>
    .build-stats {
        margin-left: auto;
        display: flex;
        align-items: flex-start;
        vertical-align: right;
        gap: 2rem;
        /* align-self: right; */
    }
    .build-stats td + td {
        padding-left: 0.25rem;
        /* margin-left: 2rem; */
    }
    .build-stats td:first-child {
        text-align: right;
    }
    .build-stats td:last-child {
        text-align: left;
    }
    /* .build-stats table + table {
        margin-left: 2rem;
    } */
    table:not(:has(td)) {
        display: none;
    }
    /* .build-stats td + td:last-child {
        padding: 0rem;
    } */
</style>
