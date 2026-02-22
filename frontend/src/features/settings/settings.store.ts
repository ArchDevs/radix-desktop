import { writable } from 'svelte/store';

export interface SettingsState {
    isOpen: boolean;
    isSaving: boolean;
    error: string | null;
    success: string | null;
}

const initialState: SettingsState = {
    isOpen: false,
    isSaving: false,
    error: null,
    success: null,
};

function createSettingsStore() {
    const { subscribe, set, update } = writable<SettingsState>(initialState);

    return {
        subscribe,

        open() {
            update(s => ({ ...s, isOpen: true, error: null, success: null }));
        },

        close() {
            update(s => ({ ...s, isOpen: false, error: null, success: null }));
        },

        startSaving() {
            update(s => ({ ...s, isSaving: true, error: null, success: null }));
        },

        saveSuccess(message = 'Settings saved') {
            update(s => ({ ...s, isSaving: false, success: message, error: null }));
        },

        saveError(error: string) {
            update(s => ({ ...s, isSaving: false, error, success: null }));
        },

        clearFeedback() {
            update(s => ({ ...s, error: null, success: null }));
        },
    };
}

export const settingsStore = createSettingsStore();
