import type { RadixAddress, JwtToken } from '$core/types/identity';

// ── FSM States ───────────────────────────────────────────────────────────────

export type AuthStateName =
    | 'initializing'
    | 'no_identity'
    | 'identity_ready'
    | 'generating'
    | 'authenticating'
    | 'authenticated'
    | 'error';

export interface AuthState {
    state: AuthStateName;
    address: RadixAddress | null;
    mnemonic: string | null;
    token: JwtToken | null;
    error: string | null;
}

// ── FSM Events ───────────────────────────────────────────────────────────────

export type AuthEvent =
    | { type: 'IDENTITY_FOUND'; address: RadixAddress }
    | { type: 'NO_IDENTITY' }
    | { type: 'START_GENERATE' }
    | { type: 'GENERATE_SUCCESS'; address: RadixAddress; mnemonic: string }
    | { type: 'START_AUTH' }
    | { type: 'AUTH_SUCCESS'; token: JwtToken; address: RadixAddress }
    | { type: 'CLEAR_SUCCESS' }
    | { type: 'ERROR'; error: string }
    | { type: 'RETRY' };
