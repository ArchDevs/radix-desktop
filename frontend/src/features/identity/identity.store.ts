import { writable } from 'svelte/store';
import type { CurrentIdentity } from './types';

const initialState: CurrentIdentity = {
    address: null,
    username: null,
    displayName: null,
    createdAt: null,
    isHydrating: false,
    error: null,
};

function createIdentityStore() {
    const { subscribe, set, update } = writable<CurrentIdentity>(initialState);

    return {
        subscribe,

        startHydration() {
            update(s => ({ ...s, isHydrating: true, error: null }));
        },

        hydrateSuccess(data: { address: string; username: string; displayName: string; createdAt: Date }) {
            set({ ...data, isHydrating: false, error: null });
        },

        hydrateError(error: string) {
            update(s => ({ ...s, isHydrating: false, error }));
        },

        clear() {
            set(initialState);
        },
    };
}

export const identityStore = createIdentityStore();
