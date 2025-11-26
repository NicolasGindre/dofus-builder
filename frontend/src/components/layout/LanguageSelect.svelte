<script lang="ts">
    import { lang } from "../../stores/storeBuilder";
    import type { CountryCode } from "../../types/language";
    import { calculateBuildToDisplay } from "../../logic/display";

    type LangOption = {
        countryCode: CountryCode;
        label: string;
        flag: string;
    };

    const options: LangOption[] = [
        { countryCode: "en", label: "English", flag: "🇬🇧" },
        { countryCode: "fr", label: "Français", flag: "🇫🇷" },
        { countryCode: "pt", label: "Português", flag: "🇵🇹" },
        { countryCode: "de", label: "Deutsch", flag: "🇩🇪" },
        { countryCode: "es", label: "Español", flag: "🇪🇸" },
    ];

    const langStorage = localStorage.getItem("lang");
    if (langStorage) {
        lang.set(langStorage);
    } else {
        const browserLang = navigator.language.split("-")[0];
        lang.set(browserLang || "en");
    }

    function handleChange(event: Event) {
        const countryCode = (event.target as HTMLSelectElement).value;
        lang.set(countryCode);
        localStorage.setItem("lang", countryCode);
        calculateBuildToDisplay(); // Requirement not translated on change for some reason
    }
</script>

<div class="lang-dropdown">
    <select bind:value={$lang} on:change={handleChange}>
        {#each options as opt}
            <option value={opt.countryCode}>
                {opt.flag}
                {opt.label}
            </option>
        {/each}
    </select>
</div>

<style>
    .lang-dropdown {
        /* position: absolute;
        display: inline-block;
        top: 0;
        right: 0; */
        align-items: center;
        /* height: 100%; */
    }

    select {
        appearance: none;
        /* background: #1e1e1e; */
        background: unset;
        /* color: white; */
        border: 1px solid transparent;
        border-radius: 0.5rem;
        padding: 0.4rem 0.8rem 0.4rem 0.8rem;
        font-size: 1.2rem;
        cursor: pointer;
        height: 100%;
        /* transition: background 0.2s ease; */
    }

    select:hover {
        /* background: #1e1e1e; */
        border-color: #4c8bf5;
    }

    /* select:focus {
        outline: none;
    } */

    /* Custom dropdown arrow */
    /* .lang-dropdown::after {
        content: "▾";
        right: 0.6rem;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: #aaa;
        font-size: 0.8rem;
    } */
</style>
