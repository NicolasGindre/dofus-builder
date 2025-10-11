<script lang="ts">
    import { get } from "svelte/store";
    import { level, exoAp, exoMp, exoRange, preStats, words, exoSummon } from "../stores/builder";

    // auto-subscribe with $ syntax
</script>

<div class="stats">
    <div class="stat">
        <label>
            {$preStats.ap}
            {$words.stats.ap} - Exo
            <input type="checkbox" bind:checked={$exoAp} />
        </label>
    </div>

    <div class="stat">
        <label>
            {$preStats.mp}
            {$words.stats.mp} - Exo
            <input type="checkbox" bind:checked={$exoMp} />
        </label>
    </div>

    <div class="stat">
        <label>
            {$preStats.range}
            {$words.stats.range} - Exo
            <input type="checkbox" bind:checked={$exoRange} />
        </label>
    </div>

    <!-- <div class="stat">
        <label>
            {$words.stats.summon}: {$preStats.summon} - Exo
            <input type="checkbox" bind:checked={$exoSummon} />
        </label>
    </div> -->

    <!-- <div class="stat">
        {$words.stats.health}: {$preStats.health}
    </div> -->

    <!-- <div class="stat">
        Pods: {$preStats.pods}
    </div> -->

    <!-- <button on:click={() => encodeWeights("http://localhost:5173/")}>Save / Share</button> -->
</div>

<style>
    .stats {
        position: absolute;
        top: 100%;
        width: 100%;
        margin-top: 0.6rem;
    }
</style>
