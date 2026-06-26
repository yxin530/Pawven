import { useAuthStore } from '@/store/auth-store';

describe('auth-store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.setState({
      session: null,
      loading: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('should have null session, loading false, and null error', () => {
      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('signIn', () => {
    it('should set session on successful sign-in', async () => {
      await useAuthStore.getState().signIn('test@example.com', 'password123');
      const state = useAuthStore.getState();
      expect(state.session).not.toBeNull();
      expect(state.session?.email).toBe('test@example.com');
      expect(state.session?.role).toBe('standard');
      expect(state.session?.verified).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should clear previous error on new sign-in attempt', async () => {
      useAuthStore.setState({ error: 'previous error' });
      await useAuthStore.getState().signIn('user@test.com', 'pass');
      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should clear session to null', async () => {
      // Sign in first
      await useAuthStore.getState().signIn('test@example.com', 'password123');
      expect(useAuthStore.getState().session).not.toBeNull();

      // Sign out
      await useAuthStore.getState().signOut();
      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('refreshSession', () => {
    it('should keep existing session on refresh', async () => {
      await useAuthStore.getState().signIn('test@example.com', 'password123');
      const sessionBefore = useAuthStore.getState().session;

      await useAuthStore.getState().refreshSession();
      const state = useAuthStore.getState();
      expect(state.session).toEqual(sessionBefore);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should keep null session if not signed in', async () => {
      await useAuthStore.getState().refreshSession();
      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.loading).toBe(false);
    });
  });

  describe('getState accessor', () => {
    it('should provide non-hook access to store state', () => {
      const state = useAuthStore.getState();
      expect(state).toHaveProperty('session');
      expect(state).toHaveProperty('loading');
      expect(state).toHaveProperty('error');
      expect(state).toHaveProperty('signIn');
      expect(state).toHaveProperty('signOut');
      expect(state).toHaveProperty('refreshSession');
    });
  });
});
