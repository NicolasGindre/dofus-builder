<script lang="ts">
    import { lang, showTutorial } from "../../stores/storeBuilder";
    import { marked } from "marked";
    import tutorialEn from "../../static/tutorial/tutorial.en.md";
    import tutorialFr from "../../static/tutorial/tutorial.fr.md";
    import tutorialEs from "../../static/tutorial/tutorial.es.md";
    import tutorialPt from "../../static/tutorial/tutorial.pt.md";
    import tutorialDe from "../../static/tutorial/tutorial.de.md";

    export const tutorials = {
        en: tutorialEn,
        fr: tutorialFr,
        es: tutorialEs,
        pt: tutorialPt,
        de: tutorialDe,
    };
    // console.log("Tutorials:", tutorials);

    let content = "";

    $: loadTutorial($lang);

    async function loadTutorial(lang: string) {
        // const res = await fetch(`/tutorial/tutorial.${lang}.md`);
        const res = await fetch(tutorials[lang]);
        content = await res.text();
    }
    function closeTutorial() {
        showTutorial.set(false);
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="tutorial" on:click={closeTutorial} class:hidden={!$showTutorial}>
    <div class="tutorial-content" on:click|stopPropagation>
        {@html marked.parse(content)}
    </div>
</div>

<style>
    .hidden {
        visibility: hidden;
    }
    .tutorial-content {
        max-width: 800px;
        min-height: 100%;
        margin-left: auto;
        margin-right: auto;
        background-color: #1d1d1d;
        padding: 1rem 2rem;
        /* margin-top: 1rem; */
        line-height: 1.6;
        text-align: left;
        border: 1px solid rgb(88, 88, 88);
    }
    .tutorial {
        position: fixed;
        top: 50px;
        left: 0;
        right: 0;
        bottom: 0;

        /* width: 100%; */
        /* height: calc(100vh - 50px); */

        overflow-y: auto;
        overscroll-behavior-y: contain;

        z-index: 100000;

        margin: 0;
        /* margin-left: auto;
        margin-right: auto; */
        background-color: #1d1d1db6;
    }
</style>
