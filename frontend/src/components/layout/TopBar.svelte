<script lang="ts">
    import { dofusVersion, showTutorial, words } from "../../stores/storeBuilder";
    import LanguageSelect from "./LanguageSelect.svelte";
    import SavedSearches from "./SavedSearches.svelte";
</script>

<div class="topbar">
    <!-- <div></div> -->
    <div>
        <SavedSearches />
    </div>
    <div class="right-div">
        <!-- <span>{$dofusVersion}</span> -->
        <a href={$words.patchNoteURL} target="_blank" rel="noopener noreferrer">
            {$dofusVersion}
        </a>
        <button on:click={() => ($showTutorial = !$showTutorial)}>{$words.tutorial}</button>
        <LanguageSelect />
    </div>
    <!-- </div> -->
</div>

<style>
    div {
        height: 100%;
    }
    .right-div {
        display: inline-flex;
        align-items: center;
    }
    .right-div a {
        margin: 0 1rem;
        vertical-align: center;
        color: #b2b2b2;
    }
    .right-div a:hover {
        color: #535bf2;
    }
    .topbar {
        position: fixed;
        top: 0;
        width: 100%;
        right: 0;

        z-index: 100001;

        /* overflow-x: scroll; */
        overflow: visible;

        height: 50px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        /* padding: 0 1rem; */
        box-sizing: border-box;

        background-color: #2f2f2f;
        box-shadow:
            0 1px 5px rgba(0, 0, 0, 0.2),
            0 2px 2px rgba(0, 0, 0, 0.14),
            0 3px 1px -2px rgba(0, 0, 0, 0.12);
    }
</style>
