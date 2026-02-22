<script lang="ts">
    import MessageBubble from "./MessageBubble.svelte";
    import ChatHeader from "./ChatHeader.svelte";
    import EmptyState from "./EmptyState.svelte";
    import type { Message } from "./types";
    import { afterUpdate } from "svelte";

    export let messages: Message[] = [];
    export let activeId: string | null = null;

    let messagesContainer: HTMLDivElement;

    afterUpdate(() => {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });
</script>

<div class="flex flex-col h-full bg-[#0c0c0e]">
    <ChatHeader {activeId} />

    <div
        class="flex-1 overflow-y-auto py-4 relative flex flex-col"
        bind:this={messagesContainer}
    >
        {#if !activeId}
            <EmptyState />
        {:else if messages.length === 0}
            <div class="flex flex-1 items-center justify-center">
                <p class="text-[13px] text-white/15 font-light">
                    Send a message to start the conversation.
                </p>
            </div>
        {:else}
            <div class="mt-auto space-y-1.5">
                {#each messages as msg (msg.id)}
                    <MessageBubble
                        content={msg.content}
                        isOutgoing={msg.isOutgoing}
                        timestamp={msg.createdAt}
                        delivered={msg.delivered}
                        read={msg.read}
                    />
                {/each}
            </div>
        {/if}
    </div>
</div>
