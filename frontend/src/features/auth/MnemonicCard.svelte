<script lang="ts">
    import { Copy, Check, Key } from "lucide-svelte";
    import { slide } from "svelte/transition";

    export let mnemonic: string;

    let isCopied = false;

    function copyMnemonic() {
        navigator.clipboard.writeText(mnemonic);
        isCopied = true;
        setTimeout(() => {
            isCopied = false;
        }, 2000);
    }
</script>

<div
    transition:slide
    class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden"
>
    <div
        class="absolute top-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-200 left-0"
    ></div>

    <div class="flex items-start gap-3">
        <Key class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
            <h3 class="font-medium text-zinc-200">Recovery Phrase</h3>
            <p class="text-xs text-zinc-500 mt-1">
                This is your ONLY backup. Store it offline. We cannot recover
                it.
            </p>
        </div>
    </div>

    <div
        class="bg-black/80 p-4 rounded-xl border border-zinc-800/50 relative group"
    >
        <p
            class="font-mono text-sm leading-relaxed text-amber-100/90 select-all selection:bg-amber-500/30 pr-10"
        >
            {mnemonic}
        </p>
        <button
            class="absolute right-2 top-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-amber-500/80 hover:text-amber-400"
            on:click={copyMnemonic}
            title="Copy to clipboard"
        >
            {#if isCopied}
                <Check class="w-4 h-4 text-emerald-500" />
            {:else}
                <Copy class="w-4 h-4" />
            {/if}
        </button>
    </div>
</div>
