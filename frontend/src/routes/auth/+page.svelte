<script lang="ts">
  import {
    CreateIdentity,
    Authenticate,
    HasIdentity,
    GetAddress,
    ClearIdentity,
  } from "../../../wailsjs/go/app/App";
  import type { service } from "../../../wailsjs/go/models";
  import { onMount } from "svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import BackgroundGrid from "$lib/components/ui/BackgroundGrid.svelte";
  import TextReveal from "$lib/components/ui/TextReveal.svelte";
  import { setAuthenticated, clearAuth } from "$store/auth";
  import {
    Shield,
    Key,
    ArrowRight,
    Loader2,
    KeyRound,
    Copy,
    Check,
  } from "lucide-svelte";
  import { fade, slide, fly } from "svelte/transition";

  let identity: service.Identity | null = null;
  let existingAddress = "";
  let token = "";
  let status = "";
  let loading = false;
  let isError = false;
  let isCopied = false;

  function copyMnemonic() {
    if (identity) {
      navigator.clipboard.writeText(identity.mnemonic);
      isCopied = true;
      setTimeout(() => {
        isCopied = false;
      }, 2000);
    }
  }

  onMount(async () => {
    try {
      const hasId = await HasIdentity();
      if (hasId) {
        existingAddress = await GetAddress();
        // subtle status update to not clutter the new elegant UI
      }
    } catch {
      // No identity yet or keyring error
    }
  });

  async function handleCreateIdentity() {
    loading = true;
    status = "Generating keys...";
    isError = false;

    try {
      identity = await CreateIdentity();
      existingAddress = identity.address;
      status = "Identity created. Please save your phrase.";
    } catch (err: any) {
      isError = true;
      if (err.toString().includes("not activatable")) {
        status =
          "System keyring unavailable. Please install gnome-keyring or kwallet.";
      } else {
        status = `Failed: ${err}`;
      }
    } finally {
      loading = false;
    }
  }

  async function handleAuthenticate() {
    loading = true;
    status = "Verifying identity...";
    isError = false;

    try {
      token = await Authenticate();
      status = "Secure session established.";

      setTimeout(() => {
        setAuthenticated(token);
        import("$store/auth").then((m) =>
          m.setIdentity(identity?.address || existingAddress),
        );
      }, 600);
    } catch (err: any) {
      isError = true;
      status = `Authentication failed: ${err}`;
      loading = false;
    }
  }

  async function handleClearIdentity() {
    loading = true;
    status = "Wiping local identity...";
    isError = false;

    try {
      await ClearIdentity();
      identity = null;
      existingAddress = "";
      token = "";
      clearAuth();
      status = "Identity successfully wiped.";
    } catch (err: any) {
      isError = true;
      status = `Operation failed: ${err}`;
    } finally {
      loading = false;
    }
  }
</script>

<div
  class="min-h-screen w-full flex bg-black text-zinc-100 font-sans selection:bg-zinc-800"
>
  <!-- Left Side: Branding and Typography -->
  <div
    class="hidden lg:flex w-1/2 flex-col justify-between p-12 lg:p-16 border-r border-white/10 relative overflow-hidden bg-zinc-950"
  >
    <BackgroundGrid r={20} c={24} />
    <!-- Abstract subtle ambient glow -->
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
        <TextReveal duration={0.8} delay={0.5} yOffset={20}>Yours.</TextReveal>
      </h1>
      <TextReveal duration={1} delay={0.7} yOffset={10}>
        <p class="text-zinc-400 text-lg max-w-md leading-relaxed font-light">
          The elegant End-to-End Encrypted messenger built for absolute privacy
          without compromising speed.
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
          Authenticate or generate a new identity to access your messages.
        </p>
      </div>

      <div class="space-y-6">
        <!-- Status Indicator -->
        {#if status}
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
              {status}
            </div>
          </div>
        {/if}

        <!-- Identity Warning Block -->
        {#if identity}
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
                {identity.mnemonic}
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
        {/if}

        <!-- Identified Device State -->
        {#if existingAddress && !identity}
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
                {existingAddress}
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
            onClick={handleAuthenticate}
            disabled={loading || (!identity && !existingAddress)}
          >
            <div
              class="flex items-center justify-center gap-2 py-1.5 font-semibold"
            >
              {existingAddress ? "Unlock & Authenticate" : "Authenticate"}
              <ArrowRight class="w-4 h-4" />
            </div>
          </Button>

          {#if !identity && !existingAddress}
            <div
              class="text-center py-2 relative flex items-center justify-center"
            >
              <div class="absolute inset-0 flex items-center px-4">
                <div class="w-full border-t border-zinc-800"></div>
              </div>
              <span
                class="relative z-10 bg-[#09090b] px-3 text-xs text-zinc-600 font-medium tracking-widest uppercase"
                >Or</span
              >
            </div>

            <Button
              variant="secondary"
              onClick={handleCreateIdentity}
              disabled={loading}
            >
              <div class="py-1">Generate New Identity</div>
            </Button>
          {/if}

          {#if existingAddress || identity}
            <div class="mt-2 text-center">
              <button
                class="text-xs text-red-500/70 hover:text-red-400 font-medium transition-colors p-2 disabled:opacity-50"
                on:click={handleClearIdentity}
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
