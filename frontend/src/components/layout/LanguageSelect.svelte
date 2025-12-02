<script lang="ts">
    import { lang } from "../../stores/storeBuilder";
    import { calculateBuildToDisplay } from "../../logic/display";
    import type { CountryCode } from "../../types/language";

    type LangOption = {
        value: CountryCode;
        label: string;
        flag: string;
    };

    const options: LangOption[] = [
        { value: "en", label: "English", flag: "https://flagcdn.com/gb.svg" },
        { value: "fr", label: "Français", flag: "https://flagcdn.com/fr.svg" },
        { value: "pt", label: "Português", flag: "https://flagcdn.com/pt.svg" },
        { value: "de", label: "Deutsch", flag: "https://flagcdn.com/de.svg" },
        { value: "es", label: "Español", flag: "https://flagcdn.com/es.svg" },
    ];

    let open = false;
    let selected = options.find((o) => o.value === $lang) ?? options[0];

    function toggle() {
        open = !open;
    }

    function choose(opt: LangOption) {
        selected = opt;
        open = false;
        lang.set(opt.value);
        localStorage.setItem("lang", opt.value);
        calculateBuildToDisplay();
    }

    let root: HTMLDivElement;
    function handleClickOutside(e: MouseEvent) {
        if (root && !root.contains(e.target as Node)) {
            open = false;
        }
    }

    // Attach global listener
    if (typeof window !== "undefined") {
        window.addEventListener("click", handleClickOutside);
    }
</script>

<div bind:this={root} class="lang-select">
    <!-- Selected item -->
    <button class="selected" on:click={toggle} aria-haspopup="listbox" aria-expanded={open}>
        <img src={selected.flag} alt={selected.label} />
        <span>{selected.label}</span>
    </button>

    <!-- Dropdown -->
    {#if open}
        <ul class="dropdown" role="listbox">
            {#each options as opt}
                <li>
                    <button
                        on:click={() => choose(opt)}
                        class:selected={opt.value === selected.value}
                    >
                        <img src={opt.flag} alt={opt.label} />
                        <span>{opt.label}</span>
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .lang-select {
        position: relative;
        width: 160px;
        height: 100%;
    }

    .selected {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 100%;
        background: unset;
        /* padding: 6px 10px; */
        /* border: 1px solid #ccc; */
        border-radius: 6px;
        cursor: pointer;
    }

    /* .selected img {
        width: 20px;
        height: 15px;
        margin-right: 8px;
    } */
    img {
        width: 36px;
        height: 27px;
        margin-right: 10px;
    }

    .selected span {
        flex: 1;
        text-align: left;
    }

    .dropdown {
        position: absolute;
        top: 100%;
        width: 100%;
        /* background: white; */
        /* border: 1px solid #ccc; */
        border-radius: 6px;
        margin: 0px;
        padding: 0px;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
        /* z-index: 20; */
        overflow: hidden;
    }

    .dropdown li {
        list-style: none;
    }
    .dropdown button {
        width: 100%;
        display: flex;
        align-items: center;
        padding: 6px 10px;
        cursor: pointer;
        border-radius: unset;
        background: rgb(51, 51, 51);
    }

    /* .dropdown button:hover {
        background: #f0f0f0;
    } */

    .dropdown button.selected {
        background: rgb(80, 124, 109);
        font-weight: 600;
    }
</style>
