<script lang="ts">
    import { LogOut, Settings, UserCircle, ShieldAlert } from "lucide-svelte";
    import { identityStore } from "$features/identity/identity.store";
    import { settingsStore } from "$features/settings/settings.store";
    import { cn } from "$shared/utils";

    export let onLogout: () => void;

    $: profile = $identityStore;

    function avatarInitials(user: any): string {
        if (!user) return "?";
        if (user.displayName) return user.displayName.slice(0, 2).toUpperCase();
        if (user.username) return user.username.slice(0, 2).toUpperCase();
        if (user.address && user.address.length >= 6)
            return user.address.slice(4, 6).toUpperCase();
        return "??";
    }

    function avatarColor(address: string | null): string {
        if (!address) return "bg-white/[0.06] text-white/50";
        const charCode = address.charCodeAt(4) + address.charCodeAt(5);
        const hue = (charCode * 37) % 360;
        return `background: hsl(${hue}, 20%, 20%); color: hsl(${hue}, 40%, 75%);`;
    }
</script>

<div
    class="h-16 border-t border-white/[0.04] bg-[#111113]/90 backdrop-blur-md flex items-center px-4 justify-between flex-shrink-0 z-10 shadow-[0_-4px_24px_rgba(0,0,0,0.2)]"
>
    {#if profile.isHydrating}
        <div class="flex items-center gap-3 w-full animate-pulse">
            <div class="w-9 h-9 rounded-full bg-white/[0.03]"></div>
            <div class="flex-1 space-y-2">
                <div class="h-3 bg-white/[0.03] rounded w-16"></div>
                <div class="h-2 bg-white/[0.03] rounded w-24"></div>
            </div>
        </div>
    {:else if profile.error || !profile.address}
        <div class="flex items-center gap-3 w-full">
            <div
                class="w-9 h-9 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20"
            >
                <ShieldAlert class="w-4 h-4" />
            </div>
            <div class="flex-1 overflow-hidden">
                <div class="text-[13px] font-medium text-red-400">
                    Identity Error
                </div>
                <div class="text-[10.5px] text-white/40 truncate">
                    Failed to load profile
                </div>
            </div>
        </div>
    {:else}
        <!-- User Profile Strip -->
        <button
            class="flex items-center gap-3 group hover:bg-white/[0.04] p-1.5 -ml-1.5 rounded-lg transition-colors flex-1 overflow-hidden text-left"
        >
            <div
                class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border border-white/[0.06] shadow-sm transition-transform group-hover:scale-105"
                style={avatarColor(profile.address)}
            >
                {avatarInitials(profile)}
            </div>
            <div class="flex-1 overflow-hidden">
                <div
                    class="text-[13px] font-semibold text-white/90 group-hover:text-white truncate translation-colors"
                >
                    {profile.displayName || profile.username || "Anonymous"}
                </div>
                <div
                    class="text-[10px] font-mono text-white/30 truncate mt-0.5"
                >
                    {profile.address.length > 20
                        ? `${profile.address.slice(0, 12)}...${profile.address.slice(-6)}`
                        : profile.address}
                </div>
            </div>
        </button>
    {/if}

    <!-- Dock Actions -->
    <div class="flex items-center gap-1 ml-2">
        <button
            class="p-2 rounded-md text-white/30 hover:text-white/80 hover:bg-white/[0.06] transition-all"
            on:click={() => settingsStore.open()}
            title="Settings"
        >
            <Settings class="w-4 h-4" />
        </button>
        <button
            class="p-2 rounded-md text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
            on:click={onLogout}
            title="Logout"
        >
            <LogOut class="w-4 h-4" />
        </button>
    </div>
</div>
