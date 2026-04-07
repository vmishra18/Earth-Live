import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import type { AlertItem, EventItem } from '../data/liveEarth';
import type { DashboardSettings } from '../hooks/useDashboardControls';

const LAST_ALERT_KEY = 'live-earth-last-critical-alert';
const QUIET_HOURS_START = 22;
const QUIET_HOURS_END = 7;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function initializeNotificationsAsync() {
  const permissions = await Notifications.getPermissionsAsync();
  if (!permissions.granted) {
    await Notifications.requestPermissionsAsync();
  }

  await Notifications.setNotificationChannelAsync('alerts', {
    name: 'Critical Alerts',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

export async function notifyCriticalEventAsync(event: EventItem) {
  const lastSent = await AsyncStorage.getItem(LAST_ALERT_KEY);
  if (lastSent === event.id) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: event.title,
      body: event.summary,
      data: { eventId: event.id, region: event.region },
    },
    trigger: null,
  });

  await AsyncStorage.setItem(LAST_ALERT_KEY, event.id);
}

function isWithinQuietHours(date = new Date()) {
  const hour = date.getHours();
  return hour >= QUIET_HOURS_START || hour < QUIET_HOURS_END;
}

function severityMatches(tone: AlertItem['tone'], severity: DashboardSettings['notificationSeverity']) {
  if (severity === 'critical') {
    return tone === 'danger';
  }
  return tone === 'warn' || tone === 'danger';
}

export async function notifyForQualifiedAlertsAsync({
  alerts,
  events,
  settings,
  watchlist,
  liveCategories,
  mutedEventIds = [],
}: {
  alerts: AlertItem[];
  events: EventItem[];
  settings: DashboardSettings;
  watchlist: string[];
  liveCategories: EventItem['category'][];
  mutedEventIds?: string[];
}) {
  if (!settings.notificationsEnabled) {
    return;
  }

  if (settings.quietHoursEnabled && isWithinQuietHours()) {
    return;
  }

  const candidateAlert = alerts.find((alert) => {
    if (mutedEventIds.includes(alert.eventId)) {
      return false;
    }
    if (!severityMatches(alert.tone, settings.notificationSeverity)) {
      return false;
    }
    if (settings.notificationScope === 'watched' && !watchlist.includes(alert.region)) {
      return false;
    }
    if (settings.notificationSourceMode === 'live' && !liveCategories.includes(alert.category)) {
      return false;
    }
    return true;
  });

  if (!candidateAlert) {
    return;
  }

  const event = events.find((candidate) => candidate.id === candidateAlert.eventId);
  if (!event) {
    return;
  }

  await notifyCriticalEventAsync(event);
}
