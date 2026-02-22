<script lang="ts">
    export let variant: "primary" | "secondary" | "danger" = "primary";
    export let disabled = false;
    export let onClick: () => void = () => {};

    $: backdropClass =
        variant === "primary"
            ? "bg-blue-950 group-hover:bg-blue-900"
            : variant === "danger"
              ? "bg-red-950 group-hover:bg-red-900"
              : "bg-neutral-950 group-hover:bg-neutral-900";

    $: textClass =
        variant === "primary"
            ? "text-blue-100"
            : variant === "danger"
              ? "text-red-100"
              : "text-neutral-400";
</script>

<button
    class="group relative grid overflow-hidden rounded-xl px-4 py-2 shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
    on:click={onClick}
    {disabled}
>
    <span>
        <span
            class="spark mask-gradient animate-flip before:animate-kitrotate absolute inset-0 h-[100%] w-[100%] overflow-hidden rounded-xl [mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]"
        />
    </span>
    <span
        class="backdrop absolute inset-px rounded-[11px] transition-colors duration-200 {backdropClass}"
    />
    <span class="z-10 text-sm font-medium transition-colors {textClass}">
        <slot>Button</slot>
    </span>
</button>
