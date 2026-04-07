import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { applyLiveData, createInitialSnapshot, type DataMode } from '../data/liveEarth';
import { fetchLiveDataPatch } from './liveFeeds';
import { notifyForQualifiedAlertsAsync } from './notifications';
import type { DashboardSettings } from '../hooks/useDashboardControls';

export const LIVE_EARTH_BACKGROUND_TASK = 'live-earth-background-refresh';
const SETTINGS_KEY = 'live-earth-settings';
const BACKGROUND_STATUS_KEY = 'live-earth-background-status';
const WATCHLIST_KEY = 'live-earth-watchlist';
const INCIDENTS_KEY = 'live-earth-incidents';

TaskManager.defineTask(LIVE_EARTH_BACKGROUND_TASK, async () => {
  try {
    const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
    const parsed = storedSettings ? (JSON.parse(storedSettings) as Partial<DashboardSettings>) : {};
    const mode = parsed.dataMode ?? 'auto';

    if (mode === 'demo') {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    const patch = await fetchLiveDataPatch();
    if (patch) {
      const snapshot = applyLiveData(createInitialSnapshot(mode), patch, mode);
      const storedWatchlist = await AsyncStorage.getItem(WATCHLIST_KEY);
      const watchlist = storedWatchlist ? (JSON.parse(storedWatchlist) as string[]) : [];
      const storedIncidents = await AsyncStorage.getItem(INCIDENTS_KEY);
      const mutedEventIds = storedIncidents
        ? Object.entries(JSON.parse(storedIncidents) as Record<string, { muted?: boolean }>)
            .filter(([, value]) => value.muted)
            .map(([eventId]) => eventId)
        : [];
      if (parsed.notificationsEnabled !== false) {
        await notifyForQualifiedAlertsAsync({
          alerts: snapshot.alerts,
          events: snapshot.events,
          settings: {
            dataMode: mode,
            reducedMotion: false,
            compareMode: false,
            refreshRate: 'normal',
            notificationsEnabled: parsed.notificationsEnabled ?? true,
            notificationScope: parsed.notificationScope ?? 'all',
            notificationSeverity: parsed.notificationSeverity ?? 'critical',
            notificationSourceMode: parsed.notificationSourceMode ?? 'all',
            quietHoursEnabled: parsed.quietHoursEnabled ?? false,
            appearanceMode: parsed.appearanceMode ?? 'system',
          },
          watchlist,
          liveCategories: snapshot.sourceStatus.liveCategories,
          mutedEventIds,
        });
      }
      await AsyncStorage.setItem(BACKGROUND_STATUS_KEY, JSON.stringify({ lastRun: Date.now(), live: true }));
    }

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerBackgroundRefreshTaskAsync() {
  const status = await BackgroundTask.getStatusAsync();
  if (status !== BackgroundTask.BackgroundTaskStatus.Available) {
    return false;
  }

  const alreadyRegistered = await TaskManager.isTaskRegisteredAsync(LIVE_EARTH_BACKGROUND_TASK);
  if (!alreadyRegistered) {
    await BackgroundTask.registerTaskAsync(LIVE_EARTH_BACKGROUND_TASK, {
      minimumInterval: 30,
    });
  }

  return true;
}
