import { writable, get } from 'svelte/store';

export interface Message {
    id: string; // We'll generate a local ID or use timestamp
    from: string;
    to: string;
    content: string;
    timestamp: number;
    isOutgoing: boolean;
}

interface ChatState {
    activeProfileId: string | null;
    // Keyed by the peer's Radix ID (pubkey base64 string)
    messages: Record<string, Message[]>;
    peers: Set<string>; // List of all known peers we have chats with
}

const initialState: ChatState = {
    activeProfileId: null,
    messages: {},
    peers: new Set(),
};

function createChatStore() {
    const { subscribe, set, update } = writable<ChatState>(initialState);

    return {
        subscribe,
        setActiveProfile: (profileId: string) => update(state => {
            // Initialize if empty
            if (!state.messages[profileId]) {
                state.messages[profileId] = [];
            }
            return { ...state, activeProfileId: profileId, peers: new Set(state.peers).add(profileId) };
        }),

        addIncomingMessage: (msg: { from: string, content: string }) => update(state => {
            const peerId = msg.from;
            const newMessages = { ...state.messages };
            if (!newMessages[peerId]) {
                newMessages[peerId] = [];
            }

            newMessages[peerId] = [...newMessages[peerId], {
                id: crypto.randomUUID(),
                from: peerId,
                to: 'me', // handled by auth logic usually
                content: msg.content,
                timestamp: Date.now(),
                isOutgoing: false
            }];

            const newPeers = new Set(state.peers).add(peerId);
            return { ...state, messages: newMessages, peers: newPeers };
        }),

        addOutgoingMessage: (msg: { to: string, content: string, timestamp: number, from: string }) => update(state => {
            const peerId = msg.to;
            const newMessages = { ...state.messages };
            if (!newMessages[peerId]) {
                newMessages[peerId] = [];
            }

            newMessages[peerId] = [...newMessages[peerId], {
                id: crypto.randomUUID(),
                from: msg.from,
                to: peerId,
                content: msg.content,
                timestamp: msg.timestamp,
                isOutgoing: true
            }];

            const newPeers = new Set(state.peers).add(peerId);
            return { ...state, messages: newMessages, peers: newPeers };
        }),

        clear: () => set(initialState)
    };
}

export const chatStore = createChatStore();
