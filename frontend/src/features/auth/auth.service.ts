import { authStore } from './auth.store';
import {
    CreateIdentity,
    Authenticate,
    HasIdentity,
    GetAddress,
    ClearIdentity,
} from '../../../wailsjs/go/app/App';

// ── Auth Service ─────────────────────────────────────────────────────────────
// Orchestrates Wails backend calls and drives FSM transitions.
// Components call these functions — never the backend directly.

/** Check keyring for existing identity on app boot */
export async function initialize(): Promise<void> {
    try {
        const hasId = await HasIdentity();
        if (hasId) {
            const address = await GetAddress();
            authStore.send({ type: 'IDENTITY_FOUND', address });
        } else {
            authStore.send({ type: 'NO_IDENTITY' });
        }
    } catch {
        authStore.send({ type: 'NO_IDENTITY' });
    }
}

/** Generate a new ed25519 keypair and store in keyring */
export async function generateIdentity(): Promise<void> {
    authStore.send({ type: 'START_GENERATE' });
    try {
        const identity = await CreateIdentity();
        authStore.send({
            type: 'GENERATE_SUCCESS',
            address: identity.address,
            mnemonic: identity.mnemonic,
        });
    } catch (err: any) {
        const message = err?.toString?.().includes('not activatable')
            ? 'System keyring unavailable. Please install gnome-keyring or kwallet.'
            : `Identity generation failed: ${err}`;
        authStore.send({ type: 'ERROR', error: message });
    }
}

/** Challenge-response authentication flow */
export async function authenticate(): Promise<void> {
    authStore.send({ type: 'START_AUTH' });
    try {
        const token = await Authenticate();
        const address = await GetAddress();
        authStore.send({ type: 'AUTH_SUCCESS', token, address });
    } catch (err: any) {
        authStore.send({ type: 'ERROR', error: `Authentication failed: ${err}` });
    }
}

/** Wipe local identity from keyring */
export async function clearIdentity(): Promise<void> {
    try {
        await ClearIdentity();
        authStore.send({ type: 'CLEAR_SUCCESS' });
    } catch (err: any) {
        authStore.send({ type: 'ERROR', error: `Failed to clear identity: ${err}` });
    }
}

/** Return to previous valid state after error */
export function retry(): void {
    authStore.send({ type: 'RETRY' });
}
