<script lang="ts">
  import { cn } from "$lib/utils";
  
  export let className: string | undefined | null = undefined;
</script>

<div class={cn("flex h-screen overflow-hidden bg-background", className)}>
  <slot />
</div>
