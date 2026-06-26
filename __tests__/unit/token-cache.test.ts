import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { tokenCache } from '../../lib/auth/token-cache';

jest.mock('expo-secure-store');

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('tokenCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on native platforms (default test env)', () => {
    it('should return a tokenCache object with getToken, saveToken, and clearToken', () => {
      expect(tokenCache).toBeDefined();
      expect(tokenCache!.getToken).toBeInstanceOf(Function);
      expect(tokenCache!.saveToken).toBeInstanceOf(Function);
      expect(tokenCache!.clearToken).toBeInstanceOf(Function);
    });

    it('getToken should return the stored value from SecureStore', async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue('test-token-value');

      const result = await tokenCache!.getToken('clerk-session-key');

      expect(mockedSecureStore.getItemAsync).toHaveBeenCalledWith('clerk-session-key');
      expect(result).toBe('test-token-value');
    });

    it('getToken should return null when no value is stored', async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue(null);

      const result = await tokenCache!.getToken('nonexistent-key');

      expect(result).toBeNull();
    });

    it('getToken should return null when SecureStore throws', async () => {
      mockedSecureStore.getItemAsync.mockRejectedValue(new Error('SecureStore error'));

      const result = await tokenCache!.getToken('failing-key');

      expect(result).toBeNull();
    });

    it('saveToken should persist the value to SecureStore', async () => {
      mockedSecureStore.setItemAsync.mockResolvedValue();

      await tokenCache!.saveToken('clerk-session-key', 'new-token');

      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith('clerk-session-key', 'new-token');
    });

    it('saveToken should not throw when SecureStore fails', async () => {
      mockedSecureStore.setItemAsync.mockRejectedValue(new Error('Write error'));

      await expect(tokenCache!.saveToken('key', 'value')).resolves.toBeUndefined();
    });

    it('clearToken should call deleteItemAsync on SecureStore', () => {
      mockedSecureStore.deleteItemAsync.mockResolvedValue();

      tokenCache!.clearToken!('clerk-session-key');

      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('clerk-session-key');
    });

    it('clearToken should not throw when SecureStore fails', () => {
      mockedSecureStore.deleteItemAsync.mockImplementation(() => {
        throw new Error('Delete error');
      });

      expect(() => tokenCache!.clearToken!('key')).not.toThrow();
    });
  });
});
