import { chatStore } from '../store/chat';

export interface IncomingMessage {
    to: string;
    content: string;
}

export interface OutgoingMessage {
    from: string;
    content: string;
    timestamp: number;
}

class WSService {
    private ws: WebSocket | null = null;
    private token: string | null = null;
    private identityAddress: string | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    public connect(token: string, identityAddress: string) {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        this.token = token;
        this.identityAddress = identityAddress;

        console.log('[WS] Connecting...');
        this.ws = new WebSocket(`ws://localhost:8080/ws?token=${token}`);

        this.ws.onopen = this.handleOpen.bind(this);
        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.onclose = this.handleClose.bind(this);
        this.ws.onerror = this.handleError.bind(this);
    }

    public disconnect() {
        if (this.ws) {
            console.log('[WS] Disconnecting...');
            this.ws.close();
            this.ws = null;
        }
    }

    public sendMessage(to: string, content: string) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('[WS] Cannot send message, socket not open');
            return false;
        }

        if (!this.identityAddress) {
            console.error('[WS] Cannot send message, identity address missing');
            return false;
        }

        const payload: OutgoingMessage = {
            from: this.identityAddress,
            content,
            timestamp: Date.now()
        };

        try {
            this.ws.send(JSON.stringify(payload));

            // Update local store immediately for optimistic UI updates
            chatStore.addOutgoingMessage({
                to,
                content,
                timestamp: payload.timestamp,
                from: this.identityAddress
            });

            return true;
        } catch (e) {
            console.error('[WS] Failed to send message:', e);
            return false;
        }
    }

    private handleOpen() {
        console.log('[WS] Connected successfully');
        this.reconnectAttempts = 0;
    }

    private handleMessage(event: MessageEvent) {
        try {
            // The backend sends payloads that match IncomingMessage or OutgoingMessage structure
            // Wait we need to know who sent it. The backend structure is:
            // type IncomingMessage struct { To string, Content string }
            // This means when we RECEIVE it, the struct from backend perspective is `IncomingMessage` (from client to server)
            // Actually, if we read the prompt: 
            // "type OutgoingMessage struct { From string, Content string, Timestamp int64 }" 
            // is likely what the server SENDS to the client, effectively an incoming message for us.

            const payload = JSON.parse(event.data);

            if (payload.from && payload.content) {
                // Received a message from someone
                chatStore.addIncomingMessage({
                    from: payload.from,
                    content: payload.content
                });
            }
        } catch (e) {
            console.error('[WS] Failed to parse message:', e);
        }
    }

    private handleClose(event: CloseEvent) {
        console.log(`[WS] Connection closed: ${event.code} ${event.reason}`);
        this.ws = null;
        this.attemptReconnect();
    }

    private handleError(event: Event) {
        console.error('[WS] WebSocket error observed:', event);
    }

    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.token && this.identityAddress) {
            this.reconnectAttempts++;
            const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000); // Exponential backoff max 10s
            console.log(`[WS] Attempting to reconnect in ${timeout}ms... (Attempt ${this.reconnectAttempts})`);
            setTimeout(() => {
                this.connect(this.token!, this.identityAddress!);
            }, timeout);
        }
    }
}

export const wsService = new WSService();
