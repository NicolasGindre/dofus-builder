<script lang="ts">
    import { get } from "svelte/store";
    import { items, lang, itemsSelected, words } from "../stores/builder";
    import { addOrRemoveItem } from "../logic/item";

    // Props
    // export let items: { id: number; name: string }[] = [];

    let query = "";
    let results: { id: string; name: string; category: string }[] = [];

    // Reactive filter: updates whenever query or items changes
    $: {
        results = [];
        if (query.length > 2) {
            for (const item of Object.values(get(items))) {
                // console.log(item.name[$lang]);
                if (item.name[$lang].toLowerCase().includes(query.toLowerCase())) {
                    // console.log(results.length);
                    results.push({
                        id: item.id,
                        name: item.name[$lang],
                        category: item.category,
                    });
                }
            }
        }
    }
    function addOrRemoveItemSearched(itemId: string) {
        query = "";
        addOrRemoveItem(itemId);
    }
</script>

<div
    class="item-search"
    tabindex="-1"
    on:focusout={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            query = "";
        }
    }}
>
    <input
        type="text"
        bind:value={query}
        placeholder={$words.addRemoveItemByName}
        class="search-input"
    />

    {#if results.length > 0}
        <ul class="results">
            {#each results as item}
                <button
                    class="item-button"
                    class:item-selected={$itemsSelected[item.category][item.id]}
                    type="button"
                    on:click={() => addOrRemoveItemSearched(item.id)}
                >
                    {item.name}
                </button>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .item-search {
        width: 100%;
        /* max-width: 300px; */
        position: relative;
    }

    .search-input {
        box-sizing: border-box;
        width: 100%;
        margin-bottom: 5px;
        padding: 0.4rem 0.6rem;
        border: 1px solid #555;
        border-radius: 0.4rem;
        background: #1e1e1e;
        color: #fff;
        outline: none;
        transition: border-color 0.2s ease;
    }

    .search-input:focus {
        border-color: #4caf50;
    }

    .results {
        /* display:abs; */
        /* position: relative; */
        position: absolute;
        width: inherit;
        margin: 0rem;
        padding: 0rem;
        border-radius: 0.3rem;
        /* border-color: #fff; */
        background: #2a2a2a;
        list-style: none;
        max-height: 200px;
        overflow-y: auto;
        overscroll-behavior: contain;
        z-index: 20;
    }

    .results button {
        padding: 0.3rem 0.5rem;
        background-color: #1a1a1a;
        border-radius: 0px;
        margin: 1px 0px;
        border-width: 3px;
        /* border-color: 1px; */
        /* background: ; */
        /* cursor: pointer; */
        /* transition: background 0.2s ease; */
    }

    /* .results button:hover {
        background: #3a3a3a;
    } */

    /* .no-results {
        margin-top: 0.4rem;
        font-size: 0.85rem;
        color: #999;
    } */
</style>
