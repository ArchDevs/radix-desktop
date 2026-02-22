import { apiClient } from '$core/network/api';
import { identityStore } from './identity.store';
import type { UserResponse } from './types';

function safeDate(value: any): Date {
    if (!value) return new Date();
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
}

export async function hydrateProfile(): Promise<void> {
    identityStore.startHydration();
    try {
        const profile = await apiClient.get<UserResponse>('/me');

        identityStore.hydrateSuccess({
            address: profile.address,
            username: profile.username,
            displayName: profile.display_name,
            createdAt: safeDate(profile.created_at),
        });
    } catch (error: any) {
        if (error.message?.includes('429')) {
            console.warn('[IdentityService] Rate limited while fetching profile, will retry later');
            identityStore.hydrateError('Rate limited - retrying...');
            return;
        }
        console.error('[IdentityService] Failed to fetch profile:', error);
        identityStore.hydrateError(error.message || 'Failed to fetch identity profile');
    }
}

export function clearProfile(): void {
    identityStore.clear();
}
