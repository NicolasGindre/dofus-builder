<script lang="ts">
    import { minStats, weights, words } from "../../stores/storeBuilder";
    import { calculateStatsValue } from "../../logic/value";
    import { object } from "zod/v4-mini";
    import Icon from "../Icon.svelte";
    import { getIconFromStat } from "../../types/iconMap";
    import {
        STAT_DEFENSE_KEYS,
        STAT_OFFENSE_KEYS,
        STAT_UTILITY_KEYS,
        type StatKey,
        type Stats,
    } from "../../../../shared/types/stats";

    export let stats: Partial<Stats>;
    export let compareStats: Partial<Stats> | null = null;
    export let overStats: Partial<Stats> | null = null;
    export let isBuild = false;

    // function formatSmallDecimals(num: number) {
    //     const [intPart, decPart] = num.toFixed(2).split(".");
    //     return `${intPart}<span class="decimals">.${decPart}</span>`;
    // }
    function round1(x: number) {
        const n = Math.round(x * 10) / 10; // 1 decimal
        return Number(n.toString()); // removes trailing .0
    }
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
                    {#if stats[statKey] || (isBuild && $weights[statKey] > 0)}
                        <tr class:empty-weight={isBuild && !$weights[statKey]}>
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
                                        >{(Math.abs(stats[statKey]) % 1)
                                            .toString()
                                            .slice(1, 3)}</span
                                    >{/if}</td
                            >
                            <td
                                ><Icon name={getIconFromStat(statKey)} size={20} />
                                {$words.stats[statKey]}</td
                            >
                        </tr>
                    {/if}
                {/each}
            </tbody>
        {:else}
            <tbody>
                {#each statsKeys as statKey}
                    {#if compareStats[statKey] || stats[statKey] || (isBuild && $weights[statKey] > 0)}
                        <tr class:empty-weight={isBuild && !$weights[statKey]}>
                            <td>
                                {#if stats[statKey] != compareStats[statKey]}<span
                                        class:green-text={(stats[statKey] ?? 0) >
                                            compareStats[statKey]}
                                        class:red-text={(stats[statKey] ?? 0) <
                                            compareStats[statKey]}
                                        >({(stats[statKey] ?? 0) > compareStats[statKey]
                                            ? "+"
                                            : ""}{round1(
                                            (stats[statKey] ?? 0) - compareStats[statKey],
                                        )})</span
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
                                                .slice(1, 3)}</span
                                        >{/if}
                                </span></td
                            >
                            <td
                                ><Icon name={getIconFromStat(statKey)} size={20} />
                                {$words.stats[statKey]}</td
                            >
                        </tr>
                    {/if}
                {/each}
            </tbody>
        {/if}
    </table>
{/snippet}

<style>
    .empty-weight {
        opacity: 55%;
    }
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
        /* margin-left: auto; */
        display: flex;
        align-items: flex-start;
        /* vertical-align: right; */
        gap: 0.7rem;
        /* padding-bottom: 2px; */
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
        white-space: nowrap;
    }
    /* .build-stats table + table {
        margin-left: 2rem;
    } */
    table:not(:has(td)) {
        display: none;
    }
    .overstat {
        opacity: 55%;
    }
    /* .build-stats td + td:last-child {
        padding: 0rem;
    } */
</style>
