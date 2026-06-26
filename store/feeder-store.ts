import { create } from 'zustand';
import { Feeder } from '@/types';
import { apiClient } from '@/lib/api';
import mockFeeders from '@/data/feeders';

export interface FeederState {
  feeders: Feeder[];
  loading: boolean;
  error: string | null;
  fetchFeeders: () => Promise<void>;
  refreshFeeders: () => Promise<void>;
  clearFeeders: () => void;
}

export const useFeederStore = create<FeederState>((set) => ({
  feeders: [],
  loading: false,
  error: null,

  fetchFeeders: async () => {
    set({ loading: true });
    const response = await apiClient.get<Feeder[]>('/feeders');
    if (response.data) {
      set({ feeders: response.data, loading: false, error: null });
    } else {
      // Fall back to mock data if the store is empty
      set((state) => ({
        feeders: state.feeders.length === 0 ? mockFeeders : state.feeders,
        loading: false,
        error: response.error?.message ?? 'Failed to fetch feeders',
      }));
    }
  },

  refreshFeeders: async () => {
    set({ loading: true, error: null });
    const response = await apiClient.get<Feeder[]>('/feeders');
    if (response.data) {
      set({ feeders: response.data, loading: false, error: null });
    } else {
      set({
        loading: false,
        error: response.error?.message ?? 'Failed to fetch feeders',
      });
    }
  },

  clearFeeders: () => {
    set({ feeders: [], error: null });
  },
}));
