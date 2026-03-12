import { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  applyLiveData,
  createInitialSnapshot,
  createNextSnapshot,
  formatRelativeTime,
  type DashboardSnapshot,
  type DataMode,
} from '../data/liveEarth';
import { fetchLiveDataPatch } from '../services/liveFeeds';

type UseDashboardDataOptions = {
  dataMode: DataMode;
  refreshRate: 'normal' | 'fast';
};

type DashboardCache = {
  snapshot: DashboardSnapshot;
  previousSnapshot: DashboardSnapshot;
  history: DashboardSnapshot[];
};

const HISTORY_LIMIT = 24;

function storageKey(mode: DataMode) {
  return `live-earth-dashboard-cache-${mode}`;
}

function createSeed(mode: DataMode): DashboardCache {
  const initial = createInitialSnapshot(mode);
  return {
    snapshot: initial,
    previousSnapshot: initial,
    history: [initial],
  };
}

async function readStoredCache(mode: DataMode) {
  try {
    const stored = await AsyncStorage.getItem(storageKey(mode));
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as DashboardCache;
  } catch {
    return null;
  }
}

async function persistCache(mode: DataMode, value: DashboardCache) {
  try {
    await AsyncStorage.setItem(storageKey(mode), JSON.stringify(value));
  } catch {
    // Ignore persistence issues.
  }
}

export function useDashboardData({ dataMode, refreshRate }: UseDashboardDataOptions) {
  const queryClient = useQueryClient();
  const [restoredCache, setRestoredCache] = useState<DashboardCache | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    setHydrated(false);

    readStoredCache(dataMode)
      .then((cached) => {
        if (!active) {
          return;
        }
        setRestoredCache(cached);
        if (cached) {
          queryClient.setQueryData(['dashboard', dataMode], cached);
        }
      })
      .finally(() => {
        if (active) {
          setHydrated(true);
        }
      });

    return () => {
      active = false;
    };
  }, [dataMode, queryClient]);

  const query = useQuery<DashboardCache>({
    queryKey: ['dashboard', dataMode],
    enabled: hydrated,
    gcTime: 1000 * 60 * 60 * 6,
    staleTime: refreshRate === 'fast' ? 900 : 2400,
    retry: dataMode === 'demo' ? 0 : 1,
    placeholderData: (previousData) => previousData ?? restoredCache ?? undefined,
    refetchInterval: refreshRate === 'fast' ? 1800 : 4200,
    queryFn: async () => {
      const current =
        (queryClient.getQueryData<DashboardCache>(['dashboard', dataMode]) ?? restoredCache ?? createSeed(dataMode));
      const nextBase = createNextSnapshot(current.snapshot, dataMode);
      let resolved = nextBase;

      if (dataMode !== 'demo') {
        try {
          const patch = await fetchLiveDataPatch();
          if (patch) {
            resolved = applyLiveData(nextBase, patch, dataMode);
          } else {
            resolved = {
              ...nextBase,
              sourceStatus: {
                ...nextBase.sourceStatus,
                mode: dataMode,
                label: dataMode === 'live' ? 'LIVE FALLBACK' : 'AUTO DEMO',
                detail: 'Live endpoints unavailable. Using generated telemetry cache.',
              },
            };
          }
        } catch {
          resolved = {
            ...nextBase,
            sourceStatus: {
              ...nextBase.sourceStatus,
              mode: dataMode,
              label: dataMode === 'live' ? 'LIVE FALLBACK' : 'AUTO DEMO',
              detail: 'Live endpoints failed. Serving generated telemetry fallback.',
            },
          };
        }
      }

      const nextState: DashboardCache = {
        snapshot: resolved,
        previousSnapshot: current.snapshot,
        history: [...current.history, resolved].slice(-HISTORY_LIMIT),
      };

      await persistCache(dataMode, nextState);
      return nextState;
    },
  });

  const fallbackState = useMemo(() => restoredCache ?? createSeed(dataMode), [dataMode, restoredCache]);
  const state = query.data ?? fallbackState;
  const isDegraded =
    state.snapshot.sourceStatus.label.includes('FALLBACK') ||
    state.snapshot.sourceStatus.label.includes('DEMO');
  const hasLiveFeed = state.snapshot.sourceStatus.liveCategories.length > 0;
  const isInitialLoading = !hydrated || (query.isPending && !query.data && !restoredCache);
  const errorMessage = query.error instanceof Error ? query.error.message : null;

  return {
    snapshot: state.snapshot,
    previousSnapshot: state.previousSnapshot,
    history: state.history,
    lastUpdated: formatRelativeTime(state.snapshot.lastUpdated),
    isInitialLoading,
    isRefreshing: query.isFetching && !isInitialLoading,
    isError: query.isError,
    errorMessage,
    isDegraded,
    hasLiveFeed,
    refreshDashboard: query.refetch,
  };
}
