import { create } from 'zustand';
import { Badge } from '@/types';
import { apiClient } from '@/lib/api';

export interface BadgeState {
  badges: Badge[];
  loading: boolean;
  error: string | null;
  fetchBadges: () => Promise<void>;
  refreshBadges: () => Promise<void>;
}

export const useBadgeStore = create<BadgeState>((set) => ({
  badges: [],
  loading: false,
  error: null,

  fetchBadges: async () => {
    set({ loading: true });
    const response = await apiClient.get<Badge[]>('/badges');
    if (response.data) {
      set({ badges: response.data, loading: false, error: null });
    } else {
      set({
        loading: false,
        error: response.error?.message ?? 'Failed to fetch badges',
      });
    }
  },

  refreshBadges: async () => {
    set({ loading: true, error: null });
    const response = await apiClient.get<Badge[]>('/badges');
    if (response.data) {
      set({ badges: response.data, loading: false, error: null });
    } else {
      set({
        loading: false,
        error: response.error?.message ?? 'Failed to fetch badges',
      });
    }
  },
}));
