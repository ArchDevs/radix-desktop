import { writable } from 'svelte/store';
import { eventBus } from '$core/events/bus';
import { Events } from '$core/events/types';
import type { ConnectionState } from './types';

export const connectionState = writable<ConnectionState>('idle');

class WSService {
    private ws: WebSocket | null = null;
    private token: string | null = null;
    private identityAddress: string | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    connect(token: string, identityAddress: string): void {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        this.token = token;
        this.identityAddress = identityAddress;

        connectionState.set('connecting');
        console.log('[WS] Connecting...');

        this.ws = new WebSocket(`ws://localhost:8080/v1/ws?token=${token}`);
        this.ws.onopen = this.handleOpen.bind(this);
        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.onclose = this.handleClose.bind(this);
        this.ws.onerror = this.handleError.bind(this);
    }

    disconnect(): void {
        if (this.ws) {
            console.log('[WS] Disconnecting...');
            this.ws.close();
            this.ws = null;
        }
        connectionState.set('disconnected');
    }

    send(payload: object): boolean {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('[WS] Cannot send, socket not open');
            return false;
        }

        try {
            this.ws.send(JSON.stringify(payload));
            return true;
        } catch (e) {
            console.error('[WS] Send failed:', e);
            return false;
        }
    }

    getIdentityAddress(): string | null {
        return this.identityAddress;
    }

    // ── Private ──────────────────────────────────────────────────────────────

    private handleOpen(): void {
        console.log('[WS] Connected');
        this.reconnectAttempts = 0;
        connectionState.set('connected');
        eventBus.emit(Events.WS_OPEN);
    }

    private handleMessage(event: MessageEvent): void {
        try {
            const payload = JSON.parse(event.data);
            if (payload.from && payload.content) {
                eventBus.emit(Events.MESSAGE_INCOMING, {
                    from: payload.from,
                    content: payload.content,
                    timestamp: payload.timestamp || Date.now(),
                });
            }
        } catch (e) {
            console.error('[WS] Failed to parse message:', e);
        }
    }

    private handleClose(event: CloseEvent): void {
        console.log(`[WS] Closed: ${event.code} ${event.reason}`);
        this.ws = null;
        this.attemptReconnect();
    }

    private handleError(event: Event): void {
        console.error('[WS] Error:', event);
        eventBus.emit(Events.WS_ERROR, { error: event });
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.token && this.identityAddress) {
            this.reconnectAttempts++;
            connectionState.set('reconnecting');
            eventBus.emit(Events.WS_RECONNECTING, {
                attempt: this.reconnectAttempts,
                maxAttempts: this.maxReconnectAttempts,
            });

            const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
            console.log(`[WS] Reconnecting in ${timeout}ms (attempt ${this.reconnectAttempts})`);
            setTimeout(() => this.connect(this.token!, this.identityAddress!), timeout);
        } else {
            connectionState.set('failed');
            eventBus.emit(Events.WS_CLOSE, { code: 0, reason: 'max reconnect attempts exceeded' });
        }
    }
}

export const wsService = new WSService();
