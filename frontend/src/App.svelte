<script lang="ts">
    import { checkHashIsSavedSearch, initFrontendDB, loadItemsAndPanos } from "./logic/frontendDB";
    import { decodeFromUrl, setLastHistoryEntry } from "./logic/encoding/urlEncode";

    import Navigation from "./components/layout/Navigation.svelte";
    import TopBar from "./components/layout/TopBar.svelte";
    import StatWeights from "./components/weightsMinMax/StatWeights.svelte";
    import BestItems from "./components/selection/BestItems.svelte";
    import Builds from "./components/builds/Builds.svelte";

    import { onDestroy, onMount } from "svelte";
    import Tutorial from "./components/tooltips/Tutorial.svelte";

    let error: string | null = null;

    onMount(async () => {
        try {
            if ("scrollRestoration" in history) {
                history.scrollRestoration = "manual";
            }
            await loadItemsAndPanos();
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

<TopBar />
<main>
    <Tutorial />
    <div class="section">
        <img
            class="icon"
            src="favicon/favicon-96x96.png"
            alt=""
            width="60"
            height="60"
            loading="lazy"
        />
        <h1>Dofus MinMax</h1>
        {#if error}
            <p style="color: red;">{error}</p>
        {/if}
    </div>
    <StatWeights />
    <BestItems />
    <Builds />
    <Navigation />
</main>

<style>
    .section {
        display: flex;
        align-items: center;
        text-align: left;
        gap: 12px;
        /* padding: 12px 0; */
    }
    h1 {
        margin: 0px;
    }
    main {
        /* height: 60px; */
        padding-top: 50px;
        position: relative;
        font-family: system-ui, sans-serif;
        /* padding: 1rem; */
        padding-left: 5rem;
        padding-right: 5rem;
        max-width: 1282px;
        min-width: 1282px;
        /* margin-left: 5rem;
        margin-right: 5rem; */
        /* padding-bottom: 0; */
        /* max-width: 800px; */
        margin: auto;
    }
</style>
