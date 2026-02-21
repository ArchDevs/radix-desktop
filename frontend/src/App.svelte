<script lang="ts">
  import AuthPage from "./routes/auth/+page.svelte";
  import ChatPage from "./routes/chat/+page.svelte";
  import { authStore } from "./store/auth";
</script>

<main
  class="min-h-screen bg-background text-foreground selection:bg-blue-500/30"
>
  {#if $authStore.isAuthenticated}
    <ChatPage />
  {:else}
    <AuthPage />
  {/if}
</main>
