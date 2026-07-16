'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  xp: number;
  streak: number;
  streakFreezes?: number;
  avatar?: string;
  enrolledLanguages?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isDark: boolean;
  _hasHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  toggleDark: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isDark: false,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      toggleDark: () =>
        set((state) => {
          const isDark = !state.isDark;
          if (typeof document !== 'undefined') {
            if (isDark) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
          }
          return { isDark };
        }),
    }),
    {
      name: 'lingoalb-auth',
      storage: createJSONStorage(() => {
        // Safe localStorage access — never crashes during SSR
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isDark: state.isDark,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          if (state.isDark && typeof document !== 'undefined') {
            document.documentElement.classList.add('dark');
          }
        }
      },
    }
  )
);
