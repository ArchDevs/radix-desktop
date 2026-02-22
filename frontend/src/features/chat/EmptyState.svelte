<script lang="ts">
    import { Shield } from "lucide-svelte";
</script>

<div
    class="flex flex-col items-center justify-center h-full w-full select-none gap-6 px-8 bg-[#0c0c0e]"
>
    <div class="flex flex-col items-center gap-4">
        <div
            class="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center shadow-lg"
        >
            <span class="text-2xl font-bold tracking-tighter text-white/20"
                >R</span
            >
        </div>
        <div class="text-center space-y-2">
            <h3 class="text-lg font-medium text-white/30 tracking-tight">
                Radix Messenger
            </h3>
            <p class="text-sm text-white/15 max-w-xs leading-relaxed">
                Select a conversation or start a new one to begin messaging
                securely.
            </p>
        </div>
    </div>
    <div class="flex items-center gap-2 text-xs text-white/10 font-mono">
        <Shield class="w-3 h-3" />
        <span>End-to-End Encrypted</span>
    </div>
</div>
