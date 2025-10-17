<script lang="ts">
    import { onMount } from "svelte";
    import StatWeights from "./components/StatWeights.svelte";
    import { initFrontendDB } from "./logic/frontendDB";
    import BestItems from "./components/BestItems.svelte";
    import Combination from "./components/Combination.svelte";
    import LanguageSelect from "./components/LanguageSelect.svelte";
    import SaveButton from "./components/SaveButton.svelte";
    import { decodeFromUrl } from "./logic/encoding/urlEncode";

    // get(items);
    // get(panoplies);
    let error: string | null = null;

    decodeFromUrl();

    onMount(async () => {
        try {
            await initFrontendDB();
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
        }
    });
</script>

<main>
    <SaveButton />
    <LanguageSelect />
    <h1>Dofus Builder</h1>
    {#if error}
        <p style="color: red;">{error}</p>
    {/if}
    <StatWeights />
    <BestItems />
    <Combination />
</main>

<style>
    main {
        font-family: system-ui, sans-serif;
        padding: 1rem;
        /* max-width: 800px; */
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
