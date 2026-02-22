<script lang="ts">
    import { Check, CheckCheck } from "lucide-svelte";

    export let content: string;
    export let isOutgoing: boolean;
    export let timestamp: Date;
    export let delivered: boolean = false;
    export let read: boolean = false;

    function formatTime(d: Date): string {
        if (!d || !(d instanceof Date) || isNaN(d.getTime())) {
            return '';
        }
        return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
        }).format(d);
    }
</script>

<div
    class="flex w-full px-5 py-0.5 {isOutgoing
        ? 'justify-end'
        : 'justify-start'} group"
>
    <div
        class="relative max-w-[65%] rounded-2xl px-4 py-2.5 msg-bubble shadow-sm
      {isOutgoing
            ? 'bg-white/[0.08] text-white/90 rounded-br-md border border-white/[0.02] backdrop-blur-sm'
            : 'bg-[#18181b] text-white/80 rounded-bl-md border border-white/[0.05] shadow-[0_2px_10px_rgba(0,0,0,0.1)]'}"
    >
        <p
            class="text-[14px] leading-[1.5] whitespace-pre-wrap break-words tracking-tight"
        >
            {content}
        </p>

        <div
            class="flex items-center gap-1.5 {isOutgoing
                ? 'justify-end'
                : 'justify-start'} mt-1"
        >
            <span
                class="text-[10px] {isOutgoing
                    ? 'text-white/30'
                    : 'text-white/20'} font-mono tabular-nums leading-none"
            >
                {formatTime(timestamp)}
            </span>

            <!-- Delivery Status for outgoing messages -->
            {#if isOutgoing}
                <span class="flex items-center self-end h-3 -mr-1">
                    {#if read}
                        <CheckCheck class="w-3.5 h-3.5 text-emerald-400" />
                    {:else if delivered}
                        <CheckCheck class="w-3.5 h-3.5 text-white/30" />
                    {:else}
                        <Check class="w-3.5 h-3.5 text-white/20" />
                    {/if}
                </span>
            {/if}
        </div>
    </div>
</div>

<style>
    .msg-bubble {
        animation: msgIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes msgIn {
        from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
</style>
