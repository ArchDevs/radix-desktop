import { writable } from 'svelte/store';
import type { SearchState } from './types';
import type { UserResponse } from '$features/identity/types';

const initialState: SearchState = {
    query: '',
    results: [],
    isSearching: false,
    error: null,
};

function createSearchStore() {
    const { subscribe, set, update } = writable<SearchState>(initialState);

    return {
        subscribe,

        setQuery(query: string) {
            update(s => ({ ...s, query, isSearching: query.trim().length > 0, error: null }));
        },

        setResults(results: UserResponse[]) {
            update(s => ({ ...s, results, isSearching: false, error: null }));
        },

        setError(error: string) {
            update(s => ({ ...s, error, isSearching: false, results: [] }));
        },

        clear() {
            set(initialState);
        },
    };
}

export const searchStore = createSearchStore();
