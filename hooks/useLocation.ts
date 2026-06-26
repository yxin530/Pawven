import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { GeoLocation } from '@/types';

interface UseLocationResult {
  location: GeoLocation | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
}

const LOCATION_TIMEOUT_MS = 10000;

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocation(null);
        setLoading(false);
        return;
      }

      const position = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Location request timed out')), LOCATION_TIMEOUT_MS)
        ),
      ]);

      if (position) {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } else {
        setLocation(null);
      }
    } catch (err) {
      setLocation(null);
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return { location, loading, error, requestPermission };
}
