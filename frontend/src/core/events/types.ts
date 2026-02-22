// ── Event Names ──────────────────────────────────────────────────────────────

export const Events = {
    // WebSocket connection lifecycle
    WS_OPEN: 'ws:connection:open',
    WS_CLOSE: 'ws:connection:close',
    WS_ERROR: 'ws:connection:error',
    WS_RECONNECTING: 'ws:connection:reconnecting',

    // Chat messages
    MESSAGE_INCOMING: 'ws:message:incoming',
    MESSAGE_OUTGOING: 'ws:message:outgoing',

    // Auth state
    AUTH_STATE_CHANGED: 'auth:state:changed',
} as const;

export type EventName = typeof Events[keyof typeof Events];

// ── Event Payloads ───────────────────────────────────────────────────────────

export interface EventPayloadMap {
    [Events.WS_OPEN]: void;
    [Events.WS_CLOSE]: { code: number; reason: string };
    [Events.WS_ERROR]: { error: Event };
    [Events.WS_RECONNECTING]: { attempt: number; maxAttempts: number };

    [Events.MESSAGE_INCOMING]: {
        id?: string;
        from: string;
        content: string;
        timestamp?: number;
    };
    [Events.MESSAGE_OUTGOING]: { to: string; content: string; timestamp: number; from: string };

    [Events.AUTH_STATE_CHANGED]: { state: string };
}
