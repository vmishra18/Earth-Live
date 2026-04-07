import { useMemo, useState } from 'react';
import {
  allCategories,
  type DataMode,
  type EventItem,
  type FeedCategory,
  type SeverityFilter,
} from '../data/liveEarth';
import { usePersistentState } from './usePersistentState';
import type { AppAppearanceMode } from '../theme';
import { impactHaptic, selectionHaptic } from '../services/haptics';

export type DashboardSettings = {
  dataMode: DataMode;
  reducedMotion: boolean;
  compareMode: boolean;
  refreshRate: 'normal' | 'fast';
  notificationsEnabled: boolean;
  notificationScope: 'all' | 'watched';
  notificationSeverity: 'critical' | 'elevated';
  notificationSourceMode: 'all' | 'live';
  quietHoursEnabled: boolean;
  appearanceMode: AppAppearanceMode;
};

export type IncidentRecord = {
  acknowledged: boolean;
  muted: boolean;
  priority: 'low' | 'normal' | 'high';
  notes: string;
  updatedAt: number;
};

export function useDashboardControls() {
  const [activeCategories, setActiveCategories] = useState<FeedCategory[]>(allCategories);
  const [activeLayers, setActiveLayers] = useState<FeedCategory[]>(allCategories);
  const [watchlist, setWatchlist] = usePersistentState<string[]>(
    'live-earth-watchlist',
    ['Japan trench', 'North Atlantic']
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [incidentRecords, setIncidentRecords] = usePersistentState<Record<string, IncidentRecord>>(
    'live-earth-incidents',
    {}
  );
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [settings, setSettings] = usePersistentState<DashboardSettings>('live-earth-settings', {
    dataMode: 'auto',
    reducedMotion: false,
    compareMode: false,
    refreshRate: 'normal',
    notificationsEnabled: true,
    notificationScope: 'all',
    notificationSeverity: 'critical',
    notificationSourceMode: 'all',
    quietHoursEnabled: false,
    appearanceMode: 'system',
  });

  const categoryCountLabel = useMemo(() => `${activeCategories.length}/${allCategories.length}`, [activeCategories]);

  const toggleCategory = (category: FeedCategory) => {
    selectionHaptic();
    setActiveCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  };

  const toggleLayer = (category: FeedCategory) => {
    selectionHaptic();
    setActiveLayers((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  };

  const toggleWatch = (label: string) => {
    impactHaptic();
    setWatchlist((current) => (current.includes(label) ? current.filter((item) => item !== label) : [...current, label]));
  };

  const updateSettings = (next: Partial<DashboardSettings>) => {
    selectionHaptic();
    setSettings((current) => ({ ...current, ...next }));
  };

  const resetAlertFilters = () => {
    selectionHaptic();
    setSeverityFilter('all');
    setActiveCategories(allCategories);
  };

  const focusCriticalAlerts = () => {
    selectionHaptic();
    setSeverityFilter('critical');
    setActiveCategories(allCategories);
  };

  const openEvent = (event: EventItem) => {
    impactHaptic();
    setSelectedEvent(event);
  };

  const openRegion = (region: string) => {
    impactHaptic();
    setSelectedRegion(region);
  };

  const applyRegionFilter = (region: string | null) => {
    selectionHaptic();
    setRegionFilter(region);
  };

  const updateIncident = (eventId: string, next: Partial<IncidentRecord>) => {
    selectionHaptic();
    setIncidentRecords((current) => ({
      ...current,
      [eventId]: {
        acknowledged: current[eventId]?.acknowledged ?? false,
        muted: current[eventId]?.muted ?? false,
        priority: current[eventId]?.priority ?? 'normal',
        notes: current[eventId]?.notes ?? '',
        ...next,
        updatedAt: Date.now(),
      },
    }));
  };

  return {
    activeCategories,
    activeLayers,
    watchlist,
    searchQuery,
    severityFilter,
    selectedEvent,
    selectedRegion,
    regionFilter,
    incidentRecords,
    settingsVisible,
    filtersVisible,
    settings,
    categoryCountLabel,
    setSearchQuery,
    setSeverityFilter,
    setSelectedEvent,
    setSelectedRegion,
    setRegionFilter,
    setSettingsVisible,
    setFiltersVisible,
    toggleCategory,
    toggleLayer,
    toggleWatch,
    updateSettings,
    resetAlertFilters,
    focusCriticalAlerts,
    openEvent,
    openRegion,
    applyRegionFilter,
    updateIncident,
  };
}
