import { useEffect, useRef } from 'react';
import type { AlertItem, EventItem } from '../data/liveEarth';
import { registerBackgroundRefreshTaskAsync } from '../services/backgroundRefresh';
import { successHaptic } from '../services/haptics';
import { initializeNotificationsAsync, notifyForCriticalAlertsAsync } from '../services/notifications';

type UseAlertsRuntimeOptions = {
  notificationsEnabled: boolean;
  alerts: AlertItem[];
  events: EventItem[];
};

export function useAlertsRuntime({
  notificationsEnabled,
  alerts,
  events,
}: UseAlertsRuntimeOptions) {
  const lastCriticalEventId = useRef<string | null>(null);

  useEffect(() => {
    if (!notificationsEnabled) {
      return;
    }

    initializeNotificationsAsync().catch(() => {
      // Ignore runtime permission issues in-app.
    });

    registerBackgroundRefreshTaskAsync().catch(() => {
      // Background tasks are best effort.
    });
  }, [notificationsEnabled]);

  useEffect(() => {
    if (!notificationsEnabled) {
      return;
    }

    const criticalAlert = alerts.find((alert) => alert.tone === 'danger');
    const criticalEvent = criticalAlert
      ? events.find((event) => event.id === criticalAlert.eventId)
      : null;

    if (criticalEvent && criticalEvent.id !== lastCriticalEventId.current) {
      successHaptic();
      lastCriticalEventId.current = criticalEvent.id;
    }

    notifyForCriticalAlertsAsync(alerts, events).catch(() => {
      // Local notification delivery is best effort.
    });
  }, [alerts, events, notificationsEnabled]);
}
