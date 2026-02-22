<script lang="ts">
    import {
        X,
        Loader2,
        Check,
        AlertCircle,
        User,
        Shield,
    } from "lucide-svelte";
    import { fly, fade } from "svelte/transition";
    import { settingsStore } from "./settings.store";
    import * as settingsService from "./settings.service";
    import { identityStore } from "$features/identity/identity.store";

    $: state = $settingsStore;
    $: profile = $identityStore;

    let username = "";

    // Sync form value when panel opens or profile changes
    $: if (state.isOpen && profile.username) {
        username = profile.username;
    }

    function handleClose() {
        settingsStore.close();
    }

    async function handleSave() {
        await settingsService.updateUsername(username);
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") handleClose();
        if (e.key === "Enter" && !state.isSaving) handleSave();
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if state.isOpen}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        transition:fade={{ duration: 150 }}
        on:click={handleClose}
    />

    <!-- Settings Panel -->
    <div
        class="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col bg-[#131316] border-l border-white/[0.06] shadow-[-8px_0_40px_rgba(0,0,0,0.4)]"
        transition:fly={{ x: 400, duration: 250, opacity: 1 }}
    >
        <!-- Header -->
        <div
            class="h-14 flex items-center justify-between px-6 border-b border-white/[0.04] flex-shrink-0"
        >
            <h2 class="text-[15px] font-semibold text-white/90 tracking-tight">
                Settings
            </h2>
            <button
                class="p-1.5 rounded-md text-white/30 hover:text-white/80 hover:bg-white/[0.06] transition-all"
                on:click={handleClose}
            >
                <X class="w-4 h-4" />
            </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            <!-- Identity Section (Read-only) -->
            <section class="space-y-3">
                <div class="flex items-center gap-2 text-white/40">
                    <Shield class="w-3.5 h-3.5" />
                    <span
                        class="text-[11px] font-semibold uppercase tracking-wider"
                        >Cryptographic Identity</span
                    >
                </div>
                <div
                    class="bg-[#18181b] rounded-xl border border-white/[0.04] p-4 space-y-3"
                >
                    <div>
                        <span
                            class="text-[10.5px] font-medium text-white/30 uppercase tracking-wider"
                            >Address</span
                        >
                        <p
                            class="text-[13px] font-mono text-white/60 mt-1 break-all leading-relaxed select-all"
                        >
                            {profile.address || "—"}
                        </p>
                    </div>
                    <div class="border-t border-white/[0.03] pt-3">
                        <span
                            class="text-[10.5px] font-medium text-white/30 uppercase tracking-wider"
                            >Member Since</span
                        >
                        <p class="text-[13px] text-white/50 mt-1">
                            {profile.createdAt
                                ? profile.createdAt.toLocaleDateString(
                                      "en-US",
                                      {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                      },
                                  )
                                : "—"}
                        </p>
                    </div>
                </div>
            </section>

            <!-- Profile Section (Editable) -->
            <section class="space-y-3">
                <div class="flex items-center gap-2 text-white/40">
                    <User class="w-3.5 h-3.5" />
                    <span
                        class="text-[11px] font-semibold uppercase tracking-wider"
                        >Profile</span
                    >
                </div>
                <div
                    class="bg-[#18181b] rounded-xl border border-white/[0.04] p-4 space-y-4"
                >
                    <!-- Username Field -->
                    <div class="space-y-2">
                        <label
                            for="settings-username"
                            class="text-[11px] font-medium text-white/40 uppercase tracking-wider"
                        >
                            Username
                        </label>
                        <input
                            id="settings-username"
                            type="text"
                            bind:value={username}
                            disabled={state.isSaving}
                            placeholder="Choose a username..."
                            class="w-full bg-[#111113] border border-white/[0.06] focus:border-white/[0.12] rounded-lg px-3.5 py-2.5 text-[14px] text-white/90 placeholder:text-white/20 outline-none transition-all disabled:opacity-50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]"
                        />
                        <p class="text-[10.5px] text-white/25 leading-relaxed">
                            Your username is visible to other users when they
                            search for you.
                        </p>
                    </div>
                </div>
            </section>
        </div>

        <!-- Footer with Save / Feedback -->
        <div
            class="px-6 py-4 border-t border-white/[0.04] flex-shrink-0 space-y-3"
        >
            <!-- Feedback Messages -->
            {#if state.error}
                <div
                    class="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                    transition:fly={{ y: 5, duration: 150 }}
                >
                    <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" />
                    <span class="text-[12px]">{state.error}</span>
                </div>
            {/if}
            {#if state.success}
                <div
                    class="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2"
                    transition:fly={{ y: 5, duration: 150 }}
                >
                    <Check class="w-3.5 h-3.5 flex-shrink-0" />
                    <span class="text-[12px]">{state.success}</span>
                </div>
            {/if}

            <button
                on:click={handleSave}
                disabled={state.isSaving || !username.trim()}
                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                    bg-white/[0.08] hover:bg-white/[0.12] text-white/90 hover:text-white border border-white/[0.06] hover:border-white/[0.1] shadow-sm active:scale-[0.98]"
            >
                {#if state.isSaving}
                    <Loader2 class="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                {:else}
                    <span>Save Changes</span>
                {/if}
            </button>
        </div>
    </div>
{/if}
