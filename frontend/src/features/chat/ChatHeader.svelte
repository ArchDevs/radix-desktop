<script lang="ts">
    import { Lock } from "lucide-svelte";
    import { connectionState } from "$core/network/ws";
    import type { ConnectionState } from "$core/network/types";

    export let activeId: string | null = null;

    function formatId(id: string): string {
        if (!id) return "";
        if (id.length > 20) return `${id.slice(0, 12)}···${id.slice(-6)}`;
        return id;
    }

    function avatarInitials(id: string): string {
        if (!id || id.length < 6) return "??";
        return id.slice(4, 6).toUpperCase();
    }

    function connectionDot(state: ConnectionState): string {
        switch (state) {
            case "connected":
                return "bg-emerald-500";
            case "connecting":
            case "reconnecting":
                return "bg-amber-500 animate-pulse";
            default:
                return "bg-zinc-600";
        }
    }

    function connectionLabel(state: ConnectionState): string {
        switch (state) {
            case "connected":
                return "E2EE Secured";
            case "connecting":
                return "Connecting...";
            case "reconnecting":
                return "Reconnecting...";
            case "disconnected":
            case "failed":
                return "Disconnected";
            default:
                return "";
        }
    }
</script>

<div
    class="h-14 flex items-center justify-between px-5 border-b border-white/[0.04] bg-[#0a0a0b]/90 backdrop-blur-md flex-shrink-0"
>
    {#if activeId}
        <div class="flex items-center gap-3">
            <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold bg-white/[0.06] text-white/40 border border-white/[0.06]"
            >
                {avatarInitials(activeId)}
            </div>
            <div>
                <h2 class="text-sm font-medium text-white/80 tracking-tight">
                    {formatId(activeId)}
                </h2>
                <div class="flex items-center gap-1.5 mt-0.5">
                    <span
                        class="w-1.5 h-1.5 rounded-full {connectionDot(
                            $connectionState,
                        )}"
                    ></span>
                    <span class="text-[10px] text-white/30 font-mono"
                        >{connectionLabel($connectionState)}</span
                    >
                </div>
            </div>
        </div>
        <div class="flex items-center gap-1.5 text-white/15">
            <Lock class="w-3 h-3" />
            <span class="text-[10px] font-mono">encrypted</span>
        </div>
    {:else}
        <h2 class="text-sm font-medium text-white/20 tracking-tight">
            Select a conversation
        </h2>
        <div></div>
    {/if}
</div>
