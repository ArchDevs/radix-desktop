<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { SendHorizontal } from "lucide-svelte";

    export let disabled: boolean = false;

    let text = "";
    const dispatch = createEventDispatcher();

    function handleSubmit() {
        if (!text.trim() || disabled) return;
        dispatch("send", text.trim());
        text = "";
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }
</script>

<div
    class="px-4 py-3 border-t border-white/[0.04] bg-[#0a0a0b]/80 backdrop-blur-xl max-h-[200px]"
>
    <div
        class="relative flex items-end overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.05] focus-within:border-white/[0.1] transition-colors duration-200"
    >
        <textarea
            bind:value={text}
            on:keydown={handleKeydown}
            placeholder={disabled ? "Select a chat..." : "Write a message..."}
            class="w-full max-h-28 min-h-[44px] bg-transparent resize-none outline-none py-3 pl-4 pr-12 text-[13.5px] text-white/80 placeholder:text-white/15 scrollbar-hide"
            {disabled}
            rows="1"
        ></textarea>

        <button
            on:click={handleSubmit}
            disabled={!text.trim() || disabled}
            class="absolute right-2 bottom-2 p-2 rounded-lg transition-all duration-200
        {text.trim() && !disabled
                ? 'bg-white/[0.08] text-white/60 hover:bg-white/[0.12] hover:text-white/80'
                : 'text-white/10 cursor-default'}"
        >
            <SendHorizontal class="w-4 h-4" />
        </button>
    </div>
</div>

<style>
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
