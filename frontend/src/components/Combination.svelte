<script lang="ts">
    import {
        bestBuildsDisplayed,
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
    import { CATEGORY_TO_SLOTS } from "../types/build";
    import { createCombinationOrchestrator } from "../workers/orchestrator";
    import { calculateBestBuildToDisplay } from "../logic/display";
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
        combinationStart = $totalPossibilities;
        const raw = await orchestrator.start({
            selectedItems: $itemsSelected,
            weights: $weights,
            minStats: $minStats,
            maxStats: $maxStats,
            preStats: $preStats,
            panoplies: $panopliesSelected,
        });

        bestBuilds.set(buildsFromWasm(raw));
        calculateBestBuildToDisplay();
    }
</script>

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

{#if $error}
    <p style="color: red;">{$error}</p>
{:else if $bestBuildsDisplayed.length > 0}
    <!-- <h3>Best combination value: {$bestBuilds[0]?.value.toFixed(2)}</h3> -->
    {#each $bestBuildsDisplayed as build}
        <div class="build">
            <div class="build-items">
                <h3>{$words.value} {build.value?.toFixed(0)}</h3>
                <div class="panoplies">
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
                </div>

                <ul class="slots">
                    {#each ITEM_CATEGORIES as category}
                        <div class="category-slots">
                            <strong>{$words.category[category]}:</strong>
                            <div class="item-tag-container">
                                {#each CATEGORY_TO_SLOTS[category] as slot}
                                    {#if build.slots[slot]}
                                        <HoverItemOrPano item={build.slots[slot]}>
                                            <span class="item-tag">
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
                <ShowStats stats={build.stats} />
            </div>
        </div>
    {/each}
{/if}

<style>
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
        max-width: 40%;
        padding-left: 30px;
    }

    .category-slots {
        display: flex;

        align-items: center;
        flex-wrap: wrap;
        min-height: 30px;
        /* gap: 0.4rem; */
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
        background: #333; /* tag background color */
        color: #fff; /* text color */
        font-size: 1rem;
        border-radius: 0.5rem; /* rounded corners */
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
        /* display: flex;
        list-style: none;
        padding: 2px 0;
        gap: 0.5rem;
        align-items: center; */
    }
</style>
