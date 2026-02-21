<script lang="ts">
    import { Motion } from "svelte-motion";
    import { inview } from "svelte-inview";
    import { cn } from "$lib/utils";
    import { onMount } from "svelte";

    export let duration = 0.8;
    export let delay = 0;
    export let yOffset = 20;
    export let inViewMargin = "0px";
    export let blur = "8px";
    export let once = true;

    let defaultVariants = {
        hidden: { opacity: 0, y: yOffset, filter: `blur(${blur})` },
        visible: { opacity: 1, y: 0, filter: `blur(0px)` },
    };
    let isInView = "hidden";

    let className = "";
    export { className as class };

    onMount(() => {
        // Fallback for container sizing issues in webkit/wails causing inview to fail
        setTimeout(() => {
            if (isInView === "hidden") {
                isInView = "visible";
            }
        }, 100);
    });

    function handleChange({ detail }) {
        if (detail.inView) {
            isInView = "visible";
        } else if (!once) {
            isInView = "hidden";
        }
    }
</script>

<Motion
    initial="hidden"
    animate={isInView}
    variants={defaultVariants}
    transition={{
        delay: delay,
        duration,
        ease: "easeOut",
    }}
    let:motion
>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        use:inview={{ rootMargin: inViewMargin, unobserveOnEnter: once }}
        use:motion
        on:inview_change={handleChange}
        on:inview_enter={handleChange}
        class={cn("inline-block", className)}
    >
        <slot>Default</slot>
    </div>
</Motion>
