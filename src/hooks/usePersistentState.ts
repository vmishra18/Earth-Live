import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(key)
      .then((stored) => {
        if (!active || stored == null) {
          return;
        }
        const parsed = JSON.parse(stored) as T;

        if (
          typeof initialValue === 'object' &&
          initialValue !== null &&
          !Array.isArray(initialValue) &&
          typeof parsed === 'object' &&
          parsed !== null &&
          !Array.isArray(parsed)
        ) {
          setValue({ ...(initialValue as Record<string, unknown>), ...(parsed as Record<string, unknown>) } as T);
          return;
        }

        setValue(parsed);
      })
      .finally(() => {
        if (active) {
          setHydrated(true);
        }
      });

    return () => {
      active = false;
    };
  }, [key]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {
      // Persistence failure should not block app usage.
    });
  }, [hydrated, key, value]);

  return [value, setValue, hydrated] as const;
}
