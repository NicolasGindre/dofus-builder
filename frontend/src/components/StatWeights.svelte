<script lang="ts">
    import { STAT_KEYS, type StatKey, type Stats } from "../types/stats";
    import { maxStats, minStats, weights } from "../stores/builder";
    import { get } from "svelte/store";
</script>

<table>
    <thead>
        <tr>
            <th>Stat</th>
            <th>Weight</th>
            <th>Min</th>
            <th>Max</th>
        </tr>
    </thead>
    <tbody>
        {#each STAT_KEYS as key}
            <tr>
                <td>{key}</td>
                <td>
                    <input
                        type="number"
                        bind:value={$weights[key]}
                        on:input={(e) =>
                            weights.update((w) => ({ ...w, [key]: +e.currentTarget.value }))}
                    />
                </td>
                <td>
                    <input
                        type="number"
                        bind:value={$minStats[key]}
                        on:input={(e) =>
                            minStats.update((w) => ({ ...w, [key]: +e.currentTarget.value }))}
                    />
                </td>
                <td>
                    <input
                        type="number"
                        bind:value={$maxStats[key]}
                        on:input={(e) =>
                            maxStats.update((w) => ({ ...w, [key]: +e.currentTarget.value }))}
                    />
                </td>
            </tr>
        {/each}
    </tbody>
</table>
