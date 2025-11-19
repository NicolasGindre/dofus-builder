<script lang="ts">
    import LanguageSelect from "./LanguageSelect.svelte";
    import SavedSearches from "./SavedSearches.svelte";
</script>

<div class="topbar">
    <!-- <div class="inside-topbar"> -->
    <SavedSearches />
    <LanguageSelect />
    <!-- </div> -->
</div>

<style>
    .topbar {
        position: fixed;
        top: 0;
        width: 100%;
        right: 0;

        z-index: 10000;

        height: 50px;

        background-color: blue;

        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 1rem;
    }
</style>
