<script lang="ts">
    import { portal } from "svelte-portal";

    import type { Item, Panoply } from "../types/item";
    // import type { Stats } from "../types/stats";
    import ShowStats from "./ShowStats.svelte";
    import { diffStats } from "../types/stats";
    import { words } from "../stores/builder";
    import { translateRequirement } from "../logic/language";

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

    // function handleWheel(e: WheelEvent) {
    //     if (!tooltip) return;

    //     const { scrollTop, scrollHeight, clientHeight } = tooltip;
    //     const atTop = scrollTop === 0;
    //     const atBottom = scrollTop + clientHeight >= scrollHeight;

    //     // Only intercept scrolling if tooltip can still scroll
    //     if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
    //         e.preventDefault();
    //         e.stopPropagation();
    //         tooltip.scrollTop += e.deltaY;
    //     }
    // }

    function show() {
        hovered = true;
        const rect = trigger?.getBoundingClientRect();
        // console.log(rect);
        if (rect) {
            coords.top = rect.bottom + 4; // just below the trigger
            coords.left = rect.left;
        }
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
                {#if item.requirement}
                    <strong>{translateRequirement(item.requirement)}</strong>
                {/if}
                <ShowStats stats={item.stats} />
            {/if}
            {#if panoply && !panoplyItemCount}
                {#each panoply.stats as stats, i}
                    {#if Object.keys(stats).length > 0}
                        <div class="combo-header">
                            <strong class="combo-title">{i + 1} {$words.items}</strong>
                            <strong class="combo-value"
                                >{$words.value} : +{Math.round(
                                    panoply.value[i] - panoply.value[i - 1],
                                )}
                            </strong>
                        </div>
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
                <ShowStats stats={panoply.stats[panoplyItemCount - 1]}></ShowStats>
            {/if}
        </div>
    {/if}
</div>

<style>
    .hover-stats-wrapper {
        position: relative;
        /* display: inline-block; */
        /* position: static;
        overflow: visible; */
    }

    .hover-stats-tooltip {
        position: fixed;
        background: #1a1a1a;
        color: white;
        padding: 0.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        z-index: 10;
        max-height: 450px;
        /* max-height: 90vh; */
        overflow-y: auto;
    }
    .combo-header {
        display: flex;
        justify-content: space-between; /* left & right alignment */
        align-items: center;
        border-bottom: 1px solid currentColor; /* underline across the block */
        padding-bottom: 0.25rem;
        margin-bottom: 0.5rem;
    }
    .combo-title {
        display: block;
        /* font-weight: 800; */
        /* text-decoration: underline; */
        margin-top: 0.5rem;
        margin-bottom: 0.25rem;
        color: #fff;
    }
</style>
