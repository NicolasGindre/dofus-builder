<script lang="ts">
    import {
        bestBuildsPage,
        buildsDisplayed,
        buildShownCount,
        comparedBuild,
        itemsLocked,
        itemsSelected,
        maxStats,
        minStats,
        panopliesSelected,
        preStats,
        savedBuilds,
        savedBuildsPage,
        showSavedBuilds,
        weights,
    } from "../stores/builder";
    import {
        addToSavedBuilds,
        buildsFromWasm,
        calculateBuildValue,
        checkOrRequirement,
        deleteSavedBuild,
        diffBuild,
        getSavedBuild,
    } from "../logic/build";
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
    import { calculateBuildToDisplay } from "../logic/display";
    import { saveHistoryEntry } from "../logic/encoding/urlEncode";
    import { translateRequirement } from "../logic/language";
    import { tick } from "svelte";
    import { createDofusDBBuild } from "../clients/dofusDB";
    import ExportBuild from "./ExportBuild.svelte";
    // let bestBuilds: { score: number; names: string[] }[] | null = null;
    // let error: string | null = null;
    // let running = false;
    let combinationStart = 0;
    let timeStart: number;
    let elapsedSec: number;
    let combosPerMin: number = 0;
    let intervalId: number;

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
        timeStart = performance.now();

        intervalId = setInterval(() => {
            refreshCalculSpeed();
            // console.log(
            //     `⏱ ${elapsedMin.toFixed(1)}s elapsed — ${combosPerMin.toFixed(2)} combos/s`,
            // );
        }, 1000);

        const raw = await orchestrator.start({
            selectedItems: $itemsSelected,
            lockedItems: $itemsLocked,
            weights: $weights,
            minStats: $minStats,
            maxStats: $maxStats,
            preStats: $preStats,
            panoplies: $panopliesSelected,
        });
        clearInterval(intervalId);
        refreshCalculSpeed();

        bestBuilds.set(buildsFromWasm(raw));
        calculateBuildToDisplay();
        for (const savedBuild of $savedBuilds) {
            calculateBuildValue(savedBuild);
        }
        if ($comparedBuild) {
            calculateBuildValue($comparedBuild);
            compareBuild($comparedBuild);
        }
    }
    function refreshCalculSpeed() {
        if (!running) return;
        const now = performance.now();
        elapsedSec = (now - timeStart) / 1000;
        combosPerMin = (60 * $combinationDone) / elapsedSec;
    }
    function cancelCalcul() {
        orchestrator.cancel();
        clearInterval(intervalId);
    }

    function compareBuild(buildToCompare: Build | undefined) {
        const builds = get(buildsDisplayed);
        for (const build of builds) {
            // if (build.diffBuild?.id != buildToCompare?.id) {
            //     console.log(build.diffBuild?.id, buildToCompare?.id);
            diffBuild(build, buildToCompare);
            // }
        }
        buildsDisplayed.set([...builds]);
        comparedBuild.set(buildToCompare);
    }

    let scrollEl: HTMLDivElement;
    let scrollPos = {
        saved: 0,
        result: 0,
    };
    function showSavedBuildsOr(show: boolean) {
        if (scrollEl) {
            if (!show) scrollPos.saved = scrollEl.scrollTop;
            else scrollPos.result = scrollEl.scrollTop;
        }
        showSavedBuilds.set(show);
        calculateBuildToDisplay();

        if ($comparedBuild) {
            compareBuild($comparedBuild);
        }

        // restore previous scroll when switching
        requestAnimationFrame(() => {
            scrollEl.scrollTop = show ? scrollPos.saved : scrollPos.result;
        });
    }

    let savingBuildIndex: number | undefined = null;
    let tempBuildName = "";
    let inputEl: HTMLInputElement | null = null;
    let wrapperEl: HTMLDivElement;

    function startSavingBuild(i: number, name: string) {
        savingBuildIndex = i;
        tempBuildName = name;
        tick().then(() => inputEl?.focus());
    }

    function cancelSaveBuild() {
        savingBuildIndex = null;
    }

    function saveBuild(build: Build) {
        if (tempBuildName != "") {
            build.name = tempBuildName;
            // buildsDisplayed.set([...$buildsDisplayed]);
            addToSavedBuilds(build);
            // if ($comparedBuild.id == $buildsDisplayed[i].id) {
            //     comparedBuild.update({})
            // }
        }
        savingBuildIndex = null;
    }
    // function deleteSavedBuild(buildId: string) {}

    $: total = Math.max(
        Math.ceil(($showSavedBuilds ? $savedBuilds.length : $bestBuilds.length) / $buildShownCount),
        1,
    );
    $: currPage = $showSavedBuilds ? $savedBuildsPage : $bestBuildsPage;

    function prev() {
        const pageW = $showSavedBuilds ? savedBuildsPage : bestBuildsPage;
        pageW.set(Math.max(1, currPage - 1));
        // console.log(currPage);

        calculateBuildToDisplay();
        if ($comparedBuild) {
            compareBuild($comparedBuild);
        }
    }
    function next() {
        const pageW = $showSavedBuilds ? savedBuildsPage : bestBuildsPage;
        pageW.set(Math.min(total, currPage + 1));
        // console.log(currPage);
        calculateBuildToDisplay();
        if ($comparedBuild) {
            compareBuild($comparedBuild);
        }

        requestAnimationFrame(() => {
            scrollEl.scrollTop = $showSavedBuilds ? scrollPos.saved : scrollPos.result;
        });
        // $showSavedBuilds ? (scrollPos.saved = 0) : (scrollPos.result = 0);
    }
    // const next = () => (current = Math.min(total, current + 1));
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
        <button class="button-cancel" on:click={() => cancelCalcul()} disabled={!$running}
            >{$words.cancel}</button
        >
    {/if}
    {#if combinationStart > 0}
        <p>
            {$words.combinationsCalculated}: {new Intl.NumberFormat("en-US", {
                notation: "compact",
                compactDisplay: "short",
            }).format($combinationDone)}
            - {(() => {
                const percent = ($combinationDone / combinationStart) * 100;
                return percent === 100 ? "100%" : `${percent.toFixed(1)}%`;
            })()} [{new Intl.NumberFormat("en-US", {
                notation: "compact",
                compactDisplay: "short",
            }).format(combosPerMin)} / min]
        </p>
    {/if}
</div>

{#if $error}
    <p style="color: red;">{$error}</p>
{/if}
<div class="builds-header">
    <div class="compare-label">
        {#if $comparedBuild}
            <button on:click={() => compareBuild(undefined)} aria-label="Remove comparison">
                ✕
            </button>
            <span>{$words.comparing}: </span>
            <span class="compare-build-name">{$comparedBuild.name}</span>
        {/if}
    </div>
    <div class="view-toggle">
        <!-- <h2></h2> -->
        <button
            class="toggle-btn"
            on:click={() => showSavedBuildsOr(false)}
            disabled={!$showSavedBuilds}
            aria-pressed={!$showSavedBuilds}
        >
            {$words.results}
        </button>
        <button
            class="toggle-btn"
            on:click={() => showSavedBuildsOr(true)}
            disabled={$showSavedBuilds}
            aria-pressed={$showSavedBuilds}
        >
            {$words.savedBuilds}
        </button>
    </div>
    <div class="pager">
        <span>{$words.page} {currPage}/{total}</span>
        <button on:click={prev} disabled={currPage === 1} aria-label="Previous page">←</button
        ><button on:click={next} disabled={currPage === total} aria-label="Next page">→</button>
    </div>
</div>
<div class="builds" bind:this={scrollEl}>
    {#if $buildsDisplayed.length > 0}
        {#each $buildsDisplayed as build, index}
            <div class="build">
                <div class="build-info">
                    <div class="build-name">
                        {#if index != savingBuildIndex}
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                            <h2 on:click={() => startSavingBuild(index, build.name)}>
                                {build.name}
                            </h2>
                        {:else}
                            <div
                                class="edit-name"
                                bind:this={wrapperEl}
                                on:focusout={(e) => {
                                    if (!wrapperEl.contains(e.relatedTarget as Node)) {
                                        cancelSaveBuild();
                                    }
                                }}
                            >
                                <input
                                    bind:this={inputEl}
                                    bind:value={tempBuildName}
                                    on:keydown={(e) => {
                                        if (e.key === "Enter") saveBuild(build);
                                        if (e.key === "Escape") cancelSaveBuild();
                                    }}
                                />
                                <button aria-label="Save" on:click={() => saveBuild(build)}>
                                    <svg viewBox="0 0 24 24" width="34" height="34">
                                        <path
                                            fill="currentColor"
                                            d="M9 16.17l-3.5-3.5L4 14l5 5L20 8l-1.5-1.5z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        {/if}
                    </div>
                    <div class="build-header">
                        <div class="build-controls">
                            {#if getSavedBuild(build.id)}
                                <button
                                    class="button-save delete"
                                    on:click={() => deleteSavedBuild(build.id)}
                                    disabled={index == savingBuildIndex}>{$words.delete}</button
                                >
                            {:else}
                                <button
                                    class="button-save"
                                    on:click={() => startSavingBuild(index, build.name)}
                                    disabled={index == savingBuildIndex}>{$words.save}</button
                                >
                            {/if}
                            <ExportBuild {build} />
                            <!-- <button class="button-export" on:click={() => await createDofusDBBuild(build)}
                                >{$words.export}</button
                            > -->
                        </div>
                        <div class="value-compare">
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
                    </div>
                    <div class="panoplies">
                        {#if !build.diffBuild}
                            {#each Object.entries(build.panoplies) as [panoId, count]}
                                {#if count > 1}
                                    <div class="panoply">
                                        <HoverItemOrPano panoply={getPanoply(panoId)}>
                                            <span>
                                                {getPanoply(panoId).name[$lang]}
                                            </span><span>&nbsp;-&nbsp;</span>
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
                                                {getPanoply(panoId).name[$lang]}
                                            </span><span>&nbsp;-&nbsp;</span>
                                        </HoverItemOrPano>
                                        {#if comparedCount != build.panoplies[panoId]}
                                            <!-- <span>
                                            {comparedCount}
                                        </span> -->
                                            <!-- <span class="arrow">→</span> -->
                                            <span
                                                class:green-text={(build.panoplies[panoId] ?? 0) -
                                                    (comparedCount ?? 0) >
                                                    0}
                                                class:red-text={(build.panoplies[panoId] ?? 0) -
                                                    (comparedCount ?? 0) <
                                                    0}
                                                >({(build.panoplies[panoId] ?? 0) -
                                                    (comparedCount ?? 0) >
                                                0
                                                    ? "+"
                                                    : ""}{(build.panoplies[panoId] ?? 0) -
                                                    (comparedCount ?? 0)})&nbsp;</span
                                            >
                                        {/if}
                                        <HoverItemOrPano
                                            panoply={getPanoply(panoId)}
                                            panoplyItemCount={build.panoplies[panoId]}
                                        >
                                            <span
                                                >{build.panoplies[panoId] ?? 0}
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
                        stats={build.cappedStats}
                        showHeaders={true}
                        compareStats={build.diffBuild?.cappedStats}
                        overStats={build.stats}
                    />
                    <div class="requirements">
                        {#each build.requirements as orRequirements}
                            <div class="requirement {checkOrRequirement(build, orRequirements)}">
                                {#each orRequirements as requirement, i}
                                    <strong>{translateRequirement(requirement)}</strong>
                                    {#if i < orRequirements.length - 1}
                                        {" "}<strong><em>{$words.or}</em></strong>{" "}
                                    {/if}
                                {/each}
                                <br />
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        {/each}
    {:else}
        <h3>{$words.noBuild}</h3>
    {/if}
</div>

<style>
    p {
        font-variant-numeric: tabular-nums;
    }
    .builds-header {
        display: inline-flex;
        align-items: center;
        margin-bottom: 6px;
        width: 100%;
    }
    .pager {
        margin-left: auto;
    }
    .compare-label {
        font-size: 1.1rem;
        min-width: 40%;
        text-align: left;
        max-width: 64%;
    }
    .compare-label button {
        font-size: 1.3rem;
        padding: 6px;
    }
    .compare-label button:hover {
        background: #b70a0a;
    }
    .compare-build-name {
        font-weight: bold;
    }

    .view-toggle {
        display: flex;
        /* justify-content: center; */
        gap: 0.5rem;
        margin-left: 0.5rem;
        /* flex: 1; */
    }
    .view-toggle button:disabled {
        /* background: #6a4f91; */
        background: #3e2857;
        border: 1px solid #ccc;
        color: unset;
    }
    /* .view-toggle button:not(:disabled) { */
    /* color: unset; */
    /* } */
    .view-toggle button:hover:not(:disabled) {
        color: unset;
    }
    .pager button {
        width: 25px;
        padding: 0;
        height: 39px;
    }
    .build-name {
        text-align: left;
        margin-bottom: 0px;
        min-height: 43px;
    }
    .build-name h2 {
        margin: 0;
        font-size: 1.3rem;
        padding-bottom: 10px;
    }
    .edit-name {
        display: flex;
        align-items: center;
        /* gap: 0.25rem; */
        /* margin-bottom: 3px; */
    }
    .edit-name input {
        flex: 1;
        font-size: 1.2rem;
        padding: 0.2rem 0.4rem;
    }
    .edit-name button {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 0;
        background-color: unset;
        margin-left: 2px;
    }

    .requirements {
        /* margin-top: 1rem; */
        margin-top: 5px;
        text-align: left;
        display: grid;
    }
    .requirement {
        width: fit-content;
        height: fit-content;
    }
    .requirements .warning {
        background-color: #917300;
    }
    .requirements .invalid {
        background-color: #8c0000;
    }
    .button-calculate {
        margin-top: 0.6rem;
    }
    .button-cancel:hover {
        background: rgb(139, 10, 10);
    }
    .builds {
        /* height: 90vh; */
        background: #252226;
        height: calc(100vh - 70px);
        min-height: 500px;
        overflow: scroll;
        overscroll-behavior-y: contain;
        border: 1px solid #ccc;
        border-radius: 8px;
        margin-bottom: 9px;
    }
    .build {
        display: flex;
        border-bottom: 1px solid #ccc;
        padding: 1rem;
        /* margin-bottom: 1rem; */
    }
    .build-info {
        max-width: 34%;
        padding-left: 10px;
        margin-right: 10px;
    }
    .build-header {
        display: flex;
        flex-direction: column;
        /* height: 60px; */
        /* align-items: center; */
        /* justify-content: space-between; */
        margin-bottom: 15px;
        width: 100%;
    }
    .build-header h3 {
        margin: 0px;
    }
    .build-controls {
        margin-bottom: 10px;
    }

    .build-controls,
    .value-compare {
        display: flex;
        align-items: center;
        /* gap: 0.5rem; */
    }
    .button-compare {
        margin-right: 10px;
        height: 40px;
    }
    .button-save {
        margin-right: 10px;
        /* height: 40px; */
    }

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
    .build-stats {
        margin-left: auto;
        margin-right: auto;
        /* min-width: 50%; */
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
        white-space: nowrap;
    }
    /* .panoply span:first-child { */
    /* margin-right: 5px; */
    /* display: inline-flex; */
    /* } */
    .slots {
        margin-left: 0px;
        padding-left: 0px;
        padding-bottom: 0px;
        margin-bottom: 0px;
        /* display: flex;
        list-style: none;
        padding: 2px 0;
        gap: 0.5rem;
        align-items: center; */
    }
</style>
