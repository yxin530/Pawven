import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset auth store to clean state
    useAuthStore.setState({
      session: null,
      token: null,
      loading: false,
      error: null,
    });
  });

  describe('HTTP methods', () => {
    it('should make a GET request to the correct URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ items: [] }),
      });

      const result = await apiClient.get('/feeders');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/feeders',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result.data).toEqual({ items: [] });
      expect(result.error).toBeNull();
    });

    it('should make a POST request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: '123' }),
      });

      const body = { name: 'Test Report' };
      const result = await apiClient.post('/reports', body);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/reports',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
      expect(result.data).toEqual({ id: '123' });
      expect(result.error).toBeNull();
    });

    it('should make a PUT request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ updated: true }),
      });

      const body = { status: 'completed' };
      const result = await apiClient.put('/reports/123', body);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/reports/123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(body),
        })
      );
      expect(result.data).toEqual({ updated: true });
      expect(result.error).toBeNull();
    });

    it('should make a DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ deleted: true }),
      });

      const result = await apiClient.delete('/reports/123');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/reports/123',
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result.data).toEqual({ deleted: true });
      expect(result.error).toBeNull();
    });
  });

  describe('Authorization header injection', () => {
    it('should include Authorization header when session is active', async () => {
      useAuthStore.setState({
        session: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test',
          role: 'standard',
          imageUrl: null,
          verified: true,
        },
        token: 'my-auth-token',
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await apiClient.get('/feeders');

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1].headers['Authorization']).toBe('Bearer my-auth-token');
    });

    it('should NOT include Authorization header when no session', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await apiClient.get('/feeders');

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1].headers['Authorization']).toBeUndefined();
    });
  });

  describe('401 handling with token refresh', () => {
    it('should refresh token and retry on 401', async () => {
      useAuthStore.setState({
        session: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test',
          role: 'standard',
          imageUrl: null,
          verified: true,
        },
        token: 'expired-token',
      });

      // First call returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      // After refresh, retry succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const result = await apiClient.get('/protected');

      // fetch should have been called twice (original + retry)
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual({ data: 'success' });
      expect(result.error).toBeNull();
    });

    it('should sign out if retry still returns 401', async () => {
      useAuthStore.setState({
        session: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test',
          role: 'standard',
          imageUrl: null,
          verified: true,
        },
        token: 'expired-token',
      });

      // Both calls return 401
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      const result = await apiClient.get('/protected');

      // Should have signed out (session cleared)
      expect(useAuthStore.getState().session).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error!.statusCode).toBe(401);
    });

    it('should sign out if refresh throws', async () => {
      const mockRefresh = jest.fn().mockRejectedValue(new Error('Refresh failed'));
      const mockSignOut = jest.fn().mockResolvedValue(undefined);

      useAuthStore.setState({
        session: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test',
          role: 'standard',
          imageUrl: null,
          verified: true,
        },
        token: 'expired-token',
        refreshSession: mockRefresh,
        signOut: mockSignOut,
      });

      // First call returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      const result = await apiClient.get('/protected');

      expect(mockRefresh).toHaveBeenCalled();
      expect(mockSignOut).toHaveBeenCalled();
      expect(result.error).not.toBeNull();
      expect(result.error!.statusCode).toBe(401);
    });
  });

  describe('Network errors and timeout', () => {
    it('should return statusCode 0 for network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

      const result = await apiClient.get('/feeders');

      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error!.statusCode).toBe(0);
      expect(result.error!.message).toBe('Network request failed');
      expect(result.error!.retry).toBe(true);
    });

    it('should return statusCode 0 with timeout message for AbortError', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      const result = await apiClient.get('/feeders');

      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error!.statusCode).toBe(0);
      expect(result.error!.message).toContain('timed out');
      expect(result.error!.retry).toBe(true);
    });

    it('should return statusCode 0 for unknown thrown values', async () => {
      mockFetch.mockRejectedValueOnce('string-error');

      const result = await apiClient.get('/feeders');

      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error!.statusCode).toBe(0);
      expect(result.error!.retry).toBe(true);
    });
  });

  describe('HTTP error responses', () => {
    it('should return structured error for 4xx responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      });

      const result = await apiClient.get('/nonexistent');

      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error!.statusCode).toBe(404);
      expect(result.error!.message).toBe('Not found');
      expect(result.error!.retry).toBe(false);
    });

    it('should return structured error for 5xx responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      });

      const result = await apiClient.get('/feeders');

      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error!.statusCode).toBe(500);
      expect(result.error!.message).toBe('Internal server error');
      expect(result.error!.retry).toBe(false);
    });

    it('should handle non-JSON error response bodies gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: async () => { throw new Error('Not JSON'); },
      });

      const result = await apiClient.get('/feeders');

      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error!.statusCode).toBe(502);
      expect(result.error!.message).toContain('502');
    });
  });
});
