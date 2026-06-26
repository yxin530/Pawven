import { create } from 'zustand';
import { User } from '@/types';

export interface AuthState {
  session: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  token: null,
  loading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      // Placeholder: Clerk integration will be wired later.
      // For now, simulate a successful sign-in by setting a mock session.
      const user: User = {
        id: 'placeholder-id',
        email,
        name: email.split('@')[0],
        role: 'standard',
        imageUrl: null,
        verified: true,
      };
      set({ session: user, token: 'placeholder-token', loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      set({ loading: false, error: message });
    }
  },

  signOut: async () => {
    set({ session: null, token: null, loading: false, error: null });
  },

  refreshSession: async () => {
    set({ loading: true, error: null });
    try {
      // Placeholder: Clerk session refresh will be wired later.
      // For now, if there's an existing session, keep it.
      const currentSession = useAuthStore.getState().session;
      set({ session: currentSession, token: 'refreshed-token', loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Session refresh failed';
      set({ loading: false, error: message });
    }
  },
}));
