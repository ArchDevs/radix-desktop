<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { authStore } from "$store/auth";
  import { chatStore } from "$store/chat";
  import { wsService } from "$src/services/ws";

  import Layout from "$lib/components/layout/Layout.svelte";
  import Sidebar from "$lib/components/layout/Sidebar.svelte";
  import ChatArea from "$lib/components/layout/ChatArea.svelte";
  import MessageInput from "$lib/components/ui/MessageInput.svelte";

  // Subscriptions
  $: peers = Array.from($chatStore.peers);
  $: activeId = $chatStore.activeProfileId;
  $: currentMessages = activeId ? $chatStore.messages[activeId] || [] : [];

  onMount(() => {
    // Connect to WS if we have credentials
    if ($authStore.jwtToken && $authStore.identityAddress) {
      wsService.connect($authStore.jwtToken, $authStore.identityAddress);
    }
  });

  onDestroy(() => {
    wsService.disconnect();
  });

  function handleSelectChat(id: string) {
    chatStore.setActiveProfile(id);
  }

  function handleSendMessage(event: CustomEvent<string>) {
    const text = event.detail;
    if (activeId && text) {
      wsService.sendMessage(activeId, text);
    }
  }

  function handleLogout() {
    import("$store/auth").then((m) => m.clearAuth());
    import("$store/chat").then((m) => m.chatStore.clear());
    wsService.disconnect();
  }

  // Debug: Fake an incoming message when doing local dev
  function addMockMessage() {
    const mockPeerId = "rad:mockUserPubKeyBase64String";
    chatStore.addIncomingMessage({
      from: mockPeerId,
      content: "Hello! This is a mock incoming message to test the UI.",
    });
    chatStore.setActiveProfile(mockPeerId);
  }
</script>

<Layout>
  <!-- Sidebar -->
  <Sidebar
    {peers}
    {activeId}
    onSelect={handleSelectChat}
    onLogout={handleLogout}
  />

  <!-- Main Chat Area -->
  <div class="flex-1 flex flex-col relative">
    <ChatArea messages={currentMessages} {activeId} />

    <div class="mt-auto">
      <MessageInput on:send={handleSendMessage} disabled={!activeId} />
    </div>

    <!-- Dev helper to simulate incoming messages -->
    {#if import.meta.env.DEV}
      <button
        class="absolute top-4 right-4 bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-full shadow-lg opacity-30 hover:opacity-100 transition-opacity z-50"
        on:click={addMockMessage}
        title="Simulate incoming message"
      >
        Simulate Messages
      </button>
    {/if}
  </div>
</Layout>
