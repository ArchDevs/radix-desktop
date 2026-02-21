<script lang="ts">
  import { cn } from "$lib/utils";
  import MessageBubble from "$lib/components/ui/MessageBubble.svelte";
  import type { Message } from "$store/chat";
  import { afterUpdate } from "svelte";

  export let messages: Message[] = [];
  export let activeId: string | null = null;
  export let className: string | undefined | null = undefined;

  let messagesContainer: HTMLDivElement;

  afterUpdate(() => {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });

  function formatId(id: string) {
    if (!id) return "";
    if (id.length > 15) {
      return `${id.slice(0, 12)}...${id.slice(-6)}`;
    }
    return id;
  }
</script>

<div class={cn("flex flex-col h-full bg-background", className)}>
  <div class="h-16 flex items-center px-6 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
    {#if activeId}
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full flex items-center justify-center font-medium bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400">
          {activeId.slice(4, 6).toUpperCase()}
        </div>
        <div>
          <h2 class="text-lg font-semibold tracking-tight">{formatId(activeId)}</h2>
          <p class="text-xs text-green-400 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            E2EE Secured Session
          </p>
        </div>
      </div>
    {:else}
       <h2 class="text-lg font-semibold tracking-tight text-muted-foreground">Select a chat to start messaging</h2>
    {/if}
  </div>

  <div class="flex-1 overflow-y-auto p-4 space-y-2 relative" bind:this={messagesContainer}>
    {#if !activeId}
      <div class="absolute inset-0 flex items-center justify-center flex-col gap-4 text-muted-foreground">
         <svg class="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
         </svg>
         <p>Secure. Anonymous. Fast.</p>
      </div>
    {:else if messages.length === 0}
      <div class="flex h-full items-center justify-center text-muted-foreground text-sm">
        Send a message to start the conversation.
      </div>
    {:else}
      {#each messages as msg (msg.id)}
        <MessageBubble 
          content={msg.content} 
          isOutgoing={msg.isOutgoing} 
          timestamp={msg.timestamp} 
        />
      {/each}
    {/if}
  </div>
</div>
