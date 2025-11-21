<script lang="ts">
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { Sword, Shirt, Dna } from "lucide-svelte";

    const checkpoints = ["weights", "selection", "builds"];
    const activeCheckpoint = writable("weights");

    function scrollToSection(sectionId: string) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    }

    onMount(() => {
        const sections = checkpoints.map((id) => document.getElementById(id));

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        activeCheckpoint.set(entry.target.id);
                    }
                }
            },
            {
                // rootMargin: "20% 0px 5% 0px",
                rootMargin: "0px",
                threshold: 0.6,
            },
        );

        sections.forEach((s) => s && observer.observe(s));

        return () => observer.disconnect();
    });
</script>

<nav class="sidebar">
    <button
        class="nav-item"
        class:active={$activeCheckpoint === "weights"}
        on:click={() => scrollToSection("weights")}
    >
        <Dna size={24} />
    </button>
    <button
        class="nav-item"
        class:active={$activeCheckpoint === "selection"}
        on:click={() => scrollToSection("selection")}
    >
        <Sword size={24} />
    </button>
    <button
        class="nav-item"
        class:active={$activeCheckpoint === "builds"}
        on:click={() => scrollToSection("builds")}
    >
        <Shirt size={24} />
    </button>
</nav>

<style>
    /* .page-layout {
        display: flex;
    } */

    .sidebar {
        /* background-color: #d0d0d036; */
        z-index: 10000;
        position: fixed;
        top: 221px;
        transform: translateY(-30%);
        left: max(0px, calc((50% - 1250px / 2) - 5rem));

        /* left: 0; */

        width: 3.5rem;
        /* gap: 1rem; */

        display: flex;
        flex-direction: column;
        pointer-events: none;
    }

    .nav-item {
        height: 3.5rem;
        width: 46px;
        /* margin-left: auto; */

        border-radius: 1px;
        opacity: 20%;
        background: rgb(0, 0, 0);
        transition: all 0.2s ease;

        cursor: pointer;
        pointer-events: auto;
        /* padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s;
        text-transform: capitalize; */
        padding-left: 10px;
    }

    .nav-item:hover {
        opacity: 100% !important;
        /* background: #863f3f; */
        padding-left: 15px;
    }

    .nav-item.active {
        /* margin: 0px; */
        opacity: 80%;
        width: 100%;
        padding-left: 16px;
        /* padding-left: 1.2em; */
        /* background: rgba(0, 0, 0, 0.8); */
        /* transform: translateX(6px); */
        /* background: #0070f3;
        color: white;
        font-weight: 600; */
    }

    /* .content {
        flex: 1;
        padding: 2rem;
        scroll-behavior: smooth;
    }

    .checkpoint {
        min-height: 100vh;
        border-bottom: 1px solid #ddd;
        padding-top: 4rem;
    } */
</style>
