import { chatStore } from './chat.store';
import { wsService } from '$core/network/ws';
import { apiClient } from '$core/network/api';
import { eventBus } from '$core/events/bus';
import { Events } from '$core/events/types';
import type { Message } from './types';

function safeDate(value: any): Date {
    if (!value) return new Date();
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
}

// ── Chat Service ─────────────────────────────────────────────────────────────

let unsubscribe: (() => void) | null = null;

/** Start listening for incoming messages from the event bus */
export function startListening(): void {
    if (unsubscribe) return; // Already listening

    // Sync undelivered messages when we connect/reconnect
    syncUndelivered();

    unsubscribe = eventBus.on(Events.MESSAGE_INCOMING, (payload) => {
        // Assume the payload matches the backend Message struct but we need to convert date
        const incomingMsg: Message = {
            id: payload.id || crypto.randomUUID(),
            sender: payload.from,
            recipient: wsService.getIdentityAddress() || '',
            content: payload.content,
            createdAt: safeDate(payload.timestamp),
            delivered: true,
            read: false,
            isOutgoing: false
        };
        chatStore.addIncomingMessage(incomingMsg);
    });
}

/** Stop listening and clean up */
export function stopListening(): void {
    unsubscribe?.();
    unsubscribe = null;
}

/** Fetch historical messages with a specific peer */
export async function fetchMessages(address: string): Promise<void> {
    try {
        // The backend returns an array of messages
        const msgs = await apiClient.get<any[]>(`/messages?with=${address}`);
        if (!msgs) return;

        const identityAddress = wsService.getIdentityAddress();

        const parsedMsgs: Message[] = msgs.map(m => ({
            id: m.id || m.ID,
            sender: m.sender || m.Sender,
            recipient: m.recipient || m.Recipient,
            content: m.content || m.Content,
            createdAt: safeDate(m.createdAt || m.CreatedAt),
            delivered: m.delivered || m.Delivered || true,
            read: m.read || m.Read || true,
            isOutgoing: (m.sender || m.Sender) === identityAddress
        }));

        chatStore.setMessages(address, parsedMsgs);
    } catch (error) {
        console.error(`[ChatService] Failed to fetch messages for ${address}:`, error);
    }
}

/** Sync undelivered messages */
export async function syncUndelivered(): Promise<void> {
    try {
        const msgs = await apiClient.get<any[]>('/messages/undelivered');
        if (!msgs || msgs.length === 0) return;

        const identityAddress = wsService.getIdentityAddress();

        const parsedMsgs: Message[] = msgs.map(m => ({
            id: m.id || m.ID,
            sender: m.sender || m.Sender,
            recipient: m.recipient || m.Recipient,
            content: m.content || m.Content,
            createdAt: safeDate(m.createdAt || m.CreatedAt),
            delivered: true, // we just received them
            read: false,
            isOutgoing: false // undelivered implies we are receiving
        }));

        chatStore.mergeMessages(parsedMsgs);
        console.log(`[ChatService] Synced ${parsedMsgs.length} undelivered messages`);
    } catch (error: any) {
        if (error.message?.includes('429')) {
            console.warn('[ChatService] Rate limited while syncing undelivered messages, will retry later');
            return;
        }
        console.error('[ChatService] Failed to sync undelivered messages:', error);
    }
}

/** Send a message to a peer */
export function sendMessage(to: string, content: string): boolean {
    const identityAddress = wsService.getIdentityAddress();
    if (!identityAddress) {
        console.error('[ChatService] Cannot send, no identity address');
        return false;
    }

    const timestamp = Date.now();
    const id = crypto.randomUUID();

    // WS payload (needs to match what the backend expects, usually just stringified JSON)
    const payload = { id, to, from: identityAddress, content, timestamp };
    const sent = wsService.send(payload);

    if (sent) {
        // Optimistic update
        const outgoingMsg: Message = {
            id,
            sender: identityAddress,
            recipient: to,
            content,
            createdAt: new Date(timestamp),
            delivered: false, // will update when backend ACKs, or just assume sent
            read: false,
            isOutgoing: true
        };
        chatStore.addOutgoingMessage(outgoingMsg);
    }

    return sent;
}
