<script lang="ts">
    import {
        bestBuildsPage,
        buildsDisplayed,
        buildShownCount,
        comparedBuild,
        ranOneSearch,
        savedBuilds,
        savedBuildsPage,
        showSavedBuilds,
    } from "../../stores/storeBuilder";
    import {
        addToSavedBuilds,
        checkOrRequirement,
        compareBuild,
        deleteSavedBuild,
        getSavedBuild,
    } from "../../logic/build";
    import { bestBuilds } from "../../stores/storeBuilder";
    import { getPanoply } from "../../logic/frontendDB";
    import { lang } from "../../stores/storeBuilder";
    import { words } from "../../stores/storeBuilder";
    import { CATEGORY_TO_SLOTS, type Build } from "../../types/build";
    import { calculateBuildToDisplay } from "../../logic/display";
    import { translateRequirement } from "../../logic/language";
    import { onMount, tick } from "svelte";
    import ExportBuild from "./ExportBuild.svelte";
    import { ITEM_CATEGORIES } from "../../../../shared/types/item";
    import {
        ArrowDown,
        ArrowLeftToLine,
        ArrowRightToLine,
        ArrowUp,
        MoveLeft,
        MoveRight,
    } from "lucide-svelte";
    import ShowStats from "../tooltips/ShowStats.svelte";
    import HoverItemOrPano from "../tooltips/HoverItemOrPano.svelte";

    let scrollEl: HTMLDivElement;
    let scrollPos = {
        savedBuilds: 0,
        result: 0,
    };
    function showSavedBuildsOr(show: boolean) {
        if (scrollEl) {
            if (!show) scrollPos.savedBuilds = scrollEl.scrollTop;
            else scrollPos.result = scrollEl.scrollTop;
        }
        showSavedBuilds.set(show);
        calculateBuildToDisplay();

        if ($comparedBuild) {
            compareBuild($comparedBuild);
        }

        // restore previous scroll when switching
        requestAnimationFrame(() => {
            scrollEl.scrollTop = show ? scrollPos.savedBuilds : scrollPos.result;
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

    function firstPage() {
        const pageW = $showSavedBuilds ? savedBuildsPage : bestBuildsPage;
        pageW.set(1);

        calculateBuildToDisplay();
        if ($comparedBuild) {
            compareBuild($comparedBuild);
        }
        requestAnimationFrame(() => {
            scrollEl.scrollTop = 0;
        });
        $showSavedBuilds ? (scrollPos.savedBuilds = 0) : (scrollPos.result = 0);
    }
    function lastPage() {
        const pageW = $showSavedBuilds ? savedBuildsPage : bestBuildsPage;
        pageW.set(total);

        calculateBuildToDisplay();
        if ($comparedBuild) {
            compareBuild($comparedBuild);
        }
        requestAnimationFrame(() => {
            scrollEl.scrollTop = 0;
        });
        $showSavedBuilds ? (scrollPos.savedBuilds = 0) : (scrollPos.result = 0);
    }
    function prevPage() {
        const pageW = $showSavedBuilds ? savedBuildsPage : bestBuildsPage;
        pageW.set(Math.max(1, currPage - 1));
        // console.log(currPage);

        calculateBuildToDisplay();
        if ($comparedBuild) {
            compareBuild($comparedBuild);
        }
    }
    function nextPage() {
        const pageW = $showSavedBuilds ? savedBuildsPage : bestBuildsPage;
        pageW.set(Math.min(total, currPage + 1));
        // console.log(currPage);
        calculateBuildToDisplay();
        if ($comparedBuild) {
            compareBuild($comparedBuild);
        }

        requestAnimationFrame(() => {
            scrollEl.scrollTop = 0;
        });
        $showSavedBuilds ? (scrollPos.savedBuilds = 0) : (scrollPos.result = 0);
    }

    let buildRefs = [] as HTMLElement[];
    function nextBuild() {
        if (currentIndex + 1 >= buildRefs.length) {
            if (currPage < total) nextPage();
        } else {
            scrollToBuild(currentIndex + 1);
        }
    }
    function prevBuild() {
        if (currentIndex === 0) {
            // We are at the top of the page
            if (currPage > 1) {
                prevPage(); // loads previous page

                // After page loads, scroll to last build
                requestAnimationFrame(() => {
                    const lastIndex = buildRefs.length - 1;
                    scrollToBuild(lastIndex);
                });
            }
        } else {
            // Normal case: just go to previous item
            scrollToBuild(currentIndex - 1);
        }
    }
    function scrollToBuild(index: number) {
        const el = buildRefs[index];
        if (!el) return;

        el.scrollIntoView({
            behavior: "instant",
            block: "start",
        });
    }
    let currentIndex = 0;
    let observer: IntersectionObserver | null = null;
    async function resetObserver() {
        await tick();
        await tick();

        if (observer) {
            observer.disconnect();
        }
        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const idx = buildRefs.indexOf(entry.target as HTMLElement);
                        if (idx !== -1) currentIndex = idx;
                    }
                }
            },
            {
                root: scrollEl,
                threshold: 0.5, // reliably triggers on zoomed layouts
            },
        );

        buildRefs.forEach((el) => observer.observe(el));
    }
    $: {
        // run only when the DOM ref array length changes
        if (buildRefs.length === $buildsDisplayed.length) {
            resetObserver();
        }
    }
    // $: if ($buildsDisplayed && $buildsDisplayed.length > 0) {
    //     resetObserver();
    // }

    let hoveredPano: string | undefined = undefined;
    function setHoveredPano(panoId: string) {
        hoveredPano = panoId;
    }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
    id="builds"
    class="section"
    role="application"
    tabindex="0"
    aria-label="Builds"
    on:keydown={(e) => {
        if (e.key === "ArrowUp") {
            e.preventDefault();
            prevBuild();
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            nextBuild();
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            nextPage();
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            prevPage();
        }
    }}
>
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
            <button on:click={firstPage} disabled={currPage === 1} aria-label="First page"
                ><ArrowLeftToLine size={18} /></button
            ><button on:click={prevPage} disabled={currPage === 1} aria-label="Previous page"
                ><MoveLeft size={18} /></button
            ><button on:click={nextPage} disabled={currPage === total} aria-label="Next page"
                ><MoveRight size={18} /></button
            ><button on:click={lastPage} disabled={currPage === total} aria-label="Last page"
                ><ArrowRightToLine size={18} /></button
            >
        </div>
    </div>
    <div
        class="nav-build"
        on:wheel={(e) => {
            e.preventDefault();
            scrollEl.scrollTop += e.deltaY;
        }}
    >
        <button on:click={prevBuild} aria-label="Previous build"><ArrowUp size={24} /></button>
        <button on:click={nextBuild} aria-label="Next build"><ArrowDown size={24} /></button>
    </div>
    <div class="builds" bind:this={scrollEl}>
        {#if $buildsDisplayed.length > 0}
            {#each $buildsDisplayed as build, index}
                <div class="build" bind:this={buildRefs[index]}>
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
                                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                                        <div
                                            class="panoply"
                                            on:mouseenter={() => setHoveredPano(panoId)}
                                            on:mouseleave={() => (hoveredPano = undefined)}
                                            class:pano-hovered={hoveredPano &&
                                                hoveredPano == panoId}
                                        >
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
                                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                                        <div
                                            class="panoply"
                                            on:mouseenter={() => setHoveredPano(panoId)}
                                            on:mouseleave={() => (hoveredPano = undefined)}
                                            class:pano-hovered={hoveredPano &&
                                                hoveredPano == panoId}
                                        >
                                            <HoverItemOrPano panoply={getPanoply(panoId)}>
                                                <span
                                                    class:crossed-text={!build.panoplies[panoId] ||
                                                        build.panoplies[panoId] < 2}
                                                    class:red-background={!build.panoplies[
                                                        panoId
                                                    ] || build.panoplies[panoId] < 2}
                                                    class:green-background={build.panoplies[
                                                        panoId
                                                    ] && comparedCount < 2}
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
                                                    class:green-text={(build.panoplies[panoId] ??
                                                        0) -
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
                                                    <span
                                                        class="item-tag red-background crossed-text"
                                                    >
                                                        {build.diffBuild.slots[slot].name[$lang]}
                                                    </span>
                                                </HoverItemOrPano>
                                            {/if}
                                            {#if build.slots[slot]}
                                                <HoverItemOrPano item={build.slots[slot]}>
                                                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                                                    <span
                                                        on:mouseenter={() =>
                                                            setHoveredPano(
                                                                build.slots[slot].panoply,
                                                            )}
                                                        on:mouseleave={() =>
                                                            (hoveredPano = undefined)}
                                                        class="item-tag"
                                                        class:green-background={build.diffBuild &&
                                                            build.diffBuild.slots[slot] !=
                                                                build.slots[slot]}
                                                        class:pano-hovered-item={hoveredPano &&
                                                            hoveredPano ==
                                                                build.slots[slot].panoply}
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
                            isBuild={true}
                            compareStats={build.diffBuild?.cappedStats}
                            overStats={build.stats}
                        />
                        <div class="requirements">
                            {#each build.requirements as orRequirements}
                                <div
                                    class="requirement {checkOrRequirement(
                                        orRequirements,
                                        build.cappedStats,
                                        build.panopliesBonus,
                                    )}"
                                >
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
        {:else if $showSavedBuilds}
            <h3>{$words.noSavedBuild}</h3>
        {:else if !$ranOneSearch}
            <h3>{$words.startSearchToSeeBuilds}</h3>
        {:else}
            <h3>
                {$words.noBuildFound} <br />
                {$words.useBetterParameters}
            </h3>
        {/if}
    </div>
</div>

<style>
    #builds {
        /* scroll-margin-top: 50px; */
        /* padding: 1rem;
        background-color: #333; */
        padding-bottom: 9px;
    }
    .builds-header {
        display: inline-flex;
        align-items: center;
        margin-bottom: 6px;
        width: 100%;
    }
    .nav-build {
        position: absolute;
        bottom: 28px;
        right: 114px;
        display: flex;
        flex-direction: column;
        z-index: 1;
    }
    .nav-build button {
        opacity: 30%;
        transition: all 0.2s ease;
    }
    .nav-build button:hover {
        opacity: 100%;
    }
    .pager {
        /* align-items: center;
        justify-content: center;
        line-height: 0; */
        margin-left: auto;
        display: flex;
    }
    .pager span {
        display: flex;
        padding: 0px;
        align-items: center;
        justify-content: center;
        line-height: 0;
        margin-right: 5px;
    }
    .pager button {
        padding: 0px;
        align-items: center;
        justify-content: center;
        line-height: 0;
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
        /* background: #3e2857; */
        background: #2a265e;
        /* background: #412166; */
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
    .builds {
        /* height: 90vh; */
        /* background: #282629; */
        /* background: #252226; */
        background: #29262d;

        height: calc(100vh - 124px);
        min-height: 500px;
        overflow-y: scroll;
        overflow-x: hidden;
        overscroll-behavior-y: contain;
        border: 1px solid #555;
        border-radius: 8px;
        position: relative;
        /* margin-bottom: 9px; */
    }
    .build {
        display: flex;
        border-bottom: 1px solid #555;
        padding: 1rem;
    }
    .build:last-child {
        min-height: max(calc(100vh - 124px - 2rem));
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

    .green-background {
        background-color: #005122 !important;
    }
    .red-background {
        background-color: #6a180e !important;
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
        background: #393939;
        color: #fff;
        font-size: 1rem;
        border-radius: 0.5rem;
        font-weight: 500;
        line-height: 1;
        /* white-space: nowrap; */
        border: 1px solid rgba(0, 0, 0, 0);
    }
    .pano-hovered-item {
        border: 1px solid #ffea00;
        /* border-style:; */
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

    .panoplies .panoply:nth-child(odd) {
        background-color: #222222;
    }
    .panoplies .panoply:nth-child(even) {
        background-color: #1e1e1e;
    }
    .panoplies .pano-hovered {
        background-color: #333 !important;
    }
    /* .panoplies .panoply:hover {
        background-color: #333;
    } */
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
