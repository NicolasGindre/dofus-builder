<script lang="ts">
    import {
        STAT_DEFENSE_KEYS,
        STAT_KEYS,
        STAT_OFFENSE_KEYS,
        STAT_UTILITY_KEYS,
        type StatKey,
    } from "../types/stats";
    import {
        automaticWeights,
        weightsIndex,
        weights,
        maxStats,
        minStats,
        words,
        maxStatsIndex,
        minStatsIndex,
    } from "../stores/builder";
    import { get } from "svelte/store";
    import {
        checkWeightUpdate,
        copyDefaultWeightsIndex,
        defaultMaxIndex,
        defaultMinIndex,
        getDefaultWeightIndex,
    } from "../types/statWeights";
    // import { Crosshair } from "lucide-svelte";
    import Plus from "lucide-svelte/icons/plus";
    import {
        findClosestMinMaxIndex,
        findClosestWeightIndex,
        findClosestWeightValue,
        MIN_MAX_ENCODING,
        WEIGHT_ENCODING,
    } from "../logic/encoding/valueEncoding";

    function setAllWeightsTo0() {
        // let newWeights: Partial<Stats> = {};
        // for (const statKey of STAT_KEYS) {
        //     newWeights[statKey] = 0;
        // }
        // weights.set(newWeights);
        weightsIndex.set({});
    }
    function setAllWeightsToDefault() {
        weightsIndex.set(copyDefaultWeightsIndex());
    }

    function incrementWeight(statKey: StatKey, increment: number) {
        let newIndex = increment;
        if (!$weightsIndex[statKey]) {
            newIndex = getDefaultWeightIndex(statKey);
        } else {
            newIndex += $weightsIndex[statKey];
            if (newIndex == 0) {
                newIndex = 1;
            }
        }
        updateWeightIndex(statKey, newIndex);
    }
    function updateWeight(statKey: StatKey, e: Event) {
        const target = e.target as HTMLInputElement;
        const newValue = Number(target.value);

        if (Number.isNaN(newValue)) {
            updateWeightIndex(statKey, 0);
        } else {
            updateWeightIndex(statKey, findClosestWeightIndex(statKey, newValue));
        }
    }
    function updateWeightIndex(statKey: StatKey, newIndex: number) {
        weightsIndex.update((w) => {
            const next = { ...w };
            if (newIndex <= 0) {
                delete next[statKey];
            } else if (newIndex > WEIGHT_ENCODING.length - 1) {
                next[statKey] = WEIGHT_ENCODING.length - 1;
            } else {
                next[statKey] = newIndex;
            }
            return next;
        });
    }

    function incrementMaxStat(statKey: StatKey, increment: number) {
        let newIndex = increment;
        if (!$maxStatsIndex[statKey]) {
            newIndex = defaultMaxIndex[statKey] ?? 31;
        } else {
            newIndex += $maxStatsIndex[statKey];
            if (newIndex == 0) {
                newIndex = 1;
            }
        }
        updateMaxIndex(statKey, newIndex);
    }
    function updateMaxStat(statKey: StatKey, e: Event) {
        const target = e.target as HTMLInputElement;
        const newValue = Number(target.value);

        if (Number.isNaN(newValue)) {
            updateMaxIndex(statKey, 0);
        } else {
            updateMaxIndex(statKey, findClosestMinMaxIndex(statKey, newValue));
        }
    }
    function updateMaxIndex(statKey: StatKey, newIndex: number) {
        maxStatsIndex.update((w) => {
            const next = { ...w };
            if (newIndex <= 0) {
                delete next[statKey];
            } else if (newIndex > MIN_MAX_ENCODING.length - 1) {
                next[statKey] = MIN_MAX_ENCODING.length - 1;
            } else {
                next[statKey] = newIndex;
            }
            return next;
        });
    }

    function incrementMinStat(statKey: StatKey, increment: number) {
        let newIndex = increment;
        if (!$minStatsIndex[statKey]) {
            newIndex = defaultMaxIndex[statKey] ?? 31;
        } else {
            newIndex += $minStatsIndex[statKey];
            if (newIndex == 0) {
                newIndex = 1;
            }
        }
        updateMinIndex(statKey, newIndex);
    }
    function updateMinStat(statKey: StatKey, e: Event) {
        const target = e.target as HTMLInputElement;
        const newValue = Number(target.value);

        if (Number.isNaN(newValue)) {
            updateMinIndex(statKey, 0);
        } else {
            updateMinIndex(statKey, findClosestMinMaxIndex(statKey, newValue));
        }
    }
    function updateMinIndex(statKey: StatKey, newIndex: number) {
        minStatsIndex.update((w) => {
            const next = { ...w };
            if (newIndex <= 0) {
                delete next[statKey];
            } else if (newIndex > MIN_MAX_ENCODING.length - 1) {
                next[statKey] = MIN_MAX_ENCODING.length - 1;
            } else {
                next[statKey] = newIndex;
            }
            return next;
        });
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
                    <td>{$words.stats[statKey]} </td>
                    <td>
                        <div class="weight-input">
                            <input
                                type="text"
                                value={$weights[statKey]}
                                on:input={(e) => {
                                    if (e.currentTarget.value === ".") {
                                        e.currentTarget.value = "0.";
                                    } else if (!/^(0|\d+\.)$/.test(e.currentTarget.value)) {
                                        updateWeight(statKey, e);
                                        e.currentTarget.value = $weights[statKey]?.toString() ?? "";
                                    }
                                }}
                                on:blur={(e) => {
                                    updateWeight(statKey, e);
                                    e.currentTarget.value = $weights[statKey]?.toString() ?? "";
                                }}
                                on:keydown={(e) => {
                                    if (e.key === "ArrowUp") {
                                        e.preventDefault();
                                        incrementWeight(statKey, 1);
                                    } else if (e.key === "ArrowDown") {
                                        e.preventDefault();
                                        incrementWeight(statKey, -1);
                                    }
                                }}
                            />
                            <div class="buttons">
                                <button
                                    tabindex="-1"
                                    class="btn"
                                    on:click={(e) => {
                                        incrementWeight(statKey, 1);
                                    }}>▲</button
                                >
                                <button
                                    tabindex="-1"
                                    class="btn"
                                    on:click={(e) => {
                                        incrementWeight(statKey, -1);
                                    }}>▼</button
                                >
                            </div>
                        </div>
                    </td>
                    <td
                        ><div class="weight-input">
                            <input
                                type="text"
                                value={$minStats[statKey]}
                                on:input={(e) => {
                                    if (Number.isNaN(Number(e.currentTarget.value))) {
                                        updateMinIndex(statKey, 0);
                                        e.currentTarget.value = "";
                                    }
                                }}
                                on:blur={(e) => {
                                    updateMinStat(statKey, e);
                                    e.currentTarget.value = $minStats[statKey]?.toString() ?? "";
                                }}
                                on:keydown={(e) => {
                                    if (e.key === "ArrowUp") {
                                        e.preventDefault();
                                        incrementMinStat(statKey, 1);
                                    } else if (e.key === "ArrowDown") {
                                        e.preventDefault();
                                        incrementMinStat(statKey, -1);
                                    }
                                }}
                            />
                            <div class="buttons">
                                <button
                                    tabindex="-1"
                                    class="btn"
                                    on:click={(e) => {
                                        incrementMinStat(statKey, 1);
                                    }}>▲</button
                                >
                                <button
                                    tabindex="-1"
                                    class="btn"
                                    on:click={(e) => {
                                        incrementMinStat(statKey, -1);
                                    }}>▼</button
                                >
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="weight-input">
                            <input
                                type="text"
                                value={$maxStats[statKey]}
                                on:input={(e) => {
                                    if (Number.isNaN(Number(e.currentTarget.value))) {
                                        updateMaxIndex(statKey, 0);
                                        e.currentTarget.value = "";
                                    }
                                }}
                                on:blur={(e) => {
                                    updateMaxStat(statKey, e);
                                    e.currentTarget.value = $maxStats[statKey]?.toString() ?? "";
                                }}
                                on:keydown={(e) => {
                                    if (e.key === "ArrowUp") {
                                        e.preventDefault();
                                        incrementMaxStat(statKey, 1);
                                    } else if (e.key === "ArrowDown") {
                                        e.preventDefault();
                                        incrementMaxStat(statKey, -1);
                                    }
                                }}
                            />
                            <div class="buttons">
                                <button
                                    tabindex="-1"
                                    class="btn"
                                    on:click={(e) => {
                                        incrementMaxStat(statKey, 1);
                                    }}>▲</button
                                >
                                <button
                                    tabindex="-1"
                                    class="btn"
                                    on:click={(e) => {
                                        incrementMaxStat(statKey, -1);
                                    }}>▼</button
                                >
                            </div>
                        </div>
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
    .weight-input {
        display: flex;
        align-items: center;
        width: 62px;
        height: 24px;
        /* border: 1px solid #ccc; */
        /* border-radius: 4px; */
        overflow: hidden;
        box-sizing: border-box;
    }

    .weight-input input {
        flex: 1;
        min-width: 0;
        text-align: center;
        border: none;
        font-size: 0.9rem;
        height: 100%;
        outline: none;
        box-sizing: border-box;
    }

    .buttons {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .btn {
        width: 18px;
        flex: 1;
        font-size: 0.6rem;
        border: none;
        background: #3a3a3a;
        color: #9e9e9e;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        border-radius: 0px;
    }

    .btn:hover {
        background: #555;
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
    .stats-grid td {
        padding-left: 0px;
        padding-right: 0px;
    }
    .stats-grid td:first-child {
        text-align: right;
        padding-right: 10px;
    }
    .stats-grid td:nth-last-child(3) > :first-child {
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
    }
    .stats-grid td:last-child > :first-child {
        border-top-right-radius: 6px;
        border-bottom-right-radius: 6px;
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

    /* .stats-grid input[type="number"] {
        width: 100%;
        box-sizing: border-box;
        border: none;
        font-size: 0.9rem;
    } */
</style>
