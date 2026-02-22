import type { EventName, EventPayloadMap } from './types';

type Handler<T> = (payload: T) => void;

class EventBus {
    private handlers: Map<string, Set<Handler<any>>> = new Map();

    on<E extends EventName>(event: E, handler: Handler<EventPayloadMap[E]>): () => void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event)!.add(handler);

        // Return unsubscribe function
        return () => this.off(event, handler);
    }

    off<E extends EventName>(event: E, handler: Handler<EventPayloadMap[E]>): void {
        this.handlers.get(event)?.delete(handler);
    }

    emit<E extends EventName>(event: E, ...args: EventPayloadMap[E] extends void ? [] : [EventPayloadMap[E]]): void {
        const payload = args[0];
        this.handlers.get(event)?.forEach(handler => {
            try {
                handler(payload);
            } catch (err) {
                console.error(`[EventBus] Error in handler for "${event}":`, err);
            }
        });
    }
}

export const eventBus = new EventBus();
