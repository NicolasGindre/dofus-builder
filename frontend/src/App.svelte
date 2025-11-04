<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import StatWeights from "./components/StatWeights.svelte";
    import { checkHashIsSavedSearch, initFrontendDB, loadItemsAndPanos } from "./logic/frontendDB";
    import BestItems from "./components/BestItems.svelte";
    import LanguageSelect from "./components/LanguageSelect.svelte";
    import { decodeFromUrl, setLastHistoryEntry } from "./logic/encoding/urlEncode";
    import { itemsSelected } from "./stores/builder";
    import { getEmptyCategoriesItems } from "./types/item";
    import Builds from "./components/Builds.svelte";
    import SavedSearches from "./components/SavedSearches.svelte";
    import { setPanopliesSorted } from "./logic/encoding/encodeItems";

    let error: string | null = null;

    onMount(async () => {
        try {
            await loadItemsAndPanos();
            setPanopliesSorted();
            decodeFromUrl();
            initFrontendDB();
            checkHashIsSavedSearch();

            window.addEventListener("popstate", handler);
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
        }
    });
    const handler = () => {
        console.log("back/forward pressed");
        // itemsSelected.set(getEmptyCategoriesItems());
        setLastHistoryEntry(window.location.href);
        decodeFromUrl();
        checkHashIsSavedSearch();
    };
    onDestroy(() => {
        window.removeEventListener("popstate", handler);
    });
</script>

<main>
    <SavedSearches />
    <LanguageSelect />
    <h1>Dofus MinMax - Builder</h1>
    {#if error}
        <p style="color: red;">{error}</p>
    {/if}
    <StatWeights />
    <BestItems />
    <Builds />
</main>

<style>
    main {
        font-family: system-ui, sans-serif;
        /* padding: 1rem; */
        padding-left: 1rem;
        padding-right: 1rem;
        /* padding-bottom: 0; */
        /* max-width: 800px; */
        margin: auto;
    }
</style>
