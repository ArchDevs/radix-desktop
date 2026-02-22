<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { authStore } from "$features/auth/auth.store";
    import { chatStore, activeMessages } from "./chat.store";
    import * as chatService from "./chat.service";
    import { wsService } from "$core/network/ws";

    import Sidebar from "./Sidebar.svelte";
    import ChatArea from "./ChatArea.svelte";
    import MessageInput from "./MessageInput.svelte";
    import SettingsPanel from "$features/settings/SettingsPanel.svelte";

    $: peers = $chatStore.peers;
    $: activeId = $chatStore.activeProfileId;
    $: messages = $activeMessages;

    onMount(() => {
        const auth = $authStore;
        if (auth.token && auth.address) {
            wsService.connect(auth.token, auth.address);
            chatService.startListening();
        }
    });

    onDestroy(() => {
        chatService.stopListening();
        wsService.disconnect();
    });

    function handleSelectChat(id: string) {
        chatStore.setActiveProfile(id);
        // Fetch historical messages for this conversation
        chatService.fetchMessages(id);
    }

    function handleSendMessage(event: CustomEvent<string>) {
        const text = event.detail;
        if (activeId && text) {
            chatService.sendMessage(activeId, text);
        }
    }

    function handleLogout() {
        chatService.stopListening();
        wsService.disconnect();
        chatStore.clear();
        authStore.reset();
    }
</script>

<div class="flex h-screen overflow-hidden bg-[#111113]">
    <Sidebar
        {peers}
        {activeId}
        onSelect={handleSelectChat}
        onLogout={handleLogout}
    />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0c0c0e]">
        <div class="flex-1 min-h-0 overflow-hidden flex flex-col">
            <ChatArea {messages} {activeId} />
        </div>

        <div class="flex-shrink-0 z-10 w-full">
            <MessageInput on:send={handleSendMessage} disabled={!activeId} />
        </div>
    </div>

    <SettingsPanel />
</div>
