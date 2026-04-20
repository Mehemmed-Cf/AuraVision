import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MobilityProfile =
  | 'wheelchair'
  | 'visual'
  | 'respiratory'
  | 'stroller'
  | 'standard';

export interface User {
  id: string;
  name: string;
  email: string;
  mobilityProfile: MobilityProfile;
  reportsSubmitted: number;
  votesContributed: number;
  joinedAt: string;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    mobilityProfile: MobilityProfile,
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  incrementReportsSubmitted: () => void;
  incrementVotesContributed: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        await delay(1000);
        const trimmed = email.trim();
        if (password.length < 8) {
          set({ isLoading: false, error: 'Şifrə ən az 8 simvol olmalıdır' });
          return;
        }
        const local = trimmed.split('@')[0]?.replace(/\./g, ' ') ?? 'İstifadəçi';
        const user: User = {
          id: crypto.randomUUID(),
          name: local.charAt(0).toUpperCase() + local.slice(1),
          email: trimmed,
          mobilityProfile: 'standard',
          reportsSubmitted: 0,
          votesContributed: 0,
          joinedAt: new Date().toISOString(),
        };
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      register: async (name, email, _password, mobilityProfile) => {
        set({ isLoading: true, error: null });
        await delay(1000);
        const trimmedEmail = email.trim();
        const user: User = {
          id: crypto.randomUUID(),
          name: name.trim(),
          email: trimmedEmail,
          mobilityProfile,
          reportsSubmitted: 0,
          votesContributed: 0,
          joinedAt: new Date().toISOString(),
        };
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      incrementReportsSubmitted: () => {
        const u = get().user;
        if (!u) return;
        set({
          user: { ...u, reportsSubmitted: u.reportsSubmitted + 1 },
        });
      },

      incrementVotesContributed: () => {
        const u = get().user;
        if (!u) return;
        set({
          user: { ...u, votesContributed: u.votesContributed + 1 },
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },
    }),
    {
      name: 'aura-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
