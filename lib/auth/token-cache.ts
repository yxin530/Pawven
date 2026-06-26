import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { TokenCache } from '@clerk/clerk-expo/dist/cache/types';

/**
 * Retrieves a token from SecureStore by key.
 * Returns null if the token doesn't exist or retrieval fails.
 */
async function getToken(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

/**
 * Persists a token to SecureStore with the given key.
 * Silently handles errors to avoid crashing the auth flow.
 */
async function saveToken(key: string, token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, token);
  } catch {
    // SecureStore may fail on certain platforms or in edge cases.
    // We swallow the error to avoid disrupting authentication.
  }
}

/**
 * Removes a token from SecureStore by key.
 * Used to clear cached tokens on sign-out or session expiry.
 */
function clearToken(key: string): void {
  try {
    SecureStore.deleteItemAsync(key);
  } catch {
    // Best-effort deletion — failure is non-critical.
  }
}

/**
 * Token cache conforming to Clerk's TokenCache interface.
 * Uses expo-secure-store to persist authentication tokens across app restarts.
 * Returns undefined on web where SecureStore is not available.
 */
export const tokenCache: TokenCache | undefined =
  Platform.OS !== 'web'
    ? {
        getToken,
        saveToken,
        clearToken,
      }
    : undefined;
