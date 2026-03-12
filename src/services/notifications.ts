import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import type { AlertItem, EventItem } from '../data/liveEarth';

const LAST_ALERT_KEY = 'live-earth-last-critical-alert';

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

export async function notifyForCriticalAlertsAsync(alerts: AlertItem[], events: EventItem[]) {
  const criticalAlert = alerts.find((alert) => alert.tone === 'danger');
  if (!criticalAlert) {
    return;
  }

  const event = events.find((candidate) => candidate.id === criticalAlert.eventId);
  if (!event) {
    return;
  }

  await notifyCriticalEventAsync(event);
}
