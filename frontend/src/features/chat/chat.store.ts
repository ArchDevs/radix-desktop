import { writable, derived } from 'svelte/store';
import type { ChatState, Message } from './types';

const initialState: ChatState = {
    activeProfileId: null,
    messages: {},
    peers: [],
};

function createChatStore() {
    const { subscribe, set, update } = writable<ChatState>(initialState);

    return {
        subscribe,

        setActiveProfile(profileId: string) {
            update(state => {
                const messages = { ...state.messages };
                if (!messages[profileId]) {
                    messages[profileId] = [];
                }
                const peers = state.peers.includes(profileId)
                    ? state.peers
                    : [...state.peers, profileId];
                return { ...state, activeProfileId: profileId, messages, peers };
            });
        },

        setMessages(peerId: string, msgs: Message[]) {
            update(state => {
                const messages = { ...state.messages };
                messages[peerId] = msgs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

                const peers = state.peers.includes(peerId)
                    ? state.peers
                    : [...state.peers, peerId];

                return { ...state, messages, peers };
            });
        },

        mergeMessages(msgs: Message[]) {
            update(state => {
                const messages = { ...state.messages };
                const peers = new Set(state.peers);

                for (const msg of msgs) {
                    // Group by peer (either sender or recipient depending on direction)
                    const peerId = msg.isOutgoing ? msg.recipient : msg.sender;

                    if (!messages[peerId]) messages[peerId] = [];

                    // Avoid duplicates by ID
                    if (!messages[peerId].find(m => m.id === msg.id)) {
                        messages[peerId].push(msg);
                    }

                    peers.add(peerId);
                }

                // Sort all modified lists
                for (const peerId in messages) {
                    messages[peerId].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
                }

                return { ...state, messages, peers: Array.from(peers) };
            });
        },

        addIncomingMessage(msg: Message) {
            update(state => {
                const peerId = msg.sender;
                const messages = { ...state.messages };
                if (!messages[peerId]) messages[peerId] = [];

                messages[peerId] = [...messages[peerId], msg];

                const peers = state.peers.includes(peerId)
                    ? state.peers
                    : [...state.peers, peerId];

                return { ...state, messages, peers };
            });
        },

        addOutgoingMessage(msg: Message) {
            update(state => {
                const peerId = msg.recipient;
                const messages = { ...state.messages };
                if (!messages[peerId]) messages[peerId] = [];

                messages[peerId] = [...messages[peerId], msg];

                const peers = state.peers.includes(peerId)
                    ? state.peers
                    : [...state.peers, peerId];

                return { ...state, messages, peers };
            });
        },

        markDelivered(messageIds: string[]) {
            update(state => {
                const messages = { ...state.messages };
                for (const peerId in messages) {
                    messages[peerId] = messages[peerId].map(msg =>
                        messageIds.includes(msg.id) ? { ...msg, delivered: true } : msg
                    );
                }
                return { ...state, messages };
            });
        },

        clear() {
            set(initialState);
        },
    };
}

export const chatStore = createChatStore();

// ── Derived ──────────────────────────────────────────────────────────────────

export const activeMessages = derived(chatStore, $s =>
    $s.activeProfileId ? $s.messages[$s.activeProfileId] || [] : []
);
