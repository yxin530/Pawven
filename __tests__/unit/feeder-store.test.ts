import { useFeederStore } from '@/store/feeder-store';
import { apiClient } from '@/lib/api';
import { Feeder } from '@/types';

jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockFeeders: Feeder[] = [
  {
    id: '1',
    name: 'Park Feeder',
    location: { latitude: 1.3521, longitude: 103.8198, address: 'Central Park' },
    status: 'online',
    kibbleLevel: 75,
    lastDispensed: '2024-03-01T08:00:00Z',
    streamUrl: 'https://stream.example.com/feeder1',
  },
  {
    id: '2',
    name: 'Garden Feeder',
    location: { latitude: 1.3, longitude: 103.8, address: 'Botanic Gardens' },
    status: 'offline',
    kibbleLevel: 20,
    lastDispensed: null,
    streamUrl: null,
  },
];

describe('feeder-store', () => {
  beforeEach(() => {
    useFeederStore.setState({
      feeders: [],
      loading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty feeders, loading false, and null error', () => {
      const state = useFeederStore.getState();
      expect(state.feeders).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchFeeders', () => {
    it('should set feeders on successful fetch', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockFeeders,
        error: null,
      });

      await useFeederStore.getState().fetchFeeders();
      const state = useFeederStore.getState();

      expect(state.feeders).toEqual(mockFeeders);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(apiClient.get).toHaveBeenCalledWith('/feeders');
    });

    it('should set error on failed fetch without clearing existing feeders', async () => {
      // Pre-load some feeders
      useFeederStore.setState({ feeders: mockFeeders });

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: null,
        error: { statusCode: 500, message: 'Server error', retry: true },
      });

      await useFeederStore.getState().fetchFeeders();
      const state = useFeederStore.getState();

      // Key requirement 9.7: feeders should be preserved on error
      expect(state.feeders).toEqual(mockFeeders);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Server error');
    });

    it('should use default error message when error message is missing', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      await useFeederStore.getState().fetchFeeders();
      const state = useFeederStore.getState();

      expect(state.error).toBe('Failed to fetch feeders');
    });
  });

  describe('refreshFeeders', () => {
    it('should clear error before fetching', async () => {
      useFeederStore.setState({ error: 'previous error' });

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockFeeders,
        error: null,
      });

      await useFeederStore.getState().refreshFeeders();
      const state = useFeederStore.getState();

      expect(state.feeders).toEqual(mockFeeders);
      expect(state.error).toBeNull();
    });

    it('should set feeders on successful refresh', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockFeeders,
        error: null,
      });

      await useFeederStore.getState().refreshFeeders();
      const state = useFeederStore.getState();

      expect(state.feeders).toEqual(mockFeeders);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set error on failed refresh without clearing existing feeders', async () => {
      useFeederStore.setState({ feeders: mockFeeders });

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: null,
        error: { statusCode: 0, message: 'Network error', retry: true },
      });

      await useFeederStore.getState().refreshFeeders();
      const state = useFeederStore.getState();

      // Requirement 9.7: preserve previously loaded feeder data on error
      expect(state.feeders).toEqual(mockFeeders);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });

  describe('clearFeeders', () => {
    it('should clear feeders and error', () => {
      useFeederStore.setState({
        feeders: mockFeeders,
        error: 'some error',
      });

      useFeederStore.getState().clearFeeders();
      const state = useFeederStore.getState();

      expect(state.feeders).toEqual([]);
      expect(state.error).toBeNull();
    });
  });
});
