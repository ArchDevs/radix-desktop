import { writable } from 'svelte/store';

interface AuthState {
    identityAddress: string | null;
    jwtToken: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    identityAddress: null,
    jwtToken: null,
    isAuthenticated: false,
};

export const authStore = writable<AuthState>(initialState);

export function setIdentity(address: string) {
    authStore.update(state => ({ ...state, identityAddress: address }));
}

export function setAuthenticated(token: string) {
    authStore.update(state => ({ ...state, jwtToken: token, isAuthenticated: true }));
}

export function clearAuth() {
    authStore.set(initialState);
}
