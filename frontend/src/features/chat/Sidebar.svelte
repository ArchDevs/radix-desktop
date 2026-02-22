<script lang="ts">
    import { Search } from "lucide-svelte";
    import SearchPanel from "$features/search/SearchPanel.svelte";
    import DockMenu from "./DockMenu.svelte";
    import type { UserResponse } from "$features/identity/types";

    export let activeId: string | null = null;
    export let peers: string[] = [];
    export let onSelect: (id: string) => void;
    export let onLogout: () => void;

    function formatId(id: string): string {
        if (!id) return "Unknown";
        // For now, identity profile mapping for peers isn't fully cached, so we use the formatted ID
        if (id.length > 20) return `${id.slice(0, 10)}...${id.slice(-6)}`;
        return id;
    }

    function avatarInitials(id: string): string {
        if (!id || id.length < 6) return "??";
        return id.slice(4, 6).toUpperCase();
    }

    function avatarColor(id: string): string {
        if (!id) return "bg-white/[0.06]";
        const charCode = id.charCodeAt(4) + id.charCodeAt(5);
        const hue = (charCode * 37) % 360;
        return `background: hsl(${hue}, 20%, 20%); color: hsl(${hue}, 40%, 75%);`;
    }

    function handleSearchSelect(user: UserResponse) {
        onSelect(user.address);
    }
</script>

<aside
    class="w-72 flex-shrink-0 border-r border-white/5 bg-[#111113] flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)]"
>
    <!-- Header -->
    <div
        class="h-14 flex items-center justify-between px-4 border-b border-white/[0.04] flex-shrink-0 bg-[#111113]/90 backdrop-blur-md"
    >
        <div class="flex items-center gap-2.5">
            <div
                class="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-sm tracking-tighter shadow-[0_2px_10px_rgba(255,255,255,0.1)]"
            >
                R
            </div>
            <span class="text-sm font-semibold tracking-tight text-white/90"
                >Messages</span
            >
        </div>
    </div>

    <!-- Search Panel -->
    <SearchPanel onSelect={handleSearchSelect} />

    <!-- Peer List (Scrollable Middle) -->
    <div class="flex-1 overflow-y-auto px-2 py-1 scrollbar-hide">
        {#if peers.length === 0}
            <div
                class="text-xs text-white/20 text-center mt-12 px-4 leading-relaxed font-medium"
            >
                No conversations yet.<br />
                Use search to find someone.
            </div>
        {:else}
            <div class="flex flex-col gap-0.5">
                {#each peers as peer}
                    <button
                        class="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group relative overflow-hidden
              {activeId === peer
                            ? 'bg-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]'
                            : 'hover:bg-white/[0.04]'}"
                        on:click={() => onSelect(peer)}
                    >
                        {#if activeId === peer}
                            <div
                                class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            ></div>
                        {/if}
                        <div
                            class="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold border border-white/10 flex-shrink-0 shadow-sm transition-transform group-hover:scale-105"
                            style={avatarColor(peer)}
                        >
                            {avatarInitials(peer)}
                        </div>
                        <div class="flex-1 overflow-hidden">
                            <div
                                class="text-[13px] font-semibold truncate {activeId ===
                                peer
                                    ? 'text-white/90'
                                    : 'text-white/60 group-hover:text-white/80'} transition-colors"
                            >
                                {formatId(peer)}
                            </div>
                        </div>
                    </button>
                {/each}
            </div>
        {/if}
    </div>

    <!-- Pinned Dock Menu -->
    <DockMenu {onLogout} />
</aside>

<style>
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
