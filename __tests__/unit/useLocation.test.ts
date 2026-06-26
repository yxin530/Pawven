import { renderHook, waitFor, act } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { useLocation } from '../../hooks/useLocation';

jest.mock('expo-location');

const mockedLocation = Location as jest.Mocked<typeof Location>;

describe('useLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return location on permission granted and position retrieved', async () => {
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted' as any,
      granted: true,
      canAskAgain: true,
      expires: 'never',
    });
    mockedLocation.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: 3.139,
        longitude: 101.6869,
        altitude: null,
        accuracy: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    });

    const { result } = renderHook(() => useLocation());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.location).toEqual({
      latitude: 3.139,
      longitude: 101.6869,
    });
    expect(result.current.error).toBeNull();
  });

  it('should return null location on permission denied', async () => {
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'denied' as any,
      granted: false,
      canAskAgain: true,
      expires: 'never',
    });

    const { result } = renderHook(() => useLocation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.location).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should return null location on timeout', async () => {
    jest.useRealTimers();

    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted' as any,
      granted: true,
      canAskAgain: true,
      expires: 'never',
    });
    // Simulate a timeout by rejecting after a short delay
    mockedLocation.getCurrentPositionAsync.mockImplementation(
      () => new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Location request timed out')), 50);
      })
    );

    const { result } = renderHook(() => useLocation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.location).toBeNull();
    expect(result.current.error).toBe('Location request timed out');
  });

  it('should allow re-requesting permission via requestPermission', async () => {
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'denied' as any,
      granted: false,
      canAskAgain: true,
      expires: 'never',
    });

    const { result } = renderHook(() => useLocation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.location).toBeNull();

    // Now simulate granting on retry
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted' as any,
      granted: true,
      canAskAgain: true,
      expires: 'never',
    });
    mockedLocation.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: 1.3521,
        longitude: 103.8198,
        altitude: null,
        accuracy: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    });

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.location).toEqual({
      latitude: 1.3521,
      longitude: 103.8198,
    });
    expect(result.current.error).toBeNull();
  });

  it('should handle getCurrentPositionAsync throwing an error', async () => {
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted' as any,
      granted: true,
      canAskAgain: true,
      expires: 'never',
    });
    mockedLocation.getCurrentPositionAsync.mockRejectedValue(
      new Error('GPS unavailable')
    );

    const { result } = renderHook(() => useLocation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.location).toBeNull();
    expect(result.current.error).toBe('GPS unavailable');
  });
});
