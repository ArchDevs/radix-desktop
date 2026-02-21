<script lang="ts">
  import { cn } from "$lib/utils";

  export let activeId: string | null = null;
  export let peers: string[] = [];
  export let onSelect: (id: string) => void;
  export let onLogout: () => void;
  export let className: string | undefined | null = undefined;

  import { LogOut } from "lucide-svelte";

  function formatId(id: string) {
    if (!id) return "Unknown";
    // rad:base64... -> rad:...64...
    if (id.length > 15) {
      return `${id.slice(0, 8)}...${id.slice(-6)}`;
    }
    return id;
  }
</script>

<aside
  class={cn(
    "w-80 flex-shrink-0 border-r border-border bg-background/50 backdrop-blur-xl flex flex-col",
    className,
  )}
>
  <div
    class="h-16 flex items-center justify-between px-6 border-b border-border/50"
  >
    <h2 class="text-lg font-semibold tracking-tight">Messages</h2>
    <button
      class="text-muted-foreground hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-500/10"
      on:click={onLogout}
      title="Logout"
    >
      <LogOut class="w-4 h-4" />
    </button>
  </div>

  <div class="flex-1 overflow-y-auto p-3 space-y-1">
    {#if peers.length === 0}
      <div class="text-sm text-muted-foreground text-center mt-10">
        No messages yet.
      </div>
    {:else}
      {#each peers as peer}
        <button
          class={cn(
            "w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 group",
            activeId === peer
              ? "bg-secondary text-secondary-foreground shadow-sm"
              : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground",
          )}
          on:click={() => onSelect(peer)}
        >
          <div
            class={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-medium bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-colors",
              activeId === peer && "from-blue-500/40 to-purple-500/40",
            )}
          >
            {peer.slice(4, 6).toUpperCase()}
          </div>
          <div class="flex-1 overflow-hidden">
            <div class="font-medium truncate">{formatId(peer)}</div>
          </div>
        </button>
      {/each}
    {/if}
  </div>
</aside>
