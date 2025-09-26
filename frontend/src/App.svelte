<script lang="ts">
    import { onMount } from "svelte";
    import type { Item, Items, Panoplies } from "./types/item";
    import StatWeights from "./components/StatWeights.svelte";
    import { get } from "svelte/store";
    import { items, panoplies } from "./stores/builder";
    import { initFrontendDB } from "./logic/frontendDB";
    import BestItems from "./components/BestItems.svelte";

    get(items);
    get(panoplies);
    let error: string | null = null;

    onMount(async () => {
        try {
            await initFrontendDB();
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
        }
    });
</script>

<main>
    <h1>Dofus Build Calculator</h1>

    {#if error}
        <p style="color: red;">{error}</p>
    {:else}
        <p>Loaded {Object.keys($items).length} items</p>
        <p>Loaded {Object.keys($panoplies).length} panoplies</p>
        <!-- <ul>
      {#each Object.entries(panoplies) as [key, panoplie]}
        <li>{panoplie.name} ({panoplie.items})</li>
      {/each}
    </ul> -->
    {/if}
    <StatWeights />
    <BestItems />
</main>

<style>
    main {
        font-family: system-ui, sans-serif;
        padding: 1rem;
        max-width: 800px;
        margin: auto;
    }
    /* ul {
    list-style: none;
    padding: 0;
  }
  li {
    padding: 0.25rem 0;
    border-bottom: 1px solid #ddd;
  } */
</style>
