import { Config } from '@/constants/Config';
import type { ApiResponse } from '@/types';

/**
 * Lazily retrieves the auth store to avoid circular dependency issues.
 * The auth store imports the API client, so we defer the import.
 */
function getAuthStore() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useAuthStore } = require('@/store/auth-store');
  return useAuthStore;
}

/**
 * Makes a fetch request with timeout support via AbortController.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Builds the request headers, injecting the Authorization token
 * when an active session exists.
 */
function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const authStore = getAuthStore();
    const state = authStore.getState();
    if (state.session && state.token) {
      headers['Authorization'] = `Bearer ${state.token}`;
    }
  } catch {
    // Auth store not yet available — skip auth header
  }

  return headers;
}

/**
 * Creates a network error response with statusCode 0.
 */
function networkError(message: string): ApiResponse<never> {
  return {
    data: null,
    error: {
      statusCode: 0,
      message,
      retry: true,
    },
  };
}

/**
 * Creates an HTTP error response from a non-2xx status.
 */
function httpError(statusCode: number, message: string, retry = false): ApiResponse<never> {
  return {
    data: null,
    error: {
      statusCode,
      message,
      retry,
    },
  };
}

/**
 * Core request function handling auth refresh, retries, and error mapping.
 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  const url = `${Config.API_BASE_URL}${path}`;

  const makeRequest = async (): Promise<Response> => {
    const headers = buildHeaders();
    const options: RequestInit = {
      method,
      headers,
    };

    if (body !== undefined && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    return fetchWithTimeout(url, options, Config.API_TIMEOUT);
  };

  try {
    let response = await makeRequest();

    // Handle 401: attempt token refresh and retry once
    if (response.status === 401) {
      try {
        const authStore = getAuthStore();
        await authStore.getState().refreshSession();

        // Retry with refreshed token
        response = await makeRequest();

        // If still unauthorized after refresh, sign out
        if (response.status === 401) {
          await authStore.getState().signOut();
          return httpError(401, 'Authentication failed after token refresh');
        }
      } catch {
        // Refresh failed — sign out and return error
        try {
          const authStore = getAuthStore();
          await authStore.getState().signOut();
        } catch {
          // Sign out may also fail — best effort
        }
        return httpError(401, 'Session expired. Please sign in again.');
      }
    }

    // Parse successful responses
    if (response.ok) {
      const data = (await response.json()) as T;
      return { data, error: null };
    }

    // Non-401 error responses — try to extract message from response body
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody && errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // Response body not parseable as JSON — use default message
    }

    return httpError(response.status, message);
  } catch (error: unknown) {
    // Network errors and timeouts
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return networkError('Request timed out after 30 seconds');
      }
      return networkError(error.message || 'Network request failed');
    }
    return networkError('An unexpected network error occurred');
  }
}

/**
 * API client with typed HTTP methods.
 * All methods return a structured ApiResponse<T> — never throw.
 */
export const apiClient = {
  /**
   * Performs a GET request to the given path.
   */
  get<T>(path: string): Promise<ApiResponse<T>> {
    return request<T>('GET', path);
  },

  /**
   * Performs a POST request to the given path with an optional body.
   */
  post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>('POST', path, body);
  },

  /**
   * Performs a PUT request to the given path with an optional body.
   */
  put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>('PUT', path, body);
  },

  /**
   * Performs a DELETE request to the given path.
   */
  delete<T>(path: string): Promise<ApiResponse<T>> {
    return request<T>('DELETE', path);
  },
};
