import { apiClient } from '$core/network/api';
import { searchStore } from './search.store';
import type { UserResponse } from '$features/identity/types';

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 300;

export function handleSearchInput(query: string): void {
    searchStore.setQuery(query);

    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    const trimmed = query.trim();
    if (!trimmed) {
        searchStore.setResults([]);
        return;
    }

    // Debounce API calls
    searchTimeout = setTimeout(async () => {
        try {
            const results = await apiClient.get<UserResponse[]>(`/search?q=${encodeURIComponent(trimmed)}`);
            // API might return null for empty slices, default to []
            searchStore.setResults(results || []);
        } catch (error: any) {
            console.error('[SearchService] Search failed:', error);
            searchStore.setError(error.message || 'Search failed');
        }
    }, DEBOUNCE_MS);
}

export function clearSearch(): void {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
        searchTimeout = null;
    }
    searchStore.clear();
}
