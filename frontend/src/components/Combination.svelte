<script lang="ts">
    import {
        bestBuildsDisplayed,
        comparedBuild,
        itemsLocked,
        itemsSelected,
        maxStats,
        minStats,
        panopliesSelected,
        preStats,
        weights,
    } from "../stores/builder";
    import { buildsFromWasm, diffBuild } from "../logic/build";
    import { ITEM_CATEGORIES } from "../types/item";
    import { get } from "svelte/store";
    import { bestBuilds, totalPossibilities, panoplies } from "../stores/builder";
    import {
        STAT_DEFENSE_KEYS,
        STAT_OFFENSE_KEYS,
        STAT_UTILITY_KEYS,
        type StatKey,
        type Stats,
    } from "../types/stats";
    import { includes } from "zod/v4";
    // import ShowStats from "./ShowStats.svelte";
    import ShowStats from "./ShowStats.svelte";
    import HoverItemStats from "./HoverItemOrPano.svelte";
    import HoverItemOrPano from "./HoverItemOrPano.svelte";
    import { getPanoply } from "../logic/frontendDB";
    import { lang } from "../stores/builder";
    import { words } from "../stores/builder";
    import { CATEGORY_TO_SLOTS, type Build } from "../types/build";
    import { createCombinationOrchestrator } from "../workers/orchestrator";
    import { calculateBestBuildToDisplay } from "../logic/display";
    import { saveHistoryEntry } from "../logic/encoding/urlEncode";
    // let bestBuilds: { score: number; names: string[] }[] | null = null;
    // let error: string | null = null;
    // let running = false;
    let combinationStart = 0;
    // let progress = 0;

    // function runComboSearch() {
    // error = null;
    // bestBuilds = null;
    // running = true;

    // multithr
    const orchestrator = createCombinationOrchestrator(true);
    const { running, combinationDone, error } = orchestrator;

    console.log("getPanoToCalculate");
    console.log(get(panopliesSelected));

    async function runComboSearch() {
        saveHistoryEntry();
        combinationStart = $totalPossibilities;
        const raw = await orchestrator.start({
            selectedItems: $itemsSelected,
            lockedItems: $itemsLocked,
            weights: $weights,
            minStats: $minStats,
            maxStats: $maxStats,
            preStats: $preStats,
            panoplies: $panopliesSelected,
        });

        bestBuilds.set(buildsFromWasm(raw));
        calculateBestBuildToDisplay();
        if ($comparedBuild) {
            compareBuild($comparedBuild);
        }
    }
    // function compareBuild(comparedBuild: Build) {
    //     // comparedBuild = build;
    //     for (const build of $bestBuildsDisplayed) {
    //         diffBuild(build, comparedBuild);
    //     }
    // }
    function compareBuild(buildToCompare: Build) {
        const builds = get(bestBuildsDisplayed);
        for (const build of builds) {
            diffBuild(build, buildToCompare);
        }
        bestBuildsDisplayed.set([...builds]);
        comparedBuild.set(buildToCompare);
    }

    // let comparedBuild: Build;
</script>

<div class="calculations">
    <button
        class="button-calculate"
        on:click={runComboSearch}
        disabled={$running || $totalPossibilities < 1}
    >
        {$running ? `${$words.calculating}...` : $words.calculateBestBuilds}
    </button>
    {#if $running}
        <button class="button-cancel" on:click={() => orchestrator.cancel()} disabled={!$running}
            >{$words.cancel}</button
        >
    {/if}
    {#if combinationStart > 0}
        <p>
            {$words.combinationsCalculated}: {new Intl.NumberFormat("en-US", {
                notation: "compact",
                compactDisplay: "short",
            }).format($combinationDone)}
            - {Math.round(($combinationDone / combinationStart) * 100)}%
        </p>
    {/if}
</div>

{#if $error}
    <p style="color: red;">{$error}</p>
{:else if $bestBuildsDisplayed.length > 0}
    {#each $bestBuildsDisplayed as build}
        <div class="build">
            <div class="build-items">
                <div class="build-header">
                    <button class="button-compare" on:click={() => compareBuild(build)}
                        >{$words.compare}</button
                    >
                    <h3>
                        {$words.value}
                        {build.value?.toFixed(0)}

                        {#if build.diffBuild}
                            <span
                                class:green-text={build.diffBuild.value > 0}
                                class:red-text={build.diffBuild.value < 0}
                            >
                                ({build.diffBuild.value >= 0
                                    ? "+"
                                    : ""}{build.diffBuild.value.toFixed(0)})
                            </span>
                        {/if}
                        <!-- {#if build.diffBuild}({build.diffBuild.value.toFixed(0)}){/if} -->
                    </h3>
                </div>
                <div class="panoplies">
                    {#if !build.diffBuild}
                        {#each Object.entries(build.panoplies) as [panoId, count]}
                            {#if count > 1}
                                <div class="panoply">
                                    <HoverItemOrPano panoply={getPanoply(panoId)}>
                                        <span>
                                            {getPanoply(panoId).name[$lang]}:
                                        </span>
                                    </HoverItemOrPano>
                                    <HoverItemOrPano
                                        panoply={getPanoply(panoId)}
                                        panoplyItemCount={count}
                                    >
                                        <span>
                                            {count}
                                            {$words.items}
                                        </span>
                                    </HoverItemOrPano>
                                </div>
                            {/if}
                        {/each}
                    {:else}
                        {#each Object.entries(build.diffBuild.panoplies) as [panoId, comparedCount]}
                            {#if comparedCount > 1 || build.panoplies[panoId] > 1}
                                <div class="panoply">
                                    <HoverItemOrPano panoply={getPanoply(panoId)}>
                                        <span
                                            class:crossed-text={!build.panoplies[panoId] ||
                                                build.panoplies[panoId] < 2}
                                            class:red-background={!build.panoplies[panoId] ||
                                                build.panoplies[panoId] < 2}
                                            class:green-background={build.panoplies[panoId] &&
                                                comparedCount < 2}
                                        >
                                            {getPanoply(panoId).name[$lang]}:
                                        </span>
                                    </HoverItemOrPano>
                                    {#if comparedCount != build.panoplies[panoId]}
                                        <span>
                                            {comparedCount}
                                        </span>
                                        <span class="arrow">→</span>
                                    {/if}
                                    <HoverItemOrPano
                                        panoply={getPanoply(panoId)}
                                        panoplyItemCount={build.panoplies[panoId]}
                                    >
                                        <span>
                                            {build.panoplies[panoId] ?? 0}
                                            {$words.items}
                                        </span>
                                    </HoverItemOrPano>
                                </div>
                            {/if}
                        {/each}
                    {/if}
                </div>

                <ul class="slots">
                    {#each ITEM_CATEGORIES as category}
                        <div class="category-slots">
                            <strong>{$words.category[category]}:</strong>
                            <div class="item-tag-container">
                                {#each CATEGORY_TO_SLOTS[category] as slot}
                                    {#if build.diffBuild && build.diffBuild.slots[slot] && build.diffBuild.slots[slot] != build.slots[slot]}
                                        <HoverItemOrPano item={build.diffBuild.slots[slot]}>
                                            <span class="item-tag red-background crossed-text">
                                                {build.diffBuild.slots[slot].name[$lang]}
                                            </span>
                                        </HoverItemOrPano>
                                    {/if}
                                    {#if build.slots[slot]}
                                        <HoverItemOrPano item={build.slots[slot]}>
                                            <span
                                                class="item-tag"
                                                class:green-background={build.diffBuild &&
                                                    build.diffBuild.slots[slot] !=
                                                        build.slots[slot]}
                                            >
                                                {build.slots[slot].name[$lang]}
                                            </span>
                                        </HoverItemOrPano>
                                    {/if}
                                {/each}
                            </div>
                        </div>
                    {/each}
                </ul>
            </div>

            <div class="build-stats">
                <ShowStats
                    stats={build.stats}
                    showHeaders={true}
                    compareStats={build.diffBuild?.stats}
                    overStats={build.overStats}
                />
            </div>
        </div>
    {/each}
{/if}

<style>
    .calculations {
        height: 120px;
    }
    .green-background {
        background-color: #13552f !important;
    }
    .red-background {
        background-color: #650f05 !important;
    }
    .crossed-text {
        text-decoration: line-through;
    }
    .button-calculate {
        margin-top: 0.6rem;
    }
    .button-cancel:hover {
        background: rgb(139, 10, 10);
    }
    .build-stats {
        margin-left: auto;
    }
    .build {
        background: #252226;
        display: flex;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
    }
    .build-items {
        max-width: 32%;
        padding-left: 30px;
        margin-right: 10px;
    }
    .build-header {
        display: inline-flex;
        /* height: 60px; */
        align-items: center;
        /* justify-content: space-between; */
        margin-bottom: 15px;
        width: 100%;
    }
    .build-header h3 {
        margin: 0px;
    }
    .button-compare {
        margin-right: 15px;
        height: 40px;
    }

    .category-slots {
        display: flex;

        align-items: center;
        flex-wrap: wrap;
        min-height: 30px;
        border-bottom: 1px solid #666;
        padding-top: 3px;
        padding-bottom: 3px;
        /* gap: 0.4rem; */
    }
    .category-slots:last-child {
        border-bottom: unset;
    }
    .category-slots strong {
        flex-shrink: 0;
        padding-right: 3px;
    }
    .item-tag-container {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-wrap: wrap;
        /* gap: 0.4rem; */
    }
    .item-tag {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        margin: 3px;
        background: #333;
        color: #fff;
        font-size: 1rem;
        border-radius: 0.5rem;
        font-weight: 500;
        line-height: 1;
        /* white-space: nowrap; */
    }
    .panoplies {
        display: grid;
        margin-bottom: 0.5rem;
        font-style: italic;
    }
    .panoply {
        display: inline-flex;
    }
    .panoply span:first-child {
        margin-right: 5px;
        /* display: inline-flex; */
    }
    .slots {
        margin-left: 0px;
        padding-left: 0px;
        padding-bottom: 0px;
        /* display: flex;
        list-style: none;
        padding: 2px 0;
        gap: 0.5rem;
        align-items: center; */
    }
</style>
