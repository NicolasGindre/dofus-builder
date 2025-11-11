<script lang="ts">
    const modules = import.meta.glob("../icons/*.png", { eager: true }) as Record<
        string,
        { default: string }
    >;

    const icons = Object.fromEntries(
        Object.entries(modules).map(([path, mod]) => [
            path.split("/").pop()?.replace(".png", "") ?? "",
            mod.default,
        ]),
    );

    export let name: string;
    export let size: number = 20;
</script>

{#if icons[name]}
    <img class="icon" src={icons[name]} alt={name} width={size} height={size} loading="lazy" />
{:else}
    <span>❓</span>
{/if}

<style>
    .icon {
        vertical-align: middle; /* or baseline if you prefer tighter alignment */
        position: relative;
        top: -2px;
    }
</style>
