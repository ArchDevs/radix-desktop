<script lang="ts">
  import { cn } from "$lib/utils";
  import { createEventDispatcher } from "svelte";
  import { SendHorizontal } from 'lucide-svelte';

  export let disabled: boolean = false;
  export let className: string | undefined | null = undefined;

  let text = "";
  const dispatch = createEventDispatcher();

  function handleSubmit() {
    if (!text.trim() || disabled) return;
    dispatch("send", text.trim());
    text = "";
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }
</script>

<div class={cn("p-4 border-t border-border/50 bg-background/80 backdrop-blur-xl", className)}>
  <div class="max-w-4xl mx-auto relative flex items-end overflow-hidden rounded-2xl bg-secondary/50 border border-border/50 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all duration-300">
    <textarea
      bind:value={text}
      on:keydown={handleKeydown}
      placeholder={disabled ? "Select a chat..." : "Type a message..."}
      class="w-full max-h-32 min-h-[56px] bg-transparent resize-none outline-none py-4 pl-4 pr-14 text-sm scrollbar-hide"
      {disabled}
      rows="1"
    ></textarea>
    
    <button
      on:click={handleSubmit}
      class={cn(
        "absolute right-2 bottom-2 p-2 rounded-xl transition-all duration-300",
        text.trim() && !disabled 
          ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-blue-900/30 hover:scale-105 active:scale-95" 
          : "text-muted-foreground bg-transparent hover:bg-secondary/80"
      )}
      {disabled}
    >
      <SendHorizontal class="w-5 h-5" />
    </button>
  </div>
</div>

<style>
  /* Hide scrollbar for Chrome, Safari and Opera */
  .scrollbar-hide::-webkit-scrollbar {
      display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  .scrollbar-hide {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
  }
</style>
