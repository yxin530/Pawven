import { create } from 'zustand';
import { TNRReport, TNRDraft } from '@/types';
import { apiClient } from '@/lib/api';

export interface TNRState {
  history: TNRReport[];
  draft: TNRDraft | null;
  loading: boolean;
  error: string | null;
  createDraft: () => void;
  updateDraft: (fields: Partial<TNRDraft>) => void;
  discardDraft: () => void;
  submitReport: () => Promise<void>;
}

export const useTNRStore = create<TNRState>((set, get) => ({
  history: [],
  draft: null,
  loading: false,
  error: null,

  createDraft: () => {
    set({
      draft: {
        location: null,
        strayPhotoUrl: null,
        notes: '',
        activityType: null,
      },
    });
  },

  updateDraft: (fields: Partial<TNRDraft>) => {
    const currentDraft = get().draft;
    if (currentDraft) {
      set({ draft: { ...currentDraft, ...fields } });
    }
  },

  discardDraft: () => {
    set({ draft: null });
  },

  submitReport: async () => {
    const draft = get().draft;
    if (!draft) return;

    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<TNRReport>('/report', draft);
      if (response.error) {
        set({ loading: false, error: response.error.message });
        return;
      }
      if (response.data) {
        set((state) => ({
          history: [...state.history, response.data!],
          draft: null,
          loading: false,
          error: null,
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit report';
      set({ loading: false, error: message });
    }
  },
}));
