<script lang="ts">
    import {
        itemsCategoryBest,
        itemsSelected,
        itemsCategoryDisplayed,
        level,
        panopliesDisplayed,
        sortBestItemsWithPanoValue,
        showOnlySelectedPanos,
        showBonusPanoCappedItems,
        categoryDisplaySize,
        panoplyDisplaySize,
        totalPossibilities,
        itemsLocked,
        urlHash,
        previousStatsSearch,
    } from "../stores/builder";
    import { get } from "svelte/store";
    import type { Item, ItemCategory, Items } from "../types/item";
    import { getEmptyCategoriesItems, ITEM_CATEGORIES } from "../types/item";
    import { calculateBestItems } from "../logic/value";
    import {
        lockItem,
        addItem,
        addItems,
        addOrRemoveItem,
        clearAll,
        removeItem,
        removeItems,
        isItemMinRequirementOK,
    } from "../logic/item";
    import {
        calculatePanopliesToDisplay,
        orderByValueWithPano,
        showOnlySelected,
    } from "../logic/display";
    import HoverItemStats from "./HoverItemOrPano.svelte";
    import HoverItemOrPano from "./HoverItemOrPano.svelte";
    import { lang } from "../stores/builder";
    import PreStats from "./PreStats.svelte";
    import { words } from "../stores/builder";
    import ItemSearch from "./ItemSearch.svelte";
    import { slide } from "svelte/transition";
    import { getEncodedStatsFromHash, saveHistoryEntry } from "../logic/encoding/urlEncode";
    import { categoryLength } from "../types/build";
    import { onMount } from "svelte";
    import SavedSearches from "./SavedSearches.svelte";

    function showMore(more: number, category: ItemCategory) {
        let newCatDisplaySize = get(categoryDisplaySize)[category] + more;
        if (newCatDisplaySize < 0) {
            newCatDisplaySize = 0;
        }
        categoryDisplaySize.update((old) => {
            return {
                ...old,
                [category]: newCatDisplaySize,
            };
        });
    }
    function resetCatDisplaySize(category: ItemCategory) {
        categoryDisplaySize.update((old) => {
            return {
                ...old,
                [category]: 15,
            };
        });
    }
    function showMorePano() {
        panoplyDisplaySize.set(get(panoplyDisplaySize) + 5);
        calculatePanopliesToDisplay();
    }
    function showLessPano() {
        panoplyDisplaySize.set(Math.max(0, get(panoplyDisplaySize) - 5));
        calculatePanopliesToDisplay();
    }

    let collapsedCategories: Record<string, boolean> = {};
    let collapsedPanos: Record<string, boolean> = {};
    let collapsedSelected: Record<string, boolean> = {};

    function toggleCat(id: string) {
        collapsedCategories[id] = !collapsedCategories[id];
    }
    function togglePano(id: string) {
        collapsedPanos[id] = !collapsedPanos[id];
    }
    function toggleSelected(id: string) {
        collapsedSelected[id] = !collapsedSelected[id];
    }

    let hoveredId: string = null;
    function setHovered(id: string) {
        hoveredId = id;
    }

    function quickSelection() {
        for (const pano of $panopliesDisplayed) {
            for (const item of Object.values(pano.itemsReal)) {
                if (isItemMinRequirementOK(item)) {
                    addItem(item);
                }
            }
        }
        for (const [category, items] of Object.entries($itemsCategoryBest)) {
            if (category == "dofus") {
                continue;
            }
            let itemsAdded = 0;
            const itemsToAdd = categoryLength(category as ItemCategory);
            for (const item of Object.values(items)) {
                if (item.level <= $level) {
                    addItem(item);
                    itemsAdded++;
                    if (itemsAdded >= itemsToAdd) {
                        break;
                    }
                }
            }
        }
    }

    function isSkipped(category: ItemCategory, item: Item): boolean {
        const categoryLocks = $itemsLocked[category];
        const ids = Object.keys(categoryLocks);
        if (!categoryLocks[item.id] && ids.length >= categoryLength(category)) {
            return true;
        }
        return false;
    }

    // let previousStatsSearch: string = getEncodedStatsFromHash(window.location.hash.slice(1));
</script>

{#snippet addItemToSelecteds(items: Item[])}
    <table>
        <thead>
            <tr>
                <th>{$words.items}</th>
                <th>{$words.level}</th>
                <th>{$words.value}</th>
                <th>{$words.valueWithPano}</th>
            </tr>
        </thead>
        <tbody>
            {#each items as item}
                <tr>
                    <td>
                        <HoverItemStats {item}>
                            <button
                                class="item-button"
                                class:item-selected={$itemsSelected[item.category][item.id]}
                                type="button"
                                class:highlight={hoveredId === item.id}
                                on:mouseenter={() => setHovered(item.id)}
                                on:mouseleave={() => (hoveredId = null)}
                                on:click={() => addOrRemoveItem(item.id)}
                            >
                                {item.name[$lang]}
                            </button>
                        </HoverItemStats>
                    </td>
                    <td class:red={item.level > $level}>{item.level}</td>
                    <td>
                        {Math.round(item.value)}
                    </td>
                    <td>
                        {#if item.panoply}
                            {Math.round(item.valueWithPano)}
                        {/if}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{/snippet}

<div class="container">
    <div class="controls">
        <div class="level-input">
            {$words.level}
            <input
                type="number"
                min="1"
                max="200"
                bind:value={$level}
                on:input={(e) => {
                    const target = e.target as HTMLInputElement;
                    let value = parseInt(target.value, 10) || 1;
                    if (value < 1) value = 1;
                    if (value > 200) value = 200;
                    $level = value;
                }}
            />
        </div>

        <button
            class:modified={getEncodedStatsFromHash($urlHash) != $previousStatsSearch}
            on:click={() => {
                calculateBestItems();
                saveHistoryEntry();
                previousStatsSearch.set(getEncodedStatsFromHash($urlHash));
            }}>{$words.calculateBestItems}</button
        >
        <!-- <button on:click={addAll}>Add All</button> -->
        <SavedSearches />
    </div>

    <div class="lists">
        <div class="list-container">
            <div class="list-header">
                <h2>{$words.bestItems}</h2>
                {#if $sortBestItemsWithPanoValue}
                    <button on:click={() => orderByValueWithPano(false)}>
                        {$words.orderByValue}
                    </button>
                {/if}
                {#if !$sortBestItemsWithPanoValue}
                    <button on:click={() => orderByValueWithPano(true)}>
                        {$words.orderByValueWithPano}
                    </button>
                {/if}
            </div>
            <div class="list">
                {#each ITEM_CATEGORIES as category}
                    <div class="list-elem">
                        <div class="sticky">
                            <button
                                class="toggle-collapse-icon"
                                on:click={() => toggleCat(category)}
                                >{collapsedCategories[category] ? "+" : "-"}</button
                            >
                            <div class="sticky-title">{$words.category[category]}</div>
                        </div>
                        {#if !collapsedCategories[category]}
                            <div transition:slide>
                                {#if category == "dofus"}
                                    <label class="checkbox-label">
                                        {$words.displayItems}
                                        <span>{$words.panoBonusLessThan3}</span>
                                        <input
                                            type="checkbox"
                                            bind:checked={$showBonusPanoCappedItems}
                                        />
                                    </label>
                                {/if}
                                {@render addItemToSelecteds($itemsCategoryDisplayed[category])}
                                <div class="end-list-elem">
                                    <button on:click={() => showMore(5, category)}>
                                        {$words.showMore}
                                    </button>
                                    <button on:click={() => showMore(-5, category)}>
                                        {$words.showLess}
                                    </button>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
            <PreStats />
        </div>

        <div class="list-container">
            <div class="list-header">
                <h2>{$words.panoplies}</h2>
                {#if !$showOnlySelectedPanos}
                    <div class="pano-display-size">
                        <strong>Top {$panoplyDisplaySize}</strong>
                        <div class="arrows">
                            <button on:click={showMorePano} aria-label="Increase">▲</button>
                            <button on:click={showLessPano} aria-label="Decrease">▼</button>
                        </div>
                    </div>
                    <button on:click={() => showOnlySelected(true)}>{$words.onlySelected}</button>
                {:else}
                    <button on:click={() => showOnlySelected(false)}
                        >{$words.bestAndSelected}</button
                    >
                {/if}
            </div>
            <div class="list">
                {#each $panopliesDisplayed as panoply}
                    <div class="list-elem">
                        <div class="sticky">
                            <button
                                class="toggle-collapse-icon"
                                on:click={() => togglePano(panoply.id)}
                                >{collapsedPanos[panoply.id] ? "+" : "-"}</button
                            >
                            <HoverItemOrPano {panoply}
                                ><div class="sticky-title">
                                    {panoply.name[$lang]}
                                    <!-- - {panoply.bestRelativeValue} -->
                                </div></HoverItemOrPano
                            >
                        </div>
                        {#if !collapsedPanos[panoply.id]}
                            <div transition:slide>
                                {@render addItemToSelecteds(panoply.itemsReal)}
                                <div class="end-list-elem">
                                    <button
                                        type="button"
                                        on:click={() => addItems(panoply.itemsReal)}
                                    >
                                        {$words.addPanoply}
                                    </button>
                                    <button
                                        type="button"
                                        on:click={() => removeItems(panoply.itemsReal)}
                                    >
                                        {$words.removePanoply}
                                    </button>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>

        <div class="list-container">
            <div class="list-header centered">
                <h2>{$words.itemsSelected}</h2>
            </div>
            <div class="selection-controls">
                <button on:click={quickSelection}>{$words.quickSelection}</button>
                <button on:click={clearAll}>{$words.clear}</button>
            </div>
            <ItemSearch />
            <div class="list">
                {#each ITEM_CATEGORIES as cat}
                    <div class="list-elem">
                        <div class="sticky">
                            <button
                                class="toggle-collapse-icon"
                                on:click={() => toggleSelected(cat)}
                                >{collapsedSelected[cat] ? "+" : "-"}</button
                            >
                            <div class="sticky-title">{$words.category[cat]}</div>
                        </div>
                        {#if !collapsedSelected[cat]}
                            <div transition:slide>
                                <table>
                                    <tbody>
                                        {#each Object.values($itemsSelected[cat]) as item}
                                            <!-- <li class="selected-item"> -->
                                            <tr class="selected-item">
                                                <td>
                                                    <HoverItemStats {item}>
                                                        <button
                                                            class="item-button"
                                                            type="button"
                                                            class:highlight={hoveredId === item.id}
                                                            class:skipped-item={isSkipped(
                                                                cat,
                                                                item,
                                                            )}
                                                            on:mouseenter={() =>
                                                                setHovered(item.id)}
                                                            on:mouseleave={() => (hoveredId = null)}
                                                            on:click={() => {
                                                                removeItem(item);
                                                                hoveredId = null;
                                                            }}
                                                        >
                                                            {item.name[$lang]}
                                                        </button>
                                                    </HoverItemStats>
                                                </td>
                                                <td>
                                                    <button
                                                        class="lock"
                                                        class:locked={$itemsLocked[cat][item.id]}
                                                        on:click={() => lockItem(item)}
                                                    >
                                                        {$itemsLocked[cat][item.id] ? "🔒" : "🔓"}
                                                    </button>
                                                </td>
                                                <!-- </li> -->
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
            <div class="total-combinations">
                {$words.totalCombinations}: {new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    compactDisplay: "short",
                }).format($totalPossibilities)}
            </div>
        </div>
    </div>
</div>

<style>
    .modified {
        color: #f89f33;
    }
    .level-input {
        /* text */
        font-weight: 600;
        font-size: 1.1rem;
    }
    .controls {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        align-content: center;
    }

    .total-combinations {
        position: absolute;
        top: 100%;
        /* font-size: 1.1rem; */
        /* align-items: center;
        align-content: center; */
        margin-top: 0.6rem;
        text-align: center;
        width: 100%;
    }
    .container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        font-family: system-ui, sans-serif;
        width: 100%; /* stretch full width of parent */
        /* max-width: 1200px; */
        margin: 0 auto; /* center if you set a max-width */
        margin-top: 1rem;
    }
    .lists {
        display: flex;
        gap: 2rem;
        /* height: 90vh; */
        height: calc(100vh - 125px);

        min-height: 500px;
    }
    .list-container {
        /* height: 100%; */
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 36%;
        max-width: 36%;
        position: relative;
        /* max-height: 100%;
        min-height: 100%; */
    }
    .list-container:last-child {
        min-width: unset;
        max-width: unset;
    }
    .list-header {
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        justify-content: space-between;
        /* gap: 1rem; space if they’re side by side */
        margin-bottom: 10px;
    }
    .centered {
        justify-content: center;
    }
    .list-header h2 {
        margin-bottom: 0px;
        line-height: 1.1;
    }
    .selection-controls {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 4px;
    }
    .selection-controls > button {
        justify-content: space-between;
        padding-left: 0;
        padding-right: 0;
        width: 100%;
    }
    .list {
        /* flex: 1; */
        flex: 1 1 auto;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 8px;
        background: #252226;
        overflow-y: auto;
        overscroll-behavior-y: contain;
        /* min-width: 400px; */
        /* max-width: 400px; */
    }
    /* .list::-webkit-scrollbar {
        width: 4px;
        background: transparent;
    }
    .list::-webkit-scrollbar-track {
        margin-right: -50px;
    } */
    /* .list > * + * {
        margin-bottom: 1rem;
    } */
    .list-elem {
        margin-bottom: 3px;
    }
    .list-elem:has(.selected-item) {
        margin-bottom: 0px;
    }
    .end-list-elem {
        margin-bottom: 0.6rem;
    }
    .sticky {
        /* position: relative; */
        width: 100%;
        display: flex;
        position: sticky;
        align-items: center;
        justify-content: center;
        top: 0;
        /* background: #5a0707; same as your list background */
        /* background: #3f2d53; */
        background: #3e2857;
        margin: 0;
        /* padding: 0.25rem 0.5rem; */
        /* padding: 1rem 1rem; */
        /* padding-top: 1rem; */
        z-index: 1;
        border-radius: 4px;
        /* border-color: beige; */
        /* border-width: 3px; */
        /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); */
    }
    .toggle-collapse-icon {
        position: absolute;
        /* display: inline-block; */
        /* text-align: center; */
        top: 50%;
        transform: translateY(-50%);
        left: 0;
        padding: 0;
        background: unset;
        width: 2em;
        font-size: 1.3rem;
        height: 100%;
        font-weight: 700;
        border-radius: 4px;
        z-index: 5;
    }
    .sticky-title {
        font-weight: 600;
        font-size: 1.1rem;
        padding: 0.25rem 0.5rem;
        margin-inline: auto;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    /* ul {
        margin-top: 0px;
        margin-bottom: 0px;
        list-style: none;
        padding: 0;
    }
    ul li {
        margin-top: 3px;
        margin-bottom: 3px;
    } */
    table {
        table-layout: fixed;
        width: 100%;
    }
    /* .selected-item {
        display: flex;
    } */
    .skipped-item {
        /* background-color: #694c4c; */
        color: #959595;
        opacity: 55%;
    }
    .lock {
        /* background-color: #343434; */
        opacity: 35%;
        margin: 0px;
        margin-right: 3px;

        padding-left: 9px;
        padding-right: 9px;

        padding-top: 0px;
        padding-bottom: 0px;

        border-radius: 4px;
        width: 100%;
        height: 100%;
        /* flex: 1; */
        /* height: 31px; */
        display: block;
        /* line-height: normal; */
        position: absolute;
        inset: 0;
        font-size: 1.281rem;
    }
    .locked {
        opacity: 100%;
    }

    th:first-child,
    td:first-child {
        width: 50%; /* force half the table */
    }

    /* th:first-child, */
    .selected-item td:first-child {
        width: 84%;
        /* display: flex; */
    }
    .selected-item td {
        padding: 0px;
        position: relative;

        /* height: ; */
    }

    .pano-display-size {
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }
    .arrows {
        display: flex;
        flex-direction: column;
    }

    .arrows button {
        /* background: #333; */
        color: #fff;
        border: none;
        border-radius: 4px;
        width: 1.2rem;
        height: 1.2rem;
        cursor: pointer;
        line-height: 1;
        font-size: 0.8rem;
        padding: 0;
    }

    .arrows button:hover {
        background: #4caf50;
    }
    /* .item-button {
        padding: 0.25rem 0.5rem;
        cursor: pointer;
        border-radius: 4px;
        width: 100%;
        background: #571414;
    }

    .item-button:hover {
        background: #7e417b;
    } */

    /* .item-selected {
        background: #694c4c;
        color: #959595;
    } */

    .red {
        color: #b70a0a;
    }

    h2 {
        margin-top: 0;
    }
    .checkbox-label span {
        font-style: italic;
        margin-left: 5px;
    }
    /* 
    h3 {
        margin-bottom: 0.25rem;
        margin-top: 1rem;
    } */
</style>
