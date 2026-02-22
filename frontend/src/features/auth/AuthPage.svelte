<script lang="ts">
    import { onMount } from "svelte";
    import { authStore } from "./auth.store";
    import * as authService from "./auth.service";
    import MnemonicCard from "./MnemonicCard.svelte";
    import Button from "$shared/components/Button.svelte";
    import BackgroundGrid from "$shared/components/BackgroundGrid.svelte";
    import TextReveal from "$shared/components/TextReveal.svelte";
    import { Shield, ArrowRight, Loader2, KeyRound } from "lucide-svelte";
    import { fade, fly } from "svelte/transition";

    $: fsm = $authStore;
    $: loading =
        fsm.state === "generating" ||
        fsm.state === "authenticating" ||
        fsm.state === "initializing";

    $: statusMessage = (() => {
        switch (fsm.state) {
            case "initializing":
                return "Checking device identity...";
            case "generating":
                return "Generating keys...";
            case "authenticating":
                return "Verifying identity...";
            case "error":
                return fsm.error || "An error occurred.";
            default:
                return "";
        }
    })();

    $: isError = fsm.state === "error";

    onMount(() => {
        authService.initialize();
    });
</script>

<div
    class="min-h-screen w-full flex bg-black text-zinc-100 font-sans selection:bg-zinc-800"
>
    <!-- Left Side: Branding and Typography -->
    <div
        class="hidden lg:flex w-1/2 flex-col justify-between p-12 lg:p-16 border-r border-white/10 relative overflow-hidden bg-zinc-950"
    >
        <BackgroundGrid r={20} c={24} />
        <div
            class="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_0%_0%,_var(--tw-gradient-stops))] from-zinc-800/20 via-black to-black opacity-50"
        ></div>

        <div class="relative z-10 flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold text-xl tracking-tighter"
            >
                R
            </div>
            <span class="text-xl font-medium tracking-tight">Radix</span>
        </div>

        <div class="relative z-10">
            <h1
                class="text-6xl xl:text-7xl font-bold tracking-tighter mb-8 leading-[1.05]"
            >
                <TextReveal duration={0.8} delay={0.1} yOffset={20}>
                    Anonymous.<br />
                </TextReveal>
                <TextReveal duration={0.8} delay={0.3} yOffset={20}>
                    <span class="text-zinc-600">Secure.</span><br />
                </TextReveal>
                <TextReveal duration={0.8} delay={0.5} yOffset={20}
                    >Yours.</TextReveal
                >
            </h1>
            <TextReveal duration={1} delay={0.7} yOffset={10}>
                <p
                    class="text-zinc-400 text-lg max-w-md leading-relaxed font-light"
                >
                    The elegant End-to-End Encrypted messenger built for
                    absolute privacy without compromising speed.
                </p>
            </TextReveal>
        </div>

        <div
            class="relative z-10 flex items-center gap-2 text-sm text-zinc-500 font-mono"
        >
            <Shield class="w-4 h-4" /> E2EE Secured Architecture
        </div>
    </div>

    <!-- Right Side: Interactive Auth Form -->
    <div
        class="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 relative"
    >
        <div class="w-full max-w-md xl:max-w-lg space-y-10">
            <div class="space-y-3 text-center lg:text-left">
                <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight">
                    Welcome
                </h2>
                <p class="text-zinc-400 text-sm lg:text-base">
                    Authenticate or generate a new identity to access your
                    messages.
                </p>
            </div>

            <div class="space-y-6">
                <!-- Status Indicator -->
                {#if statusMessage}
                    <div
                        transition:fly={{ y: -10, duration: 300 }}
                        class="p-4 rounded-xl text-sm font-medium {isError
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}"
                    >
                        <div class="flex items-center gap-2">
                            {#if loading}
                                <Loader2 class="w-4 h-4 animate-spin" />
                            {/if}
                            {statusMessage}
                        </div>
                    </div>
                {/if}

                <!-- Mnemonic Display -->
                {#if fsm.mnemonic}
                    <MnemonicCard mnemonic={fsm.mnemonic} />
                {/if}

                <!-- Identified Device State -->
                {#if fsm.state === "identity_ready" && !fsm.mnemonic}
                    <div
                        transition:fade
                        class="flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.03]"
                    >
                        <div class="p-3 bg-white/10 rounded-xl text-white">
                            <KeyRound class="w-5 h-5" />
                        </div>
                        <div class="overflow-hidden">
                            <p class="text-sm font-medium text-white mb-0.5">
                                Identity Detected on Device
                            </p>
                            <p class="text-xs text-zinc-500 font-mono truncate">
                                {fsm.address}
                            </p>
                        </div>
                    </div>
                {/if}

                <!-- Action Panel -->
                <div
                    class="bg-zinc-900/40 p-2 rounded-2xl border border-white/5 flex flex-col gap-2"
                >
                    <Button
                        variant="primary"
                        onClick={authService.authenticate}
                        disabled={loading || fsm.state !== "identity_ready"}
                    >
                        <div
                            class="flex items-center justify-center gap-2 py-1.5 font-semibold"
                        >
                            {fsm.address
                                ? "Unlock & Authenticate"
                                : "Authenticate"}
                            <ArrowRight class="w-4 h-4" />
                        </div>
                    </Button>

                    {#if fsm.state === "no_identity"}
                        <div
                            class="text-center py-2 relative flex items-center justify-center"
                        >
                            <div
                                class="absolute inset-0 flex items-center px-4"
                            >
                                <div
                                    class="w-full border-t border-zinc-800"
                                ></div>
                            </div>
                            <span
                                class="relative z-10 bg-[#09090b] px-3 text-xs text-zinc-600 font-medium tracking-widest uppercase"
                                >Or</span
                            >
                        </div>

                        <Button
                            variant="secondary"
                            onClick={authService.generateIdentity}
                            disabled={loading}
                        >
                            <div class="py-1">Generate New Identity</div>
                        </Button>
                    {/if}

                    {#if fsm.address}
                        <div class="mt-2 text-center">
                            <button
                                class="text-xs text-red-500/70 hover:text-red-400 font-medium transition-colors p-2 disabled:opacity-50"
                                on:click={authService.clearIdentity}
                                disabled={loading}
                            >
                                Clear Local Identity
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>
