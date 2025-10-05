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
    } from "../stores/builder";
    import { get } from "svelte/store";
    import type { Item, ItemCategory, Items } from "../types/item";
    import { getEmptyCategoriesItems, ITEM_CATEGORIES } from "../types/item";
    import { calculateBestItems } from "../logic/value";
    import { getItem } from "../logic/frontendDB";
    import { calculatePanopliesToDisplay } from "../logic/display";

    function addOrRemoveItem(itemName: string) {
        const item = getItem(itemName);
        if (get(itemsSelected)[item.category][item.name]) {
            removeItem(item);
        } else {
            addItem(item);
        }
        calculatePanopliesToDisplay();
    }

    function addItems(items: Item[]) {
        for (const item of items) {
            addItem(item);
        }
        calculatePanopliesToDisplay();
    }
    function removeItems(items: Item[]) {
        for (const item of items) {
            removeItem(item);
        }
        calculatePanopliesToDisplay();
    }

    function addItem(item: Item) {
        itemsSelected.update((map) => {
            // clone category map and insert
            return {
                ...map,
                [item.category]: {
                    ...map[item.category],
                    [item.name]: item,
                },
            };
        });
    }

    function removeItem(item: Item) {
        itemsSelected.update((map) => {
            const { [item.name]: _, ...rest } = map[item.category]; // drop this item
            return {
                ...map,
                [item.category]: rest,
            };
        });
    }
    // function addAll() {
    //     const best = get(itemsCategoryBest);

    //     itemsSelected.update(() => {
    //         const newMap: Record<ItemCategory, Items> = {} as Record<ItemCategory, Items>;

    //         for (const cat of ITEM_CATEGORIES) {
    //             newMap[cat] = Object.fromEntries(best[cat].map((item) => [item.name, item]));
    //         }

    //         return newMap;
    //     });
    // }
    function showOnlySelected(showOnlySelected: boolean) {
        showOnlySelectedPanos.set(showOnlySelected);
        calculatePanopliesToDisplay();
    }
    function setBonusPanoCappedItems(show: boolean) {
        showBonusPanoCappedItems.set(show);
    }

    function orderByValueWithPano(withPanoValue: boolean) {
        sortBestItemsWithPanoValue.set(withPanoValue);
    }

    function clearAll() {
        itemsSelected.set(getEmptyCategoriesItems());
        calculatePanopliesToDisplay();
    }
</script>

{#snippet addItemToSelecteds(items: Item[])}
    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th>Level</th>
                <th>Value</th>
                <th>Value with Pano</th>
            </tr>
        </thead>
        <tbody>
            {#each items as item}
                <tr class:selected={$itemsSelected[item.category][item.name]}>
                    <td>
                        <button
                            class="item_button"
                            type="button"
                            on:click={() => addOrRemoveItem(item.name)}
                        >
                            {item.name}
                        </button>
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
        <button on:click={calculateBestItems}>Calculate Best Items</button>
        <!-- <button on:click={addAll}>Add All</button> -->
    </div>
    <div class="lists">
        <div class="list-container">
            <div class="best-column-header">
                <h2>Best Items</h2>
                {#if $sortBestItemsWithPanoValue}
                    <button on:click={() => orderByValueWithPano(false)}>Order by Value</button>
                {/if}
                {#if !$sortBestItemsWithPanoValue}
                    <button on:click={() => orderByValueWithPano(true)}
                        >Order by Value with Pano</button
                    >
                {/if}
            </div>
            <div class="list">
                {#each ITEM_CATEGORIES as cat}
                    <!-- <div class="same-line-button"> -->
                    <h3>{cat}</h3>

                    {#if cat == "dofus"}
                        {#if $showBonusPanoCappedItems}
                            <button on:click={() => setBonusPanoCappedItems(false)}
                                >Hide bonus pano &lt; 3</button
                            >
                        {/if}
                        {#if !$showBonusPanoCappedItems}
                            <button on:click={() => setBonusPanoCappedItems(true)}
                                >Show bonus pano &lt; 3</button
                            >
                        {/if}
                    {/if}
                    <!-- </div> -->
                    {@render addItemToSelecteds($itemsCategoryDisplayed[cat])}
                {/each}
            </div>
        </div>

        <div class="list-container">
            <div class="best-column-header">
                {#if !$showOnlySelectedPanos}
                    <h2>Best + Selected Panos</h2>
                {/if}
                {#if $showOnlySelectedPanos}
                    <h2>Selected Panos</h2>
                {/if}
                {#if !$showOnlySelectedPanos}
                    <button on:click={() => showOnlySelected(true)}>Only Selected</button>
                {/if}
                {#if $showOnlySelectedPanos}
                    <button on:click={() => showOnlySelected(false)}>Best + Selected</button>
                {/if}
                <!-- <button on:click={showSelected}>Show Selected</button> -->
            </div>
            <div class="list">
                {#each $panopliesDisplayed as panoply}
                    <h3>{panoply.name}</h3>
                    {@render addItemToSelecteds(panoply.itemsReal)}
                    <button type="button" on:click={() => addItems(panoply.itemsReal)}>
                        Add Items
                    </button>
                    <!-- {#if panoply.itemsReal.length > 0} -->
                    <button type="button" on:click={() => removeItems(panoply.itemsReal)}>
                        Remove Items
                    </button>
                    <!-- {/if} -->
                {/each}
            </div>
        </div>

        <div class="list-container">
            <div class="best-column-header">
                <h2>Selected Items</h2>
                <button on:click={clearAll}>Clear</button>
            </div>
            <div class="list list-selected">
                {#each ITEM_CATEGORIES as cat}
                    <h3>{cat}</h3>
                    <ul>
                        {#each Object.values($itemsSelected[cat]) as item}
                            <li>
                                <button
                                    class="item_button"
                                    type="button"
                                    on:click={() => removeItem(item)}
                                >
                                    {item.name} (Lvl {item.level})
                                </button>
                            </li>
                        {/each}
                    </ul>
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    .controls {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        align-content: center;
    }

    .container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        font-family: system-ui, sans-serif;
        width: 100%; /* stretch full width of parent */
        /* max-width: 1200px; */
        margin: 0 auto; /* center if you set a max-width */
    }
    .best-column-header {
        display: flex;
        align-items: center; /* vertically align h2 and button */
        justify-content: space-between; /* push them to opposite sides */
        /* gap: 1rem; space if they’re side by side */
        vertical-align: middle;
        margin-bottom: 10px;
    }
    .best-column-header h2 {
        margin-bottom: 0px;
        line-height: 1.1;
    }

    .lists {
        display: flex;
        gap: 2rem;
    }

    .list {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 8px;
        background: #651d1d;
        overflow-y: scroll;
        max-height: 750px;
        min-height: 750px;
        min-width: 400px;
        max-width: 400px;
    }
    .list h3 {
        position: sticky;
        top: 0;
        /* background: #5a0707; same as your list background */
        background: #372e2e;
        margin: 0;
        padding: 0.25rem 0.5rem;
        /* padding: 1rem 1rem; */
        /* padding-top: 1rem; */
        z-index: 1; /* make sure it stays above content */
        /* border-radius: 3px;
        border-color: beige;
        border-width: 3px; */
        /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); */
    }
    .list-selected {
        min-width: 250px;
        max-width: 250px;
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

    .item_button {
        padding: 0.25rem 0.5rem;
        /* margin: 1px; */
        cursor: pointer;
        border-radius: 4px;
        width: 100%;
        background: #3e1010;
    }

    .item_button:hover {
        background: #7e417b;
    }

    tr.selected button {
        background: #694c4c;
        color: #959595;
    }

    .red {
        color: #b70a0a;
    }

    h2 {
        margin-top: 0;
    }

    h3 {
        margin-bottom: 0.25rem;
        margin-top: 1rem;
    }
</style>
