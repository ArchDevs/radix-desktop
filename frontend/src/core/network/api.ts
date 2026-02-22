import { get } from 'svelte/store';
import { authStore } from '$features/auth/auth.store';

const API_BASE_URL = 'http://localhost:8080/v1';

class ApiClient {
    private requestQueue: Promise<any> = Promise.resolve();
    private lastRequestTime = 0;
    private minRequestInterval = 100; // Minimum 100ms between requests

    private async requestWithRetry<T>(
        endpoint: string,
        options: RequestInit,
        retries = 3,
        backoff = 1000
    ): Promise<T> {
        const state = get(authStore);
        const token = state.token;

        const headers = new Headers(options.headers || {});
        headers.set('Content-Type', 'application/json');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const url = `${API_BASE_URL}${endpoint}`;

        // Rate limiting - ensure minimum interval between requests
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
        }
        this.lastRequestTime = Date.now();

        try {
            const response = await fetch(url, { ...options, headers });

            if (response.status === 429) {
                if (retries > 0) {
                    console.warn(`[API] Rate limited on ${endpoint}, retrying in ${backoff}ms (${retries} retries left)`);
                    await new Promise(resolve => setTimeout(resolve, backoff));
                    return this.requestWithRetry(endpoint, options, retries - 1, backoff * 2);
                }
                const errorText = await response.text().catch(() => 'Too many requests');
                throw new Error(`API Error 429: ${errorText}`);
            }

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                throw new Error(`API Error ${response.status}: ${errorText}`);
            }

            // Handle empty 204 No Content responses gracefully
            if (response.status === 204) {
                return {} as T;
            }

            return response.json();
        } catch (error) {
            if (error instanceof Error && error.message.includes('429')) {
                throw error;
            }
            // Network errors - retry with backoff
            if (retries > 0) {
                console.warn(`[API] Request failed on ${endpoint}, retrying in ${backoff}ms (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                return this.requestWithRetry(endpoint, options, retries - 1, backoff * 2);
            }
            throw error;
        }
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        // Queue requests to prevent concurrent requests that could trigger rate limiting
        const promise = this.requestQueue.then(() =>
            this.requestWithRetry<T>(endpoint, options)
        );
        this.requestQueue = promise.catch(() => Promise.resolve());
        return promise;
    }

    async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();
