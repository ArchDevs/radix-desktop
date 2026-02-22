import { writable, derived, get } from 'svelte/store';
import type { AuthState, AuthEvent, AuthStateName } from './types';
import { eventBus } from '$core/events/bus';
import { Events } from '$core/events/types';

// ── Initial State ────────────────────────────────────────────────────────────

const initialState: AuthState = {
    state: 'initializing',
    address: null,
    mnemonic: null,
    token: null,
    error: null,
};

// ── FSM Transition ───────────────────────────────────────────────────────────

function transition(current: AuthState, event: AuthEvent): AuthState {
    switch (event.type) {
        case 'IDENTITY_FOUND':
            return { ...current, state: 'identity_ready', address: event.address, error: null };
        case 'NO_IDENTITY':
            return { ...current, state: 'no_identity', error: null };
        case 'START_GENERATE':
            return { ...current, state: 'generating', error: null };
        case 'GENERATE_SUCCESS':
            return { ...current, state: 'identity_ready', address: event.address, mnemonic: event.mnemonic, error: null };
        case 'START_AUTH':
            return { ...current, state: 'authenticating', error: null };
        case 'AUTH_SUCCESS':
            return { ...current, state: 'authenticated', token: event.token, address: event.address, mnemonic: null, error: null };
        case 'CLEAR_SUCCESS':
            return { ...initialState, state: 'no_identity' };
        case 'ERROR':
            return { ...current, state: 'error', error: event.error };
        case 'RETRY':
            return { ...current, state: current.address ? 'identity_ready' : 'no_identity', error: null };
        default:
            return current;
    }
}

// ── Store ────────────────────────────────────────────────────────────────────

function createAuthStore() {
    const { subscribe, set, update } = writable<AuthState>(initialState);

    return {
        subscribe,

        /** Dispatch a typed FSM event */
        send(event: AuthEvent) {
            update(current => {
                const next = transition(current, event);

                // Side effects based on state changes
                if (next.state !== current.state) {
                    eventBus.emit(Events.AUTH_STATE_CHANGED, { state: next.state });

                    // Trigger identity hydration on auth success
                    if (next.state === 'authenticated') {
                        import('$features/identity/identity.service').then(m => m.hydrateProfile());
                    } else if (next.state === 'no_identity' || next.state === 'error') {
                        import('$features/identity/identity.service').then(m => m.clearProfile());
                    }
                }

                return next;
            });
        },

        /** Check if currently in a given state */
        is(stateName: AuthStateName): boolean {
            return get({ subscribe }).state === stateName;
        },

        /** Reset to initial state */
        reset() {
            set(initialState);
        },
    };
}

export const authStore = createAuthStore();

// ── Derived Convenience Stores ───────────────────────────────────────────────

export const isAuthenticated = derived(authStore, $s => $s.state === 'authenticated');
export const authStateName = derived(authStore, $s => $s.state);
