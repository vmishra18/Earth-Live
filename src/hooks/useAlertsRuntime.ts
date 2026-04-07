import { useEffect, useRef } from 'react';
import type { AlertItem, DataSourceStatus, EventItem } from '../data/liveEarth';
import { registerBackgroundRefreshTaskAsync } from '../services/backgroundRefresh';
import { successHaptic } from '../services/haptics';
import { initializeNotificationsAsync, notifyForQualifiedAlertsAsync } from '../services/notifications';
import type { DashboardSettings, IncidentRecord } from './useDashboardControls';

type UseAlertsRuntimeOptions = {
  settings: DashboardSettings;
  alerts: AlertItem[];
  events: EventItem[];
  watchlist: string[];
  sourceStatus: DataSourceStatus;
  incidentRecords: Record<string, IncidentRecord>;
};

export function useAlertsRuntime({
  settings,
  alerts,
  events,
  watchlist,
  sourceStatus,
  incidentRecords,
}: UseAlertsRuntimeOptions) {
  const lastCriticalEventId = useRef<string | null>(null);

  useEffect(() => {
    if (!settings.notificationsEnabled) {
      return;
    }

    initializeNotificationsAsync().catch(() => {
      // Ignore runtime permission issues in-app.
    });

    registerBackgroundRefreshTaskAsync().catch(() => {
      // Background tasks are best effort.
    });
  }, [settings.notificationsEnabled]);

  useEffect(() => {
    if (!settings.notificationsEnabled) {
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

    notifyForQualifiedAlertsAsync({
      alerts,
      events,
      settings,
      watchlist,
      liveCategories: sourceStatus.liveCategories,
      mutedEventIds: Object.entries(incidentRecords)
        .filter(([, value]) => value.muted)
        .map(([eventId]) => eventId),
    }).catch(() => {
      // Local notification delivery is best effort.
    });
  }, [alerts, events, settings, sourceStatus.liveCategories, watchlist, incidentRecords]);
}
