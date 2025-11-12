<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { decodeFromUrl, encodeToUrl, saveHistoryEntry } from "../logic/encoding/urlEncode";
    import { savedSearch, savedSearches, urlHash, words } from "../stores/builder";
    import { get } from "svelte/store";

    let copied = false;
    let timeout: number;
    let inputEl: HTMLInputElement;

    function copyToClipboard() {
        saveHistoryEntry();

        // Copy to clipboard
        const url = new URL(window.location.href);
        navigator.clipboard.writeText(url.toString()).then(() => {
            copied = true;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                copied = false;
            }, 2000) as unknown as number;
        });
    }

    // Clean up the timeout on component destruction
    onDestroy(() => {
        clearTimeout(timeout);
    });

    let inputSearchName = "";
    // let results: string[] = [];
    // $: {
    //     results = [];
    //     for (const name of Object.values(get(savedSearches))) {
    //         if (name.toLowerCase().includes(inputSearchName.toLowerCase())) {
    //             results.push(name);
    //         }
    //     }
    // }
    let showSavedSearches = false;
    function saveSearch() {
        if (!inputSearchName) {
            if (!$savedSearch) {
                return;
            } else {
                inputSearchName = $savedSearch;
            }
        }
        savedSearch.set(inputSearchName);
        savedSearches.update((current) => ({
            ...current,
            [inputSearchName]: window.location.hash.slice(1),
        }));
        // console.log("hashUrl", $urlHash);
        // console.log($savedSearches);

        inputSearchName = "";
        saveHistoryEntry();
    }
    function loadSearch() {
        // console.log("hashUrl", $urlHash);
        // console.log($savedSearches);
        // console.log($savedSearches[inputSearchName]);
        decodeFromUrl($savedSearches[inputSearchName]);
        // encodeToUrl();
        savedSearch.set(inputSearchName);
        inputSearchName = "";
        saveHistoryEntry();
    }
    function deleteSearch() {
        if ($savedSearch == inputSearchName) {
            $savedSearch = undefined;
        }
        savedSearches.update((current) => {
            const updated = { ...current };
            delete updated[inputSearchName];
            return updated;
        });
    }
</script>

<!-- bind:this={savedSearchesEl} -->
<div class="saved-searches-container">
    <div class="saved-searches">
        <div class="">
            <h4
                class:is-saved-search-name={$savedSearch}
                class:saved={$urlHash == $savedSearches[$savedSearch]}
            >
                {$savedSearch ? $savedSearch : $words.savedSearches}
            </h4>

            <div
                class="save-search-name"
                tabindex="-1"
                on:focusout={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        inputSearchName = "";
                        showSavedSearches = false;
                    }
                }}
            >
                <div class="search-input-select">
                    <input
                        type="text"
                        bind:value={inputSearchName}
                        bind:this={inputEl}
                        on:dblclick={() => (showSavedSearches = !showSavedSearches)}
                        on:input={() => (showSavedSearches = false)}
                        on:keydown={(e) => {
                            if (e.key === "Escape") showSavedSearches = false;
                        }}
                        placeholder={$words.SavedSearchName}
                        class="search-input"
                    />
                    <button on:click={() => (showSavedSearches = !showSavedSearches)}
                        >{showSavedSearches ? "▲" : "▼"}</button
                    >
                </div>
                {#if Object.keys($savedSearches).length > 0 && showSavedSearches}
                    <ul class="results">
                        {#each Object.keys($savedSearches) as name}
                            <button
                                on:click={() => {
                                    inputSearchName = name;
                                    showSavedSearches = false;
                                    inputEl.focus();
                                }}
                            >
                                {name}
                            </button>
                        {/each}
                    </ul>
                {/if}
                <div class="buttons-control">
                    <button
                        class="save-button"
                        on:click={saveSearch}
                        disabled={($savedSearches[inputSearchName] != undefined &&
                            inputSearchName != $savedSearch) ||
                            (!$savedSearch && !inputSearchName)}>{$words.save}</button
                    >
                    <button
                        class="load-button"
                        on:click={loadSearch}
                        disabled={$savedSearches[inputSearchName] == undefined}
                        >{$words.load}</button
                    >
                    <button
                        class="delete-button"
                        on:click={deleteSearch}
                        disabled={$savedSearches[inputSearchName] == undefined}>X</button
                    >
                </div>
            </div>
        </div>
        <button class="share-button" on:click={copyToClipboard} class:copied>
            {#if copied}
                {$words.copied}! 📋
            {:else}
                {$words.share} 🔗
            {/if}
        </button>
    </div>
</div>

<!-- <div bind:this={stopAtEl} class="footer-spacer"></div> -->

<style>
    .is-saved-search-name {
        color: #f89f33;
    }
    .saved {
        color: #2ecc71;
    }

    .delete-button:hover:not(:disabled) {
        background-color: #b70a0a;
    }
    .search-input-select {
        display: inline-flex;
        width: 100%;
    }
    .search-input-select button {
        padding: 0px 5px;
        height: 32px;
    }
    .search-input {
        width: 100%;
    }
    .buttons-control {
        display: inline-flex;
        /* font-size: 0.9rem; */
        font-size: 14px;
    }
    .buttons-control button {
        padding-left: 10px;
        padding-right: 10px;
    }
    .saved-searches input {
        box-sizing: border-box;
        width: 100%;
        /* margin-bottom: 5px; */
        padding: 0.4rem 0.6rem;
        border: 1px solid #555;
        border-radius: 0.4rem;
        /* background: #1e1e1e; */
        /* color: #fff; */
        outline: none;
        transition: border-color 0.2s ease;
        font-size: 0.9rem;
    }
    .saved-searches-container {
        position: relative;
        margin-left: auto;
    }
    .saved-searches {
        /* position: sticky; */
        /* position: fixed; */
        /* position: relative; */
        position: absolute;
        /* margin-left: auto; */
        right: 0px;
        top: -150px;
        z-index: 100;
        padding: 10px 15px;
        background-color: #4a4a4a;
        border-radius: 4px;
        /* border-top-left-radius: 4px;
        border-bottom-left-radius: 4px; */
        width: 257px;
        overflow: hidden;
        /* transition:
            max-height 0.3s ease,
            opacity 0.3s ease; */
        /* opacity: 50%; */
        /* max-height: 20px; */
    }
    /* .saved-searches:hover, */
    .saved-searches h4 {
        margin: 0px;
        padding-bottom: 6px;
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
        max-height: 250px;
        overflow-y: auto;
        overscroll-behavior: contain;
        z-index: 1001;
        width: 232px;
    }
    .results button {
        /* position: relative; */
        padding: 0.28rem 0.5rem;
        background-color: #323232;
        border-radius: 0px;
        margin: 1px 0px;
        border-width: 3px;
        font-size: 14px;
        width: 100%;
        /* border-color: 1px; */
        /* background: ; */
        /* cursor: pointer; */
        /* transition: background 0.2s ease; */
    }
    .share-button {
        /* color: white; */
        /* border: none; */
        /* cursor: pointer; */
        font-size: 14px;
        transition: all 0.2s ease;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        margin-top: 10px;
    }

    .share-button:hover {
        /* background-color: #5a5a5a; */
        transform: translateY(-1px);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
    }

    .share-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .share-button.copied {
        background-color: #45a045;
    }
</style>
