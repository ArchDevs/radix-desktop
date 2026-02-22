import { apiClient } from '$core/network/api';
import { settingsStore } from './settings.store';
import { identityStore } from '$features/identity/identity.store';
import type { UserResponse } from '$features/identity/types';

export async function updateUsername(username: string): Promise<void> {
    const trimmed = username.trim();
    if (!trimmed) {
        settingsStore.saveError('Username cannot be empty');
        return;
    }

    settingsStore.startSaving();
    try {
        const updated = await apiClient.post<UserResponse>('/me/username', { username: trimmed });

        // Update the identity store with new profile data
        identityStore.hydrateSuccess({
            address: updated.address,
            username: updated.username,
            displayName: updated.display_name,
            createdAt: new Date(updated.created_at || Date.now()),
        });

        settingsStore.saveSuccess('Username updated');
    } catch (error: any) {
        console.error('[SettingsService] Failed to update username:', error);
        settingsStore.saveError(error.message || 'Failed to update username');
    }
}
