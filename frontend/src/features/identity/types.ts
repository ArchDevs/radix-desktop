export interface UserResponse {
    address: string;
    username: string;
    display_name: string;
    created_at: string; // ISO timestamp string from backend
}

export interface CurrentIdentity {
    address: string | null;
    username: string | null;
    displayName: string | null;
    createdAt: Date | null;
    isHydrating: boolean;
    error: string | null;
}
