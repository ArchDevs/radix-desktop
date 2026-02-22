<script lang="ts">
    import { Search, Loader2, UserPlus, X } from "lucide-svelte";
    import { searchStore } from "$features/search/search.store";
    import * as searchService from "$features/search/search.service";
    import type { UserResponse } from "$features/identity/types";

    export let onSelect: (user: UserResponse) => void;

    let searchInputRef: HTMLInputElement;
    $: state = $searchStore;

    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement;
        searchService.handleSearchInput(target.value);
    }

    function handleClear() {
        searchService.clearSearch();
        if (searchInputRef) searchInputRef.value = "";
    }

    function avatarInitials(id: string): string {
        if (!id || id.length < 6) return "??";
        return id.slice(4, 6).toUpperCase();
    }

    function avatarColor(id: string): string {
        if (!id) return "bg-white/[0.06]";
        const charCode = id.charCodeAt(4) + id.charCodeAt(5);
        const hue = (charCode * 37) % 360;
        return `background: hsl(${hue}, 20%, 15%); color: hsl(${hue}, 40%, 65%);`;
    }
</script>

<div class="px-3 py-2 flex flex-col gap-2 relative">
    <!-- Search Input -->
    <div class="relative flex items-center">
        <div class="absolute left-3 text-white/20 pointer-events-none">
            {#if state.isSearching}
                <Loader2 class="w-3.5 h-3.5 animate-spin" />
            {:else}
                <Search class="w-3.5 h-3.5" />
            {/if}
        </div>

        <input
            bind:this={searchInputRef}
            type="text"
            placeholder="Search users..."
            on:input={handleInput}
            class="w-full bg-[#18181b] hover:bg-[#202024] focus:bg-[#202024] border border-white/5 focus:border-white/10 text-[13px] text-white/90 placeholder:text-white/30 rounded-lg py-1.5 pl-8 pr-8 outline-none transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]"
        />

        {#if state.query}
            <button
                class="absolute right-2.5 text-white/20 hover:text-white/60 transition-colors p-0.5"
                on:click={handleClear}
            >
                <X class="w-3.5 h-3.5" />
            </button>
        {/if}
    </div>

    <!-- Search Results Dropdown -->
    {#if state.query && !state.isSearching}
        <div
            class="absolute top-[calc(100%+4px)] left-2 right-2 bg-[#18181b] border border-white/5 rounded-xl shadow-xl shadow-black/50 z-50 overflow-hidden max-h-64 flex flex-col"
        >
            {#if state.error}
                <div class="p-4 text-center text-xs text-red-400">
                    {state.error}
                </div>
            {:else if state.results.length === 0}
                <div class="p-4 text-center text-xs text-white/30">
                    No users found.
                </div>
            {:else}
                <div class="overflow-y-auto p-1 flex pl-0 flex-col gap-0.5">
                    <div
                        class="px-2 pt-1.5 pb-1 text-[10px] font-semibold tracking-wider text-white/30 uppercase"
                    >
                        Global Search
                    </div>

                    {#each state.results as user (user.address)}
                        <button
                            class="w-full text-left px-2 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-3 group"
                            on:click={() => {
                                onSelect(user);
                                handleClear();
                            }}
                        >
                            <div
                                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border border-white/5 flex-shrink-0"
                                style={avatarColor(user.address)}
                            >
                                {avatarInitials(user.address)}
                            </div>
                            <div class="flex-1 overflow-hidden">
                                <div
                                    class="flex items-center justify-between gap-2"
                                >
                                    <span
                                        class="text-[13px] font-medium text-white/80 group-hover:text-white truncate"
                                        >{user.displayName ||
                                            user.username}</span
                                    >
                                    <span
                                        class="text-[10px] text-white/20 font-mono flex-shrink-0"
                                        >@{user.username}</span
                                    >
                                </div>
                                <div
                                    class="text-[10.5px] text-white/30 font-mono truncate mt-0.5"
                                >
                                    {user.address}
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>
