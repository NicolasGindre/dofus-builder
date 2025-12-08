<script lang="ts">
    import {
        itemsCategoryBest,
        itemsSelected,
        itemsCategoryDisplayed,
        level,
        panopliesDisplayed,
        sortBestItemsWithPanoValue,
        showOnlySelectedPanos,
        showBonusPanoCappedItems,
        categoryDisplaySize,
        panoplyDisplaySize,
        totalPossibilities,
        itemsLocked,
        urlHash,
        previousStatsSearch,
        timeEstimated,
        millionComboPerMin,
        itemsSelectedDisplayed,
        showValueAsPercent,
        categoryBestValue,
        categoryBestValueWithPano,
    } from "../../stores/storeBuilder";
    import { get } from "svelte/store";
    import type { Item } from "../../types/item";
    import { calculateBestItems } from "../../logic/value";
    import {
        lockItem,
        addItem,
        addItems,
        addOrRemoveItem,
        clearAll,
        removeItem,
        removeItems,
        isItemMinRequirementOK,
        isItemBonusPanoCapped,
    } from "../../logic/item";
    import {
        calculatePanopliesToDisplay,
        getTopXPanos,
        orderByValueWithPano,
        showOnlySelected,
    } from "../../logic/display";
    // import HoverItemOrPano from "../tooltips/HoverItemOrPano.svelte";
    import { lang } from "../../stores/storeBuilder";
    import PreStats from "./PreStats.svelte";
    import { words } from "../../stores/storeBuilder";
    import ItemSearch from "./ItemSearch.svelte";
    import { slide } from "svelte/transition";
    import {
        getEncodedStatsAndLockedFromHash,
        saveHistoryEntry,
    } from "../../logic/encoding/urlEncode";
    import { categoryLength } from "../../types/build";
    import { ITEM_CATEGORIES, type ItemCategory } from "../../../../shared/types/item";
    import { Eye } from "lucide-svelte";
    import CalculateBuilds from "./CalculateBuilds.svelte";
    import HoverItemOrPano from "../tooltips/HoverItemOrPano.svelte";

    function showMore(more: number, category: ItemCategory) {
        let newCatDisplaySize = get(categoryDisplaySize)[category] + more;
        if (newCatDisplaySize < 0) {
            newCatDisplaySize = 0;
        }
        categoryDisplaySize.update((old) => {
            return {
                ...old,
                [category]: newCatDisplaySize,
            };
        });
    }
    function resetCatDisplaySize(category: ItemCategory) {
        categoryDisplaySize.update((old) => {
            return {
                ...old,
                [category]: 15,
            };
        });
    }
    function showMorePano() {
        panoplyDisplaySize.set(Math.min(500, get(panoplyDisplaySize) + 5));
        calculatePanopliesToDisplay();
    }
    function showLessPano() {
        panoplyDisplaySize.set(Math.max(5, get(panoplyDisplaySize) - 5));
        calculatePanopliesToDisplay();
    }

    let collapsedCategories: Record<string, boolean> = {};
    let collapsedPanos: Record<string, boolean> = {};
    let collapsedSelected: Record<string, boolean> = {};

    function toggleCat(id: string) {
        collapsedCategories[id] = !collapsedCategories[id];
    }
    function togglePano(id: string) {
        collapsedPanos[id] = !collapsedPanos[id];
    }
    function toggleSelected(id: string) {
        collapsedSelected[id] = !collapsedSelected[id];
    }

    let hoveredItem: Item | undefined = undefined;
    function setHovered(item: Item) {
        hoveredItem = item;
    }
    type OriginListId = "best-panos" | "best-items" | "selected-items";
    function scrollToItem(item: Item, originListId: OriginListId) {
        let targetListIds: OriginListId[];
        if (originListId == "best-panos") {
            targetListIds = ["best-items", "selected-items"];
        }
        if (originListId == "best-items") {
            targetListIds = ["best-panos", "selected-items"];
        }
        if (originListId == "selected-items") {
            targetListIds = ["best-items", "best-panos"];
        }
        for (const targetListId of targetListIds) {
            const targetList = document.getElementById(targetListId);
            let targetItem = document.getElementById(`${targetListId}-${item.id}`);
            if (!targetItem) {
                if (targetListId == "best-items") {
                    targetItem = document.getElementById(`show-more-${item.category}`);
                } else {
                    continue;
                }
            }
            const itemRect = targetItem.getBoundingClientRect();
            const containerRect = targetList.getBoundingClientRect();

            const offset =
                itemRect.top -
                containerRect.top +
                targetList.scrollTop -
                targetList.clientHeight / 2 +
                itemRect.height / 2;

            targetList.scrollTo({ top: offset, behavior: "smooth" });
        }
        // targetItem.classList.add("highlight");
        // setTimeout(() => targetItem.classList.remove("highlight"), 800);
    }

    function quickSelection() {
        const panosToInclude = getTopXPanos();
        for (const pano of panosToInclude) {
            for (const item of Object.values(pano.itemsReal)) {
                if (isItemMinRequirementOK(item)) {
                    addItem(item);
                }
            }
        }
        for (const [category, items] of Object.entries($itemsCategoryBest)) {
            if (category == "dofus") {
                continue;
            }
            let itemsAdded = 0;
            const itemsToAdd = categoryLength(category as ItemCategory);
            for (const item of Object.values(items)) {
                if (item.level <= $level) {
                    addItem(item);
                    itemsAdded++;
                    if (itemsAdded >= itemsToAdd) {
                        break;
                    }
                }
            }
        }
        if (!panosToInclude.length) {
            return;
        }

        const lowestScore = panosToInclude[panosToInclude.length - 1].bestRelativeValue;
        // console.log(lowestScore);
        for (const [category, items] of Object.entries($itemsCategoryBest)) {
            if (category == "dofus" || category == "pet") {
                continue;
            }
            for (const item of Object.values(items)) {
                if (item.value <= 0) {
                    break;
                }
                if (
                    item.level <= $level &&
                    (item.value - $categoryBestValue[category] > lowestScore ||
                        item.value > $categoryBestValue[category] * 0.97)
                ) {
                    addItem(item);
                }
            }
        }
        calculatePanopliesToDisplay();
    }

    function isSkipped(category: ItemCategory, item: Item): boolean {
        const categoryLocks = $itemsLocked[category];
        const ids = Object.keys(categoryLocks);
        if (!categoryLocks[item.id] && ids.length >= categoryLength(category)) {
            return true;
        }
        return false;
    }

    function formatDuration(seconds: number, lang: string): string {
        const units = [
            { label: $words.year, value: 365 * 24 * 3600 },
            { label: $words.day, value: 24 * 3600 },
            { label: $words.hour, value: 3600 },
            { label: $words.min, value: 60 },
            { label: $words.sec, value: 1 },
        ];

        const parts: string[] = [];

        for (const { label, value } of units) {
            const amount = Math.floor(seconds / value);
            if (amount > 0) {
                parts.push(`${amount} ${label}${amount > 1 ? "s" : ""}`);
                seconds %= value;
            }
        }
        return parts.length ? parts.slice(0, 2).join(", ") : `<1 ${$words.sec}`;
    }
    $: firstDofusPanoCappedIndex =
        $itemsSelectedDisplayed["dofus"].findIndex(isItemBonusPanoCapped);
</script>

{#snippet addItemToSelecteds(items: Item[], listId: OriginListId)}
    <table>
        <thead>
            <tr>
                <th>{$words.items}</th>
                <th>{$words.level}</th>
                <th>{$words.value}</th>
                <th>{$words.valueWithPano}</th>
            </tr>
        </thead>
        <tbody>
            {#each items as item}
                <tr id={`${listId}-${item.id}`}>
                    <td
                        class="item-buttons-container"
                        on:mouseenter={() => setHovered(item)}
                        on:mouseleave={() => (hoveredItem = undefined)}
                    >
                        <div class="item-button-wrapper">
                            <HoverItemOrPano {item}>
                                <button
                                    class="item-button"
                                    class:item-selected={$itemsSelected[item.category][item.id]}
                                    class:skipped-item={isSkipped(item.category, item)}
                                    class:highlight={hoveredItem && hoveredItem.id === item.id}
                                    type="button"
                                    on:click={() => addOrRemoveItem(item.id)}
                                >
                                    {item.name[$lang]}
                                </button>
                            </HoverItemOrPano>
                        </div>
                        <button
                            class="nav-to-item-button"
                            on:click={() => scrollToItem(item, listId)}><Eye size={20} /></button
                        >
                    </td>
                    <td class:red={item.level > $level}>{item.level}</td>
                    <td>
                        {$showValueAsPercent
                            ? item.value === 0
                                ? "0%"
                                : Math.round(
                                      (item.value * 100) / $categoryBestValue[item.category],
                                  ) + "%"
                            : Math.round(item.value)}
                    </td>
                    <td>
                        {#if item.panoply}
                            {$showValueAsPercent
                                ? item.valueWithPano === 0
                                    ? "0%"
                                    : Math.round(
                                          (item.valueWithPano * 100) /
                                              $categoryBestValueWithPano[item.category],
                                      ) + "%"
                                : Math.round(item.valueWithPano)}
                        {/if}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{/snippet}

<div id="selection" class="section">
    <div class="controls">
        <div class="level-input">
            {$words.level}
            <input
                type="number"
                min="1"
                max="200"
                bind:value={$level}
                on:input={(e) => {
                    const target = e.target as HTMLInputElement;
                    let value = parseInt(target.value, 10) || 1;
                    if (value < 1) value = 1;
                    if (value > 200) value = 200;
                    $level = value;
                }}
            />
        </div>

        <button
            class="button-calculate-best-items"
            class:modified={getEncodedStatsAndLockedFromHash($urlHash) != $previousStatsSearch}
            on:click={() => {
                calculateBestItems();
                saveHistoryEntry();
                previousStatsSearch.set(getEncodedStatsAndLockedFromHash($urlHash));
            }}>{$words.calculateBestItems}</button
        >
        <label class="checkbox-label">
            <input type="checkbox" bind:checked={$showValueAsPercent} />
            {$words.showValueAsPercentFromBest}
            <!-- Show Value As % -->
        </label>
        <!-- <button on:click={addAll}>Add All</button> -->
    </div>

    <div class="lists">
        <div class="list-container">
            <div class="list-header">
                <h2>{$words.bestItems}</h2>
                {#if $sortBestItemsWithPanoValue}
                    <button on:click={() => orderByValueWithPano(false)}>
                        {$words.orderByValue}
                    </button>
                {/if}
                {#if !$sortBestItemsWithPanoValue}
                    <button on:click={() => orderByValueWithPano(true)}>
                        {$words.orderByValueWithPano}
                    </button>
                {/if}
            </div>
            <div id="best-items" class="list">
                {#each ITEM_CATEGORIES as category}
                    <div class="list-elem">
                        <div class="sticky">
                            <button
                                class="toggle-collapse-icon"
                                on:click={() => toggleCat(category)}
                                >{collapsedCategories[category] ? "+" : "-"}</button
                            >
                            <div class="sticky-title">{$words.category[category]}</div>
                        </div>
                        {#if !collapsedCategories[category]}
                            <div transition:slide>
                                {#if category == "dofus"}
                                    <label class="checkbox-label show-bonus-pano-capped-button">
                                        {$words.displayItems}
                                        <span>{$words.panoBonusLessThan3}</span>
                                        <input
                                            type="checkbox"
                                            bind:checked={$showBonusPanoCappedItems}
                                        />
                                    </label>
                                {/if}
                                {@render addItemToSelecteds(
                                    $itemsCategoryDisplayed[category],
                                    "best-items",
                                )}
                                <div class="end-list-elem">
                                    <button
                                        id={`show-more-${category}`}
                                        on:click={() => showMore(5, category)}
                                        class:highlight={hoveredItem &&
                                            hoveredItem.category === category &&
                                            !$itemsCategoryDisplayed[category].some(
                                                (item) => item.id === hoveredItem.id,
                                            )}
                                    >
                                        {$words.showMore}
                                    </button>
                                    <button on:click={() => showMore(-5, category)}>
                                        {$words.showLess}
                                    </button>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
            <PreStats />
        </div>

        <div class="list-container">
            <div class="list-header">
                <h2>{$words.panoplies}</h2>
                {#if !$showOnlySelectedPanos}
                    <div class="pano-display-size">
                        <strong>Top {$panoplyDisplaySize}</strong>
                        <div class="arrows">
                            <button on:click={showMorePano} aria-label="Increase">▲</button>
                            <button on:click={showLessPano} aria-label="Decrease">▼</button>
                        </div>
                    </div>
                    <button on:click={() => showOnlySelected(true)}>{$words.onlySelected}</button>
                {:else}
                    <button on:click={() => showOnlySelected(false)}
                        >{$words.bestAndSelected}</button
                    >
                {/if}
            </div>
            <div id="best-panos" class="list">
                {#each $panopliesDisplayed as panoply}
                    <div class="list-elem">
                        <div class="sticky">
                            <button
                                class="toggle-collapse-icon"
                                on:click={() => togglePano(panoply.id)}
                                >{collapsedPanos[panoply.id] ? "+" : "-"}</button
                            >
                            <HoverItemOrPano {panoply}
                                ><div class="sticky-title">
                                    {panoply.name[$lang]}
                                    <!-- | {panoply.bestRelativeValue} -->
                                </div></HoverItemOrPano
                            >
                        </div>
                        {#if !collapsedPanos[panoply.id]}
                            <div transition:slide>
                                <div class="pano-score">
                                    <em>{$words.score}: {Math.round(panoply.bestRelativeValue)}</em>
                                    <em
                                        >{$words.bestValuePerItem}: +{Math.round(
                                            panoply.bestValuePerItem,
                                        )}</em
                                    >
                                </div>
                                {@render addItemToSelecteds(panoply.itemsReal, "best-panos")}
                                <div class="end-list-elem">
                                    <button
                                        type="button"
                                        on:click={() => addItems(panoply.itemsReal)}
                                    >
                                        {$words.addPanoply}
                                    </button>
                                    <button
                                        type="button"
                                        on:click={() => removeItems(panoply.itemsReal)}
                                    >
                                        {$words.removePanoply}
                                    </button>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>

        <div class="list-container">
            <div class="list-header centered">
                <h2>{$words.itemsSelected}</h2>
            </div>
            <div class="selection-controls">
                <button on:click={quickSelection}>{$words.quickSelection}</button>
                <button on:click={clearAll}>{$words.clear}</button>
            </div>
            <ItemSearch />
            <div id="selected-items" class="list">
                {#each ITEM_CATEGORIES as cat}
                    <div class="list-elem">
                        <div class="sticky">
                            <button
                                class="toggle-collapse-icon"
                                on:click={() => toggleSelected(cat)}
                                >{collapsedSelected[cat] ? "+" : "-"}</button
                            >
                            <div class="sticky-title">{$words.category[cat]}</div>
                        </div>
                        {#if !collapsedSelected[cat]}
                            <div transition:slide>
                                <table class="selected-items-table">
                                    <tbody>
                                        {#each $itemsSelectedDisplayed[cat] as item, i}
                                            {#if i === firstDofusPanoCappedIndex && cat == "dofus"}
                                                <tr class="separator-row">
                                                    <td>
                                                        <hr class="bonus-separator" />
                                                    </td>
                                                    <!-- <td>
                                                        <hr class="bonus-separator" />
                                                    </td> -->
                                                </tr>
                                            {/if}
                                            <tr
                                                id={`selected-items-${item.id}`}
                                                class="selected-item"
                                            >
                                                <td
                                                    class="item-buttons-container"
                                                    on:mouseenter={() => setHovered(item)}
                                                    on:mouseleave={() => (hoveredItem = undefined)}
                                                >
                                                    <div class="item-button-wrapper">
                                                        <HoverItemOrPano {item}>
                                                            <button
                                                                class="item-button"
                                                                class:highlight={hoveredItem &&
                                                                    hoveredItem.id === item.id}
                                                                class:skipped-item={isSkipped(
                                                                    cat,
                                                                    item,
                                                                )}
                                                                type="button"
                                                                on:click={() =>
                                                                    addOrRemoveItem(item.id)}
                                                            >
                                                                {item.name[$lang]}
                                                            </button>
                                                        </HoverItemOrPano>
                                                    </div>
                                                    <button
                                                        class="nav-to-item-button"
                                                        class:skipped-item={isSkipped(cat, item)}
                                                        on:click={() =>
                                                            scrollToItem(item, "selected-items")}
                                                        ><Eye size={20} /></button
                                                    >
                                                    <button
                                                        class="lock"
                                                        class:locked={$itemsLocked[cat][item.id]}
                                                        on:click={() => lockItem(item)}
                                                    >
                                                        {$itemsLocked[cat][item.id] ? "🔒" : "🔓"}
                                                    </button>
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
            <div class="total-combinations">
                {$words.totalCombinations}: {new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    compactDisplay: "short",
                }).format($totalPossibilities)}
                <br />
                {$words.estimatedTime}: {formatDuration($timeEstimated, $lang)}
                <br />
                [{Math.round($millionComboPerMin)}M / min]
            </div>
        </div>
    </div>
    <CalculateBuilds />
</div>

<style>
    #selection {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        font-family: system-ui, sans-serif;
        /* width: 100%; */
        /* max-width: 1200px; */
        /* margin: 0 auto; */
        /* scroll-margin-top: 50px; */
        /* margin-top: 1rem; */
        /* padding-top: 0.5rem; */
        /* background-color: #474747; */
    }
    .button-calculate-best-items {
        /* border-color: #e5b826; */
        font-size: 1.2rem;
    }
    table:not(.selected-items-table) tbody tr:nth-child(odd) {
        background-color: #222222;
    }
    table:not(.selected-items-table) tbody tr:nth-child(even) {
        background-color: #1e1e1e;
    }
    table:not(.selected-items-table) tbody tr:hover {
        background-color: #333;
    }
    .highlight {
        border-color: #646cff;
        background: #7e417b;
    }
    .modified {
        color: #f89f33;
    }
    .level-input {
        /* text */
        font-weight: 600;
        font-size: 1.1rem;
    }
    .controls {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        align-content: center;
    }

    .total-combinations {
        position: absolute;
        top: 100%;
        /* font-size: 1.1rem; */
        /* align-items: center;
        align-content: center; */
        margin-top: 0.6rem;
        text-align: center;
        width: 100%;
    }
    .lists {
        display: flex;
        gap: 2rem;
        /* height: 90vh; */
        height: calc(100vh - 248px);

        min-height: 500px;
        /* padding-top: 0.7rem; */
    }
    .list-container {
        /* height: 100%; */
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 35.5%;
        max-width: 35.5%;
        position: relative;
        /* max-height: 100%;
        min-height: 100%; */
    }
    .list-container:last-child {
        min-width: unset;
        max-width: unset;
    }
    .list-header {
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        justify-content: space-between;
        /* gap: 1rem; space if they’re side by side */
        margin-bottom: 10px;
    }
    .centered {
        justify-content: center;
    }
    .list-header h2 {
        margin-bottom: 0px;
        line-height: 1.1;
    }
    .selection-controls {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 4px;
    }
    .selection-controls > button {
        justify-content: space-between;
        padding-left: 0;
        padding-right: 0;
        width: 100%;
    }
    .list {
        /* flex: 1; */
        flex: 1 1 auto;
        border: 1px solid #555;
        border-radius: 8px;
        padding: 8px;
        /* background: #252226; */
        background: #29262d;
        /* background: #282629; */
        overflow-y: auto;
        overscroll-behavior-y: contain;
        /* min-width: 400px; */
        /* max-width: 400px; */
    }
    /* .list::-webkit-scrollbar {
        width: 4px;
        background: transparent;
    }
    .list::-webkit-scrollbar-track {
        margin-right: -50px;
    } */
    /* .list > * + * {
        margin-bottom: 1rem;
    } */
    .list-elem {
        margin-bottom: 2px;
        /* margin-bottom: 0px; */
    }
    .list-elem:has(.selected-item) {
        margin-bottom: 1px;
    }
    .end-list-elem {
        margin-top: 0.25rem;
        margin-bottom: 0.6rem;
    }
    .sticky {
        /* position: relative; */
        width: 100%;
        display: flex;
        position: sticky;
        align-items: center;
        justify-content: center;
        top: 0;
        background: #2a265e;

        box-shadow:
            0 1px 5px rgba(0, 0, 0, 0.2),
            0 2px 2px rgba(0, 0, 0, 0.14),
            0 3px 1px -2px rgba(0, 0, 0, 0.12);
        /* background: #412166; */
        margin: 0;
        /* padding: 0.25rem 0.5rem; */
        /* padding: 1rem 1rem; */
        /* padding-top: 1rem; */
        z-index: 1;
        border-radius: 4px;
        /* border-color: beige; */
        /* border-width: 3px; */
        /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); */
    }
    .toggle-collapse-icon {
        position: absolute;
        /* display: inline-block; */
        /* text-align: center; */
        top: 50%;
        transform: translateY(-50%);
        left: 0;
        padding: 0;
        background: unset;
        width: 2em;
        font-size: 1.3rem;
        height: 100%;
        font-weight: 700;
        border-radius: 4px;
        z-index: 5;
    }
    .sticky-title {
        font-weight: 600;
        font-size: 1.1rem;
        padding: 0.25rem 0.5rem;
        margin-inline: auto;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    table {
        table-layout: fixed;
        width: 100%;
        /* border-collapse: collapse; */
        border-spacing: 0px;
    }
    .skipped-item:not(.item-selected) {
        /* background-color: #694c4c; */
        color: #959595;
        opacity: 55%;
    }

    /* td:first-child  */
    th:first-child {
        width: 55%;
    }

    .item-buttons-container {
        display: inline-flex;
        width: 100%;
        align-items: stretch;
    }

    .item-button-wrapper {
        flex: 1;
    }
    .nav-to-item-button {
        width: 30px;
        flex-shrink: 0;
        padding: 0px;
        align-items: center;
        justify-content: center;
        line-height: 0;
        color: rgb(187, 187, 187);
        border-radius: 4px;
    }
    .lock {
        width: 44px;
        opacity: 40%;
        padding: 0px;
        border-radius: 4px;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        line-height: 0;
        /* display: block; */
        font-size: 1.281rem;
    }
    .locked {
        opacity: 100%;
    }
    .bonus-separator {
        margin: 8px 0;
        width: 100%;
    }
    .separator-row td {
        width: 100%;
        padding: 0;
    }
    .show-bonus-pano-capped-button {
        display: inline-flex;
    }
    /* th:first-child, */
    /* .separator-row td,
    .selected-item td:first-child {
        width: 84%;
    } */
    /* .selected-item td {
        position: relative;
    } */

    .pano-display-size {
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }
    .pano-score {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 4rem;
        margin-top: 0.2rem;
    }
    .arrows {
        display: flex;
        flex-direction: column;
    }

    .arrows button {
        /* background: #333; */
        color: #fff;
        border: none;
        border-radius: 4px;
        width: 1.2rem;
        height: 1.2rem;
        cursor: pointer;
        line-height: 1;
        font-size: 0.8rem;
        padding: 0;
    }

    .arrows button:hover {
        background: #4caf50;
    }
    .item-button {
        min-height: 30px;
    }

    /* .item-button:hover {
        background: #7e417b;
    } */

    /* .item-selected {
        background: #694c4c;
        color: #959595;
    } */

    .red {
        color: #b70a0a;
    }

    h2 {
        margin-top: 0;
    }
    .checkbox-label span {
        font-style: italic;
        margin-left: 5px;
    }
    /* 
    h3 {
        margin-bottom: 0.25rem;
        margin-top: 1rem;
    } */
</style>
