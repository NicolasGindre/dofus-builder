<script lang="ts">
    import { portal } from "svelte-portal";

    import type { Item, Panoply } from "../types/item";
    // import type { Stats } from "../types/stats";
    import ShowStats from "./ShowStats.svelte";
    import { diffStats } from "../types/stats";
    import { minStats, words } from "../stores/builder";
    import { translateRequirement } from "../logic/language";
    import { tick } from "svelte";
    import { isPanoMinRequirementOK } from "../logic/item";
    import { checkOrRequirement } from "../logic/build";

    // export let itemOrPano: { item: Item, pano: Panoply };
    export let item: Item | null = null;
    export let panoply: Panoply | null = null;
    export let panoplyItemCount: number | null = null;
    // export let statsKeys: readonly StatKey[];

    let hovered = false;
    let trigger: HTMLElement | null = null;
    let tooltip: HTMLElement | null = null;
    let coords = { top: 0, left: 0 };
    let scrolling = false;
    let scrollTimer: number | null = null;

    function handleWheel(e: WheelEvent) {
        if (!tooltip) return;

        const { scrollTop, scrollHeight, clientHeight } = tooltip;
        const atTop = scrollTop === 0;
        const atBottom = scrollTop + clientHeight >= scrollHeight;

        // Detect whether tooltip can scroll
        const canScrollUp = e.deltaY < 0 && !atTop;
        const canScrollDown = e.deltaY > 0 && !atBottom;
        const canScroll = canScrollUp || canScrollDown;

        if (canScroll || scrolling) {
            e.preventDefault();
            e.stopPropagation();
            tooltip.scrollTop += e.deltaY;
            scrolling = true;
        }

        // reset the gesture flag shortly after scrolling stops
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(() => (scrolling = false), 100);
    }

    async function show() {
        hovered = true;
        await tick();
        const rect = trigger.getBoundingClientRect();

        const tooltipRect = tooltip?.getBoundingClientRect();
        const tooltipHeight = tooltipRect.height;
        const tooltipWidth = tooltipRect.width;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        if (!tooltipHeight || !tooltipWidth) {
            return await show();
        }
        const top =
            rect.top > viewportHeight * 0.6 ? rect.top - tooltipHeight - 2 : rect.bottom + 2;

        let left = rect.left;
        // console.log("check view Width", viewportWidth, left);
        // console.log("tooltipWidth", tooltipWidth);
        if (left + tooltipWidth > viewportWidth - 10) {
            left = viewportWidth - tooltipWidth - 10;
        }
        if (left < 10) left = 10;

        coords.top = top;
        coords.left = left;
    }
</script>

<div
    class="hover-stats-wrapper"
    role="group"
    bind:this={trigger}
    on:mouseenter={show}
    on:mouseleave={() => (hovered = false)}
    on:wheel={handleWheel}
>
    <!-- anything can be slotted here -->
    <slot />

    {#if hovered}
        <div
            bind:this={tooltip}
            class="hover-stats-tooltip"
            use:portal={document.body}
            style="top:{coords.top}px; left:{coords.left}px;"
        >
            {#if item}
                <div class="item-title">
                    <strong>{$words.subCategory[item.subCategory]}</strong>
                    <strong>{$words.level} {item.level}</strong>
                </div>
                {#if item.requirements}
                    <div class="requirements">
                        {#each item.requirements as orRequirements}
                            <!-- <div> -->
                            <div
                                class="requirement {checkOrRequirement(orRequirements, $minStats)}"
                            >
                                {#each orRequirements as requirement, i}
                                    <span>{translateRequirement(requirement)}</span>
                                    {#if i < orRequirements.length - 1}
                                        {" "}<em>{$words.or}</em>{" "}
                                    {/if}
                                {/each}
                                <br />
                            </div>
                        {/each}
                    </div>
                {/if}
                {#if item.weaponEffect}
                    <div class="weapon-effects">
                        <span>{$words.cost}: {item.weaponEffect.cost} {$words.stats.ap}</span>
                        <br />
                        <span>{$words.criticalChance}: {item.weaponEffect.critChance} %</span>
                        <br />
                        {#each item.weaponEffect.effects as effect}
                            <span>{effect.min}</span>
                            {#if effect.max}<span>{$words.to} {effect.max}</span>{/if}
                            {#if effect.minCrit}
                                <span>[{effect.minCrit}</span>{#if effect.maxCrit}<span
                                        >&nbsp{$words.to} {effect.maxCrit}</span
                                    >{/if}]{/if}
                            <span
                                >{effect.element != "mpReduce" && effect.element != "apReduce"
                                    ? $words.spellType[effect.type]
                                    : ""}
                                {$words.element[effect.element]}</span
                            >
                            <br />
                        {/each}
                    </div>
                {/if}
                <ShowStats stats={item.stats} />

                {#if item.specialEffect}
                    <div class="spell-effects">
                        <!-- <span>{item.specialEffect.name.fr}</span> -->
                        <span>{item.specialEffect.description.fr}</span>
                    </div>
                {/if}
            {/if}
            {#if panoply && !panoplyItemCount}
                {#each panoply.stats as stats, i}
                    {#if Object.keys(stats).length > 0}
                        <div class="combo-header">
                            <strong class="combo-title">{i + 1} {$words.items}</strong>
                            <strong class="combo-value"
                                >{$words.value} : {#if isPanoMinRequirementOK(panoply, i + 1)}{panoply
                                        .value[i] -
                                        panoply.value[i - 1] >=
                                    0
                                        ? "+"
                                        : ""}{Math.round(
                                        panoply.value[i] - panoply.value[i - 1],
                                    )}{:else}+0{/if}
                            </strong>
                        </div>
                        {#if panoply.requirements}
                            {#each panoply.requirements[i] as orRequirements}
                                <div
                                    class="requirement {checkOrRequirement(
                                        orRequirements,
                                        $minStats,
                                    )}"
                                >
                                    {#each orRequirements as requirement, i}
                                        <strong>{translateRequirement(requirement)}</strong>
                                        {#if i < orRequirements.length - 1}
                                            {" "}<strong><em>{$words.or}</em></strong>{" "}
                                        {/if}
                                    {/each}
                                    <br />
                                </div>
                            {/each}
                        {/if}
                        <ShowStats stats={diffStats(stats, panoply.stats[i - 1])} />
                    {/if}
                {/each}
            {/if}
            {#if panoply && panoplyItemCount}
                <div class="combo-header">
                    <strong class="combo-title">{panoplyItemCount} {$words.items}</strong>
                    <strong class="combo-value"
                        >{$words.value} : {Math.round(panoply.value[panoplyItemCount - 1])}
                    </strong>
                </div>
                {#if panoply.requirements}
                    {#each panoply.requirements[panoplyItemCount - 1] as orRequirement}
                        <div>
                            {#each orRequirement as requirement, i}
                                <strong>{translateRequirement(requirement)}</strong>
                                {#if i < orRequirement.length - 1}
                                    {" "}<strong><em>{$words.or}</em></strong>{" "}
                                {/if}
                            {/each}
                            <br />
                        </div>
                    {/each}
                {/if}
                <ShowStats stats={panoply.stats[panoplyItemCount - 1]}></ShowStats>
            {/if}
        </div>
    {/if}
</div>

<style>
    .spell-effects {
        max-width: 450px;
        /* min-width: 450px; */
        /* position: absolute;
        inset: 0; */
        opacity: 75%;
    }
    .combo-header,
    .weapon-effects,
    .requirements,
    .item-title {
        border-bottom: 1px solid #cccccca9;
        padding-bottom: 0.3rem;
    }
    .weapon-effects,
    .requirements {
        padding-top: 0.2rem;
    }
    .requirement {
        width: fit-content;
        height: fit-content;
    }
    .requirement.invalid {
        background-color: #8c0000;
    }
    .item-title {
        display: flex;
    }
    .item-title strong:first-child {
        margin-right: 1rem;
    }
    .item-title strong:last-child {
        margin-left: auto;
    }
    .hover-stats-tooltip {
        position: fixed;
        background: #1a1a1a;
        color: white;
        padding: 0.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        z-index: 10;
        max-height: calc(35vh - 5px);
        /* max-height: 90vh; */
        overflow-y: auto;
    }
    .combo-header {
        display: flex;
        justify-content: space-between; /* left & right alignment */
        align-items: center;
        /* border-bottom: 1px solid currentColor; */
        /* padding-bottom: 0.25rem; */
        /* margin-bottom: 0.5rem; */
    }
    .combo-title {
        display: block;
        /* font-weight: 800; */
        /* text-decoration: underline; */
        /* margin-top: 0.5rem;
        margin-bottom: 0.25rem; */
        color: #fff;
    }
    .combo-value {
        margin-left: 1.5rem;
    }
</style>
