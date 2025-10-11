declare module "lucide-svelte/icons/*" {
    import type { SvelteComponentTyped } from "svelte";
    const component: new (...args: any[]) => SvelteComponentTyped<{
        size?: string | number;
        color?: string;
        strokeWidth?: string | number;
        class?: string;
    }>;
    export default component;
}
declare module "*.svelte" {
    import type { SvelteComponent } from "svelte";
    export default class Component extends SvelteComponent {}
}
