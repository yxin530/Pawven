import { useTNRStore } from '@/store/tnr-store';
import { apiClient } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('tnr-store', () => {
  beforeEach(() => {
    useTNRStore.setState({ history: [], draft: null, loading: false, error: null });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty history, null draft, not loading, no error', () => {
      const state = useTNRStore.getState();
      expect(state.history).toEqual([]);
      expect(state.draft).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('createDraft', () => {
    it('should set draft with empty defaults', () => {
      useTNRStore.getState().createDraft();

      const state = useTNRStore.getState();
      expect(state.draft).toEqual({
        location: null,
        strayPhotoUrl: null,
        notes: '',
        activityType: null,
      });
    });
  });

  describe('updateDraft', () => {
    it('should merge partial fields into existing draft', () => {
      useTNRStore.getState().createDraft();
      useTNRStore.getState().updateDraft({ notes: 'Spotted near park' });

      const state = useTNRStore.getState();
      expect(state.draft).toEqual({
        location: null,
        strayPhotoUrl: null,
        notes: 'Spotted near park',
        activityType: null,
      });
    });

    it('should only modify specified fields, leaving others unchanged', () => {
      useTNRStore.getState().createDraft();
      useTNRStore.getState().updateDraft({ activityType: 'sighting' });

      const state = useTNRStore.getState();
      expect(state.draft!.notes).toBe('');
      expect(state.draft!.location).toBeNull();
      expect(state.draft!.strayPhotoUrl).toBeNull();
      expect(state.draft!.activityType).toBe('sighting');
    });

    it('should do nothing if draft is null', () => {
      useTNRStore.getState().updateDraft({ notes: 'No draft exists' });

      const state = useTNRStore.getState();
      expect(state.draft).toBeNull();
    });
  });

  describe('discardDraft', () => {
    it('should set draft to null', () => {
      useTNRStore.getState().createDraft();
      useTNRStore.getState().discardDraft();

      const state = useTNRStore.getState();
      expect(state.draft).toBeNull();
    });
  });

  describe('submitReport', () => {
    it('should move draft to history on success', async () => {
      useTNRStore.getState().createDraft();
      useTNRStore.getState().updateDraft({
        activityType: 'trapped',
        notes: 'Found near alley',
        location: { latitude: 40.7128, longitude: -74.006, address: 'NYC' },
      });

      const mockReport = {
        id: 'report-1',
        strayPhotoUrl: '',
        location: { latitude: 40.7128, longitude: -74.006, address: 'NYC' },
        notes: 'Found near alley',
        activityType: 'trapped' as const,
        status: 'open' as const,
        reportedBy: 'user-1',
        assignedTo: null,
        createdAt: '2024-01-01T00:00:00Z',
      };

      mockedApiClient.post.mockResolvedValue({ data: mockReport, error: null });

      await useTNRStore.getState().submitReport();

      const state = useTNRStore.getState();
      expect(state.history).toHaveLength(1);
      expect(state.history[0].id).toBe('report-1');
      expect(state.draft).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set error and preserve draft on API failure', async () => {
      useTNRStore.getState().createDraft();
      useTNRStore.getState().updateDraft({ notes: 'Test note' });

      mockedApiClient.post.mockResolvedValue({
        data: null,
        error: { statusCode: 500, message: 'Server error', retry: true },
      });

      await useTNRStore.getState().submitReport();

      const state = useTNRStore.getState();
      expect(state.history).toHaveLength(0);
      expect(state.draft).not.toBeNull();
      expect(state.draft!.notes).toBe('Test note');
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Server error');
    });

    it('should set error and preserve draft on network exception', async () => {
      useTNRStore.getState().createDraft();
      useTNRStore.getState().updateDraft({ activityType: 'feeding' });

      mockedApiClient.post.mockRejectedValue(new Error('Network failure'));

      await useTNRStore.getState().submitReport();

      const state = useTNRStore.getState();
      expect(state.history).toHaveLength(0);
      expect(state.draft).not.toBeNull();
      expect(state.draft!.activityType).toBe('feeding');
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network failure');
    });

    it('should do nothing if draft is null', async () => {
      await useTNRStore.getState().submitReport();

      const state = useTNRStore.getState();
      expect(state.history).toHaveLength(0);
      expect(state.loading).toBe(false);
      expect(mockedApiClient.post).not.toHaveBeenCalled();
    });
  });
});
