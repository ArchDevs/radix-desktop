<script lang="ts">
    import { cn } from "$lib/utils";
    import { Motion } from "svelte-motion";

    let className: any = "";
    export { className as class };

    // Calculate the amount of columns and rows based on standard screen sizes.
    // 30 columns and 20 rows are usually enough to fill a standard half-screen view.
    export let r = 24;
    export let c = 24;

    let rows = new Array(r).fill(1);
    let cols = new Array(c).fill(1);
</script>

<div
    class={cn(
        "absolute inset-0 z-0 flex w-full h-full justify-center overflow-hidden pointer-events-none",
        className,
    )}
>
    {#each cols as _, i}
        <Motion let:motion>
            <div class="pointer-events-auto" use:motion>
                {#each rows as _, j}
                    <Motion
                        whileHover={{
                            backgroundColor: `rgba(255, 255, 255, 0.05)`,
                            transition: { duration: 0 },
                        }}
                        animate={{
                            transition: { duration: 2 },
                        }}
                        let:motion
                    >
                        <div
                            class={cn(
                                "w-12 h-12 border-r border-t border-white/5 relative",
                                i === 0 && "border-l",
                                j === rows.length - 1 && "border-b",
                            )}
                            use:motion
                        ></div>
                    </Motion>
                {/each}
            </div>
        </Motion>
    {/each}
</div>
