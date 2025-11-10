<script lang="ts">
    import {
        STAT_DEFENSE_KEYS,
        STAT_OFFENSE_KEYS,
        STAT_UTILITY_KEYS,
        type StatKey,
        type Stats,
    } from "../types/stats";
    import { minStats, words } from "../stores/builder";
    import { calculateStatsValue } from "../logic/value";
    import { object } from "zod/v4-mini";

    export let stats: Partial<Stats>;
    export let compareStats: Partial<Stats> | null = null;
    export let overStats: Partial<Stats> | null = null;
    export let isBuild = false;

    // function formatSmallDecimals(num: number) {
    //     const [intPart, decPart] = num.toFixed(2).split(".");
    //     return `${intPart}<span class="decimals">.${decPart}</span>`;
    // }
</script>

<div class="build-stats">
    {@render showStats($words.statsType.utility, STAT_UTILITY_KEYS)}
    {@render showStats($words.statsType.offense, STAT_OFFENSE_KEYS)}
    {@render showStats($words.statsType.defense, STAT_DEFENSE_KEYS)}
</div>

{#snippet showStats(title: String, statsKeys: readonly StatKey[])}
    {@const value = calculateStatsValue(stats, statsKeys)}
    {@const diffValue = compareStats ? value - calculateStatsValue(compareStats, statsKeys) : 0}
    <table>
        {#if isBuild}
            <caption
                >{title}: {value.toFixed(0)}
                {#if compareStats}
                    <span class:green-text={diffValue > 0} class:red-text={diffValue < 0}
                        >({diffValue >= 0 ? "+" : ""}{diffValue.toFixed(0)})</span
                    >
                {/if}
            </caption>
        {/if}

        {#if !compareStats}
            <!-- {#if Object.keys(stats).length > 0} -->
            <tbody>
                {#each statsKeys as statKey}
                    {#if stats[statKey]}
                        <tr>
                            <td>
                                {#if overStats && overStats[statKey] != stats[statKey]}
                                    <span class="overstat">{overStats[statKey]}→</span>
                                {/if}<span
                                    class:invalid={isBuild && $minStats[statKey] > stats[statKey]}
                                    >{Math.floor(stats[statKey] ?? 0) +
                                        (stats[statKey] < 0 && (stats[statKey] ?? 0) % 1 !== 0
                                            ? 1
                                            : 0)}</span
                                >{#if (stats[statKey] ?? 0) % 1 !== 0}<span class="decimals"
                                        >{(Math.abs(stats[statKey]) % 1).toString().slice(1)}</span
                                    >{/if}</td
                            >
                            <td>{$words.stats[statKey]}</td>
                        </tr>
                    {/if}
                {/each}
            </tbody>
        {:else}
            <tbody>
                {#each statsKeys as statKey}
                    {#if compareStats[statKey] || stats[statKey]}
                        <tr>
                            <td>
                                {#if stats[statKey] != compareStats[statKey]}<span
                                        class:green-text={(stats[statKey] ?? 0) >
                                            compareStats[statKey]}
                                        class:red-text={(stats[statKey] ?? 0) <
                                            compareStats[statKey]}
                                        >({(stats[statKey] ?? 0) > compareStats[statKey]
                                            ? "+"
                                            : ""}{(stats[statKey] ?? 0) -
                                            compareStats[statKey]})</span
                                    >{/if}
                                {#if overStats && overStats[statKey] != stats[statKey]}
                                    <span class="overstat">{overStats[statKey]}→</span>{/if}<span
                                    class:invalid={isBuild && $minStats[statKey] > stats[statKey]}
                                >
                                    <span
                                        >{Math.floor(stats[statKey] ?? 0) +
                                            (stats[statKey] < 0 && (stats[statKey] ?? 0) % 1 !== 0
                                                ? 1
                                                : 0)}</span
                                    >{#if (stats[statKey] ?? 0) % 1 !== 0}<span class="decimals"
                                            >{(Math.abs(stats[statKey]) % 1)
                                                .toString()
                                                .slice(1)}</span
                                        >{/if}
                                </span></td
                            >
                            <td>{$words.stats[statKey]}</td>
                        </tr>
                    {/if}
                {/each}
            </tbody>
        {/if}
    </table>
{/snippet}

<style>
    .decimals {
        font-size: 0.7em; /* smaller relative to main number */
        vertical-align: baseline; /* or 'text-top' / 'baseline' depending on taste */
        opacity: 0.8;
    }
    .invalid {
        background-color: #8c0000;
    }
    table caption {
        font-weight: bold;
        text-align: center;
        margin-bottom: 0.25rem;
        white-space: nowrap;
    }
    .build-stats {
        margin-left: auto;
        display: flex;
        align-items: flex-start;
        vertical-align: right;
        gap: 2rem;
        padding-bottom: 2px;
        /* align-self: right; */
    }
    .build-stats td + td {
        padding-left: 0.25rem;
        /* margin-left: 2rem; */
    }
    .build-stats td:first-child {
        text-align: right;
        white-space: nowrap;
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
    .overstat {
        opacity: 35%;
    }
    /* .build-stats td + td:last-child {
        padding: 0rem;
    } */
</style>
