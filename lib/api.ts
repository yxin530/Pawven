/**
 * API Client with authentication header injection.
 * Wraps fetch() to automatically include the Bearer token when available.
 */

import { Config } from '@/constants/Config';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Get the current auth token.
 * In production, this would come from Clerk's session.
 * In dev mode, we use a mock token stored globally.
 */
function getAuthToken(): string | null {
  return (global as any).__pawven_auth_token || null;
}

/**
 * Authenticated fetch wrapper.
 * - Prepends API_BASE_URL if path doesn't start with http
 * - Adds Authorization header if token available
 * - Adds Content-Type: application/json for POST/PATCH/PUT
 * - Implements timeout (default 30s)
 */
export async function apiFetch<T = any>(
  path: string,
  options: FetchOptions = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const url = path.startsWith('http') ? path : `${Config.API_BASE_URL}${path}`;
  const token = getAuthToken();
  const timeout = options.timeout || Config.API_TIMEOUT;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Add auth header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add content-type for mutation requests
  if (['POST', 'PATCH', 'PUT'].includes(options.method || '')) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: response.statusText }));
      return {
        data: null,
        error: errorBody.error || `Request failed with status ${response.status}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return { data, error: null, status: response.status };
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      return { data: null, error: 'Request timed out', status: 0 };
    }

    return { data: null, error: err.message || 'Network error', status: 0 };
  }
}

/**
 * Convenience methods
 */
export const api = {
  get: <T = any>(path: string) => apiFetch<T>(path, { method: 'GET' }),

  post: <T = any>(path: string, body?: any) =>
    apiFetch<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  patch: <T = any>(path: string, body?: any) =>
    apiFetch<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),

  delete: <T = any>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};


/**
 * Legacy-compatible apiClient export.
 * Stores use `apiClient.get<T>()` which returns `{ data: T | null, error: { message: string } | null }`.
 */
export const apiClient = {
  get: async <T = any>(path: string) => {
    const result = await apiFetch<T>(path, { method: 'GET' });
    return {
      data: result.data,
      error: result.error ? { message: result.error, statusCode: result.status, retry: result.status === 0 } : null,
    };
  },

  post: async <T = any>(path: string, body?: any) => {
    const result = await apiFetch<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
    return {
      data: result.data,
      error: result.error ? { message: result.error, statusCode: result.status, retry: result.status === 0 } : null,
    };
  },

  patch: async <T = any>(path: string, body?: any) => {
    const result = await apiFetch<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
    return {
      data: result.data,
      error: result.error ? { message: result.error, statusCode: result.status, retry: result.status === 0 } : null,
    };
  },
};
