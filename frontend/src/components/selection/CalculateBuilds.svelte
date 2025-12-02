<script lang="ts">
    import { Save } from "lucide-svelte";
    import { buildsFromWasm, calculateBuildValue, compareBuild } from "../../logic/build";
    import { calculateBuildToDisplay } from "../../logic/display";
    import { saveHistoryEntry } from "../../logic/encoding/urlEncode";
    import { saveComputeSpeed } from "../../logic/frontendDB";
    import {
        bestBuilds,
        comparedBuild,
        maxStats,
        minItems,
        minStats,
        panopliesSelected,
        preStats,
        ranOneSearch,
        savedBuilds,
        totalPossibilities,
        weights,
        words,
    } from "../../stores/storeBuilder";
    import { createCombinationOrchestrator, initWorkerPool } from "../../workers/orchestrator";
    import { onMount } from "svelte";

    let combinationStart = 0;
    let timeStart: number;
    let elapsedSec: number;
    let combosPerMin: number = 0;
    let intervalId: number;

    // function runComboSearch() {
    // error = null;
    // bestBuilds = null;
    // running = true;

    // multithr
    const orchestrator = createCombinationOrchestrator();
    const { running, combinationDone, error } = orchestrator;

    // console.log("getPanoToCalculate");
    // console.log(get(panopliesSelected));

    async function runComboSearch() {
        saveHistoryEntry();
        combinationStart = $totalPossibilities;
        timeStart = performance.now();

        intervalId = setInterval(() => {
            refreshCalculSpeed();
            // console.log(
            //     `⏱ ${elapsedMin.toFixed(1)}s elapsed — ${combosPerMin.toFixed(2)} combos/s`,
            // );
        }, 1000);

        const raw = await orchestrator.start({
            // selectedItems: $itemsSelected,
            // lockedItems: $itemsLocked,
            minItems: $minItems,
            weights: $weights,
            minStats: $minStats,
            maxStats: $maxStats,
            preStats: $preStats,
            panoplies: $panopliesSelected,
        });
        clearInterval(intervalId);
        refreshCalculSpeed();

        bestBuilds.set(buildsFromWasm(raw));
        calculateBuildToDisplay();
        for (const savedBuild of $savedBuilds) {
            calculateBuildValue(savedBuild);
        }
        if ($comparedBuild) {
            calculateBuildValue($comparedBuild);
            compareBuild($comparedBuild);
        }
        ranOneSearch.set(true);
    }
    function refreshCalculSpeed() {
        if (!running) return;
        const now = performance.now();
        elapsedSec = (now - timeStart) / 1000;
        combosPerMin = (60 * $combinationDone) / elapsedSec;
    }
    function cancelCalcul() {
        orchestrator.cancel();
        clearInterval(intervalId);
    }
    onMount(async () => {
        initWorkerPool();
    });
</script>

{#if $error}
    <p style="color: red;">{$error}</p>
{/if}
<div class="calculations">
    <button
        class="button-calculate"
        on:click={runComboSearch}
        disabled={$running || $totalPossibilities < 1}
    >
        {$running ? `${$words.calculating}...` : $words.calculateBestBuilds}
    </button>
    {#if $running}
        <button class="button-cancel" on:click={() => cancelCalcul()} disabled={!$running}
            >{$words.cancel}</button
        >
    {/if}
    {#if combinationStart > 0}
        <p class="calcul-progress">
            {$words.combinationsCalculated}: {new Intl.NumberFormat("en-US", {
                notation: "compact",
                compactDisplay: "short",
            }).format($combinationDone)}
            - {(() => {
                const percent = ($combinationDone / combinationStart) * 100;
                return percent === 100 ? "100%" : `${percent.toFixed(1)}%`;
            })()} [{new Intl.NumberFormat("en-US", {
                notation: "compact",
                compactDisplay: "short",
            }).format(combosPerMin)} / min]
            <button
                class="save-compute-speed-btn"
                on:click={() => saveComputeSpeed(combosPerMin / 1000000)}
            >
                <Save size={24} />
            </button>
        </p>
    {/if}
</div>

<style>
    .calculations {
        height: 84px;
    }
    .calcul-progress {
        margin-top: 0.5rem;
        margin-bottom: 0px;
        /* margin-bottom: 1rem; */
        font-variant-numeric: tabular-nums;
    }
    .button-calculate {
        margin-top: 0rem;
        font-size: 1.2rem;
    }
    .button-cancel:hover {
        background: rgb(139, 10, 10);
    }
    .save-compute-speed-btn {
        padding: 0px;
        vertical-align: middle;
    }
</style>
