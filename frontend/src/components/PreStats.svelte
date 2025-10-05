<script lang="ts">
    import { level, exoAp, exoMp, exoRange, preStats } from "../stores/builder";

    // auto-subscribe with $ syntax
</script>

<div class="stats">
    <h2>
        Level:
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
    </h2>

    <div class="stat">
        <label>
            AP: {$preStats.ap} - Exo
            <input type="checkbox" bind:checked={$exoAp} />
        </label>
    </div>

    <div class="stat">
        <label>
            MP: {$preStats.mp} - Exo
            <input type="checkbox" bind:checked={$exoMp} />
        </label>
    </div>

    <div class="stat">
        <label>
            Range: {$preStats.range} - Exo
            <input type="checkbox" bind:checked={$exoRange} />
        </label>
    </div>

    <div class="stat">
        Health: {$preStats.health}
    </div>

    <div class="stat">
        Pods: {$preStats.pods}
    </div>
</div>
