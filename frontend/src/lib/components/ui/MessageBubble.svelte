<script lang="ts">
    import { cn } from "$lib/utils";
    import { Motion } from "svelte-motion";

    export let content: string;
    export let isOutgoing: boolean;
    export let timestamp: number;

    function formatTime(ts: number) {
        return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
        }).format(new Date(ts));
    }
</script>

<div
    class={cn(
        "flex w-full mb-4 px-4",
        isOutgoing ? "justify-end" : "justify-start",
    )}
>
    <Motion
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        let:motion
    >
        <div
            use:motion
            class={cn(
                "max-w-[70%] rounded-2xl px-4 py-2 relative group",
                isOutgoing
                    ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-sm shadow-md shadow-blue-900/20"
                    : "bg-secondary text-secondary-foreground rounded-bl-sm border border-border/50",
            )}
        >
            <p class="text-sm leading-relaxed">{content}</p>
            <span
                class={cn(
                    "text-[10px] absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
                    isOutgoing
                        ? "right-1 text-blue-400"
                        : "left-1 text-muted-foreground",
                )}
            >
                {formatTime(timestamp)}
            </span>
        </div>
    </Motion>
</div>
