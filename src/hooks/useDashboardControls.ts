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
  appearanceMode: AppAppearanceMode;
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
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [settings, setSettings] = usePersistentState<DashboardSettings>('live-earth-settings', {
    dataMode: 'auto',
    reducedMotion: false,
    compareMode: false,
    refreshRate: 'normal',
    notificationsEnabled: true,
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

  const openEvent = (event: EventItem) => {
    impactHaptic();
    setSelectedEvent(event);
  };

  const openRegion = (region: string) => {
    impactHaptic();
    setSelectedRegion(region);
  };

  return {
    activeCategories,
    activeLayers,
    watchlist,
    searchQuery,
    severityFilter,
    selectedEvent,
    selectedRegion,
    settingsVisible,
    filtersVisible,
    settings,
    categoryCountLabel,
    setSearchQuery,
    setSeverityFilter,
    setSelectedEvent,
    setSelectedRegion,
    setSettingsVisible,
    setFiltersVisible,
    toggleCategory,
    toggleLayer,
    toggleWatch,
    updateSettings,
    openEvent,
    openRegion,
  };
}
