import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { applyLiveData, createInitialSnapshot, type DataMode } from '../data/liveEarth';
import { fetchLiveDataPatch } from './liveFeeds';
import { notifyCriticalEventAsync } from './notifications';

export const LIVE_EARTH_BACKGROUND_TASK = 'live-earth-background-refresh';
const SETTINGS_KEY = 'live-earth-settings';
const BACKGROUND_STATUS_KEY = 'live-earth-background-status';

TaskManager.defineTask(LIVE_EARTH_BACKGROUND_TASK, async () => {
  try {
    const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
    const parsed = storedSettings ? (JSON.parse(storedSettings) as { dataMode?: DataMode; notificationsEnabled?: boolean }) : {};
    const mode = parsed.dataMode ?? 'auto';

    if (mode === 'demo') {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    const patch = await fetchLiveDataPatch();
    if (patch) {
      const snapshot = applyLiveData(createInitialSnapshot(mode), patch, mode);
      const critical = snapshot.events.find((event) => event.tone === 'danger');
      if (critical && parsed.notificationsEnabled !== false) {
        await notifyCriticalEventAsync(critical);
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
