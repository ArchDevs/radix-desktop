import type { UserResponse } from '$features/identity/types';

export interface SearchState {
    query: string;
    results: UserResponse[];
    isSearching: boolean;
    error: string | null;
}
