<script lang="ts">
    import { onDestroy, onMount, tick } from "svelte";
    import { decodeFromUrl, encodeToUrl, saveHistoryEntry } from "../../logic/encoding/urlEncode";
    import { savedSearch, savedSearches, urlHash, words } from "../../stores/storeBuilder";
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

    let createSavedSearch = false;
    let inputSearchName = "";
    let showSavedSearches = false;

    let container: HTMLDivElement;
    function handleClickOutside(e: MouseEvent) {
        if (showSavedSearches && !container.contains(e.target as Node)) {
            showSavedSearches = false;
        }
        if (createSavedSearch && !container.contains(e.target as Node)) {
            createSavedSearch = false;
        }
    }

    $: if (showSavedSearches || createSavedSearch) {
        document.addEventListener("mousedown", handleClickOutside);
    } else {
        document.removeEventListener("mousedown", handleClickOutside);
    }

    function createSearch(searchName: string) {
        if (!createSavedSearch) {
            createSavedSearch = true;
            tick().then(() => inputEl?.focus());
            return;
        }
        if (!searchName) {
            return;
        }
        if ($savedSearches[searchName] != undefined) {
            return;
        }
        savedSearch.set(searchName);
        savedSearches.update((current) => ({
            ...current,
            [searchName]: window.location.hash.slice(1),
        }));

        inputSearchName = "";
        createSavedSearch = false;
        // console.log("hashUrl", $urlHash);
        // console.log($savedSearches);
        saveHistoryEntry();
    }
    function saveSearch(searchName: string) {
        if (!searchName) {
            return;
        }
        // savedSearch.set(inputSearchName);
        savedSearches.update((current) => ({
            ...current,
            [searchName]: window.location.hash.slice(1),
        }));
        // console.log("hashUrl", $urlHash);
        // console.log($savedSearches);
        saveHistoryEntry();
    }
    function loadSearch(searchName: string) {
        // console.log("hashUrl", $urlHash);
        // console.log($savedSearches);
        // console.log($savedSearches[inputSearchName]);
        decodeFromUrl($savedSearches[searchName]);
        // encodeToUrl();
        savedSearch.set(searchName);
        // inputSearchName = "";
        showSavedSearches = false;
        saveHistoryEntry();
    }
    function deleteSearch(searchName: string) {
        if ($savedSearch == searchName) {
            $savedSearch = undefined;
        }
        savedSearches.update((current) => {
            const updated = { ...current };
            delete updated[searchName];
            return updated;
        });
    }
</script>

<!-- bind:this={savedSearchesEl} -->
<div class="saved-searches-container" bind:this={container}>
    {#if !createSavedSearch}
        <div class="saved-search-name">
            <button
                class="saved-search-name-button"
                on:click={() => (showSavedSearches = !showSavedSearches)}
                on:keydown={(e) => {
                    if (e.key === "Escape") showSavedSearches = false;
                }}
            >
                <h3
                    class:is-saved-search-name={$savedSearch}
                    class:saved={$urlHash == $savedSearches[$savedSearch]}
                >
                    {$savedSearch ? $savedSearch : $words.savedSearches}
                </h3>
                <span>{showSavedSearches ? "▲" : "▼"}</span></button
            >
            {#if Object.keys($savedSearches).length > 0 && showSavedSearches}
                <div
                    class="all-saved-searches"
                    tabindex="-1"
                    on:focusout={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            showSavedSearches = false;
                        }
                    }}
                >
                    <ul>
                        {#each Object.keys($savedSearches) as name}
                            <li class="save-search-load-delete">
                                <button class="load-button" on:click={() => loadSearch(name)}
                                    >{name}</button
                                >
                                <button class="delete-button" on:click={() => deleteSearch(name)}
                                    >X</button
                                >
                            </li>
                        {/each}
                    </ul>
                </div>
            {/if}
        </div>
        <button
            class="save-button"
            on:click={() => saveSearch($savedSearch)}
            disabled={!$savedSearch}
            class:hidden={!$savedSearch}>{$words.save}</button
        >
    {:else}
        <input
            class="new-saved-search-input"
            type="text"
            bind:value={inputSearchName}
            bind:this={inputEl}
            on:keydown={(e) => {
                if (e.key === "Escape") createSavedSearch = false;
                if (e.key === "Enter") createSearch(inputSearchName);
            }}
            placeholder={$words.SavedSearchName}
        />
        <!-- </input> -->
    {/if}
    <button
        class="create-button"
        on:click={() => createSearch(inputSearchName)}
        disabled={createSavedSearch &&
            (inputSearchName == "" || $savedSearches[inputSearchName] != undefined)}
        class:confirm={createSavedSearch &&
            inputSearchName != "" &&
            $savedSearches[inputSearchName] == undefined}>{$words.create}</button
    >
    <button class="share-button" on:click={copyToClipboard} class:copied>
        {#if copied}
            {$words.copied} 📋
        {:else}
            {$words.share} 🔗
        {/if}
    </button>
</div>

<!-- <div bind:this={stopAtEl} class="footer-spacer"></div> -->

<style>
    /* .drop-down {
        display: none;
    } */
    button {
        background-color: unset;
        height: 100%;
        /* vertical-align: center; */
    }
    .is-saved-search-name {
        color: #f89f33;
    }
    .saved {
        color: #2ecc71;
    }

    .saved-search-name {
        position: relative;
        display: inline-flex;
        height: 100%;
        /* overflow: hidden; */
    }
    .saved-search-name-button {
        display: inline-flex;
        min-width: 300px;
        max-width: 400px;
        /* align-items: flex-end; */
    }
    .saved-search-name h3 {
        margin: 0px;
        margin-left: auto;
        margin-right: auto;
        padding: 0px;
        display: flex;
        align-items: center;
        white-space: nowrap;
        overflow: hidden;
    }
    .saved-search-name span {
        margin-left: 10px;

        /* position: relative;
        top: 2px; */

        display: flex;
        align-items: center;
        /* line-height: 1;
        display: inline-block; */
        /* display: inline; */
        /* vertical-align: bottom; */
    }

    .all-saved-searches {
        position: absolute;
        top: 100%;
        width: 100%;
    }
    .all-saved-searches ul {
        list-style: none;
        margin: 0;
        padding: 0;
        /* display:abs; */
        /* position: relative; */
        /* position: absolute; */
        /* width: inherit; */
        border-radius: 0.3rem;
        /* border-color: #fff; */
        background: #2a2a2a;
        max-height: 40vh;
        overflow-y: auto;
        overscroll-behavior: contain;
        /* z-index: 1001; */
        width: 100%;
    }
    .all-saved-searches li {
        width: 100%;
        border-bottom: 1px solid #555;
    }

    .save-search-load-delete {
        display: inline-flex;
        align-items: center;
    }
    .load-button {
        flex: 1;
    }
    .delete-button {
        flex: 0 0 auto;
    }

    .delete-button:hover:not(:disabled) {
        background-color: #b70a0a;
    }

    .create-button.confirm {
        color: #2ecc71;
    }

    .save-button.hidden {
        display: hidden;
    }
    .new-saved-search-input {
        font-size: 1.2rem;
        width: 390px;
        height: 50%;
        align-items: center;
        display: flex;
        padding: 0.2rem 0.75rem;
        margin-left: 1rem;
    }
    .saved-searches-container {
        /* padding-left: 2rem; */
        position: relative;
        /* display: inline-flex; */
        display: flex;
        align-items: center;
        height: 100%;
        /* margin-left: auto; */
    }
    .share-button {
        transition: all 0.2s ease;
        white-space: nowrap;
    }

    .share-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .share-button.copied {
        background-color: #45a045;
    }
</style>
