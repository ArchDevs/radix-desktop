<script lang="ts">
    import AuthPage from "$features/auth/AuthPage.svelte";
    import ChatPage from "$features/chat/ChatPage.svelte";
    import { isAuthenticated } from "$features/auth/auth.store";
</script>

<main
    class="min-h-screen bg-background text-foreground selection:bg-zinc-800/50"
>
    {#if $isAuthenticated}
        <ChatPage />
    {:else}
        <AuthPage />
    {/if}
</main>
