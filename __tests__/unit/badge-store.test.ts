import { useBadgeStore } from '@/store/badge-store';
import { apiClient } from '@/lib/api';
import { Badge } from '@/types';

jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockBadges: Badge[] = [
  {
    id: '1',
    badgeId: 'first_feeder',
    name: 'First Feeder',
    description: 'First kibble purchase',
    iconUrl: 'https://example.com/badge1.png',
    unlockedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    badgeId: 'tnr_hero',
    name: 'TNR Hero',
    description: 'Complete first TNR request',
    iconUrl: 'https://example.com/badge2.png',
    unlockedAt: '2024-02-20T14:30:00Z',
  },
];

describe('badge-store', () => {
  beforeEach(() => {
    useBadgeStore.setState({
      badges: [],
      loading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty badges, loading false, and null error', () => {
      const state = useBadgeStore.getState();
      expect(state.badges).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchBadges', () => {
    it('should set badges on successful fetch', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockBadges,
        error: null,
      });

      await useBadgeStore.getState().fetchBadges();
      const state = useBadgeStore.getState();

      expect(state.badges).toEqual(mockBadges);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(apiClient.get).toHaveBeenCalledWith('/badges');
    });

    it('should set error on failed fetch without clearing existing badges', async () => {
      // Pre-load some badges
      useBadgeStore.setState({ badges: mockBadges });

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: null,
        error: { statusCode: 500, message: 'Server error', retry: true },
      });

      await useBadgeStore.getState().fetchBadges();
      const state = useBadgeStore.getState();

      // Key requirement: badges should be preserved on error
      expect(state.badges).toEqual(mockBadges);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Server error');
    });

    it('should use default error message when error message is missing', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      await useBadgeStore.getState().fetchBadges();
      const state = useBadgeStore.getState();

      expect(state.error).toBe('Failed to fetch badges');
    });
  });

  describe('refreshBadges', () => {
    it('should clear error before fetching', async () => {
      useBadgeStore.setState({ error: 'previous error' });

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockBadges,
        error: null,
      });

      await useBadgeStore.getState().refreshBadges();
      const state = useBadgeStore.getState();

      expect(state.badges).toEqual(mockBadges);
      expect(state.error).toBeNull();
    });

    it('should set badges on successful refresh', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockBadges,
        error: null,
      });

      await useBadgeStore.getState().refreshBadges();
      const state = useBadgeStore.getState();

      expect(state.badges).toEqual(mockBadges);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set error on failed refresh without clearing existing badges', async () => {
      useBadgeStore.setState({ badges: mockBadges });

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: null,
        error: { statusCode: 0, message: 'Network error', retry: true },
      });

      await useBadgeStore.getState().refreshBadges();
      const state = useBadgeStore.getState();

      expect(state.badges).toEqual(mockBadges);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });
});
