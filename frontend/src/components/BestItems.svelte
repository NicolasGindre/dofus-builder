<script lang="ts">
    import {
        itemsCategoryBest,
        itemsSelected,
        itemsCategoryDisplayed,
        level,
        panopliesDisplayed,
        sortBestItemsWithPanoValue,
        showOnlySelectedPanos,
        panopliesBest,
        panopliesSelected,
        showBonusPanoCappedItems,
        categoryDisplaySize,
        panoplyDisplaySize,
        totalPossibilities,
    } from "../stores/builder";
    import { get } from "svelte/store";
    import type { Item, ItemCategory, Items } from "../types/item";
    import { getEmptyCategoriesItems, ITEM_CATEGORIES } from "../types/item";
    import { calculateBestItems } from "../logic/value";
    import { getItem } from "../logic/frontendDB";
    import {
        addItems,
        addOrRemoveItem,
        calculatePanopliesToDisplay,
        clearAll,
        orderByValueWithPano,
        removeItem,
        removeItems,
        showOnlySelected,
    } from "../logic/display";
    import HoverItemStats from "./HoverItemOrPano.svelte";
    import HoverItemOrPano from "./HoverItemOrPano.svelte";
    import { lang } from "../stores/builder";
    import PreStats from "./PreStats.svelte";
    import { words } from "../stores/builder";
    import ItemSearch from "./ItemSearch.svelte";

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
    function showMorePano() {
        panoplyDisplaySize.set(get(panoplyDisplaySize) + 5);
        calculatePanopliesToDisplay();
    }
    function showLessPano() {
        panoplyDisplaySize.set(Math.max(0, get(panoplyDisplaySize) - 5));
        calculatePanopliesToDisplay();
    }
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
                        {#if item.valueWithPano !== item.value}
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

        <button on:click={calculateBestItems}>{$words.calculateBestItems}</button>
        <!-- <button on:click={addAll}>Add All</button> -->
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
                            <div class="sticky-title">{$words.category[category]}</div>
                        </div>

                        {#if category == "dofus"}
                            <label class="checkbox-label">
                                {$words.displayItems}
                                <span>{$words.panoBonusLessThan3}</span>
                                <input type="checkbox" bind:checked={$showBonusPanoCappedItems} />
                            </label>
                        {/if}
                        {@render addItemToSelecteds($itemsCategoryDisplayed[category])}
                    </div>
                    <div class="end-list-elem">
                        <button on:click={() => showMore(5, category)}>
                            {$words.showMore}
                        </button>
                        <button on:click={() => showMore(-5, category)}>
                            {$words.showLess}
                        </button>
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
                {/if}
                {#if $showOnlySelectedPanos}
                    <button on:click={() => showOnlySelected(false)}
                        >{$words.bestAndSelected}</button
                    >
                {/if}
            </div>
            <div class="list">
                {#each $panopliesDisplayed as panoply}
                    <div class="list-elem">
                        <div class="sticky">
                            <HoverItemOrPano {panoply}
                                ><div class="sticky-title">
                                    {panoply.name[$lang]}
                                </div></HoverItemOrPano
                            >
                        </div>
                        {@render addItemToSelecteds(panoply.itemsReal)}
                    </div>
                    <div class="end-list-elem">
                        <button type="button" on:click={() => addItems(panoply.itemsReal)}>
                            {$words.addPanoply}
                        </button>
                        <button type="button" on:click={() => removeItems(panoply.itemsReal)}>
                            {$words.removePanoply}
                        </button>
                    </div>
                {/each}
            </div>
        </div>

        <div class="list-container">
            <div class="list-header">
                <h2>{$words.itemsSelected}</h2>
                <button on:click={clearAll}>{$words.clear}</button>
            </div>
            <ItemSearch />
            <div class="list">
                {#each ITEM_CATEGORIES as cat}
                    <div class="list-elem">
                        <!-- <h3 class="sticky">{cat}</h3> -->
                        <div class="sticky">
                            <div class="sticky-title">{$words.category[cat]}</div>
                        </div>
                        <ul>
                            {#each Object.values($itemsSelected[cat]) as item}
                                <li>
                                    <HoverItemStats {item}>
                                        <button
                                            class="item-button"
                                            type="button"
                                            on:click={() => removeItem(item)}
                                        >
                                            {item.name[$lang]}
                                        </button>
                                    </HoverItemStats>
                                </li>
                            {/each}
                        </ul>
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
        height: 850px;
        /* max-height: 750px; */
        /* min-height: 750px; */
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
        vertical-align: middle;
        margin-bottom: 10px;
    }
    .list-header h2 {
        margin-bottom: 0px;
        line-height: 1.1;
    }
    .list {
        /* flex: 1; */
        flex: 1 1 auto;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 8px;
        background: #252226;
        overflow-y: auto;
        overscroll-behavior: contain;
        /* min-width: 400px; */
        /* max-width: 400px; */
    }
    /* .list > * + * {
        margin-bottom: 1rem;
    } */
    .list-elem {
        margin-bottom: 3px;
    }
    .end-list-elem {
        margin-bottom: 0.6rem;
    }
    .sticky {
        position: sticky;
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
    .sticky-title {
        font-weight: 600;
        font-size: 1.1rem;
        padding: 0.25rem 0.5rem;
    }

    ul {
        list-style: none;
        padding: 0;
    }
    ul li {
        margin-bottom: 0.25rem; /* adjust spacing */
    }
    table {
        table-layout: fixed;
        width: 100%;
    }

    th:first-child,
    td:first-child {
        width: 50%; /* force half the table */
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
