<script lang="ts">
    import { itemsCategoryBest, itemsCategoryToCalculate } from "../stores/builder";
    import { get } from "svelte/store";
    import type { Item, ItemCategory, Items } from "../types/item";
    import { ITEM_CATEGORIES } from "../types/item";
    import { calculateBestItems } from "../logic/value";
    function addItem(category: ItemCategory, item: Item) {
        itemsCategoryToCalculate.update((map) => {
            // clone category map and insert
            return {
                ...map,
                [category]: {
                    ...map[category],
                    [item.name]: item,
                },
            };
        });
    }

    function removeItem(category: ItemCategory, item: Item) {
        itemsCategoryToCalculate.update((map) => {
            const { [item.name]: _, ...rest } = map[category]; // drop this item
            return {
                ...map,
                [category]: rest,
            };
        });
    }
    function addAll() {
        const best = get(itemsCategoryBest);

        itemsCategoryToCalculate.update(() => {
            const newMap: Record<ItemCategory, Items> = {} as Record<ItemCategory, Items>;

            for (const cat of ITEM_CATEGORIES) {
                newMap[cat] = Object.fromEntries(best[cat].map((item) => [item.name, item]));
            }

            return newMap;
        });
    }

    $: best = $itemsCategoryBest;
    $: selected = $itemsCategoryToCalculate;
</script>

<div class="container">
    <div class="controls">
        <button on:click={calculateBestItems}>Calculate Best Items</button>
        <button on:click={addAll}>Add All</button>
    </div>
    <div class="lists">
        <div class="list">
            <h2>Best Items</h2>
            {#each ITEM_CATEGORIES as cat}
                <h3>{cat}</h3>
                <ul>
                    {#each best[cat] as item}
                        <li class:selected={selected[cat][item.name]}>
                            <button type="button" on:click={() => addItem(cat, item)}>
                                {item.name} (Lvl {item.level} value {item.value})
                            </button>
                        </li>
                    {/each}
                </ul>
            {/each}
        </div>

        <div class="list">
            <h2>Selected Items</h2>
            {#each ITEM_CATEGORIES as cat}
                <h3>{cat}</h3>
                <ul>
                    {#each Object.values(selected[cat]) as item}
                        <li>
                            <button type="button" on:click={() => removeItem(cat, item)}>
                                {item.name} (Lvl {item.level} value {item.value})
                            </button>
                        </li>
                    {/each}
                </ul>
            {/each}
        </div>
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        font-family: system-ui, sans-serif;
    }

    .controls {
        display: flex;
        gap: 0.5rem;
    }

    .lists {
        display: flex;
        gap: 2rem;
    }

    .list {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
        background: #602323;
    }

    ul {
        list-style: none;
        padding: 0;
    }

    button {
        padding: 0.25rem 0.5rem;
        cursor: pointer;
        border-radius: 4px;
    }

    button:hover {
        background: #6f426d;
    }

    li.selected button {
        background: #694c4c;
        color: #959595;
    }

    h2 {
        margin-top: 0;
    }

    h3 {
        margin-bottom: 0.25rem;
        margin-top: 1rem;
    }
</style>
