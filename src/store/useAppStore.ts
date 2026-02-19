import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GameSettings {
    speedOption: 'slow' | 'medium' | 'fast';
    pointOption: number;
}

interface AppState {
    // State
    isSoundOn: boolean;
    settings: GameSettings;

    // Actions
    toggleSound: () => void;
    setSoundOn: (on: boolean) => void;
    updateSettings: (settings: Partial<GameSettings>) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Initial state
            isSoundOn: true,
            settings: {
                speedOption: 'medium',
                pointOption: 10,
            },

            // Actions
            toggleSound: () => set((state) => ({ isSoundOn: !state.isSoundOn })),
            
            setSoundOn: (on) => set({ isSoundOn: on }),
            
            updateSettings: (newSettings) =>
                set((state) => ({
                    settings: { ...state.settings, ...newSettings },
                })),
        }),
        {
            name: 'pong-app-storage',
        }
    )
);
