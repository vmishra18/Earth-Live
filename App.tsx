import React, { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Animated,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { EventDetailModal } from './src/components/common/EventDetailModal';
import { RegionDetailModal } from './src/components/common/RegionDetailModal';
import { SettingsSheet } from './src/components/common/SettingsSheet';
import { LoadingStateCard, StatusBanner } from './src/components/common/StateViews';
import { BottomNav } from './src/components/layout/BottomNav';
import { AuroraBackground } from './src/components/layout/AuroraBackground';
import { TopBar } from './src/components/layout/TopBar';
import { useAlertsRuntime } from './src/hooks/useAlertsRuntime';
import { useAmbientMotion } from './src/hooks/useAmbientMotion';
import { useDashboardControls } from './src/hooks/useDashboardControls';
import { useDashboardData } from './src/hooks/useDashboardData';
import { useScreenTransition } from './src/hooks/useScreenTransition';
import { resolveAppTheme, spacing } from './src/theme';
import { AlertsScreen } from './src/screens/AlertsScreen';
import { GlobeScreen } from './src/screens/GlobeScreen';
import { OverviewScreen } from './src/screens/OverviewScreen';
import { ReplayScreen } from './src/screens/ReplayScreen';
import { impactHaptic, selectionHaptic } from './src/services/haptics';
import { AppThemeContext } from './src/themeContext';

function ScreenHost({ children, opacity }: { children: React.ReactNode; opacity: Animated.Value }) {
  return <Animated.View style={[styles.screenHost, { opacity }]}>{children}</Animated.View>;
}

function AppContent() {
  const controls = useDashboardControls();
  const systemScheme = useColorScheme();
  const [playbackEnabled, setPlaybackEnabled] = useState(false);
  const effectiveRefreshRate = playbackEnabled ? 'fast' : controls.settings.refreshRate;
  const theme = resolveAppTheme(controls.settings.appearanceMode, systemScheme);
  const {
    snapshot,
    previousSnapshot,
    history,
    lastUpdated,
    isInitialLoading,
    isRefreshing,
    isError,
    errorMessage,
    isDegraded,
    refreshDashboard,
  } = useDashboardData({
    dataMode: controls.settings.dataMode,
    refreshRate: effectiveRefreshRate,
  });
  const { backgroundShift, radarShift } = useAmbientMotion(!controls.settings.reducedMotion);
  const { screen, screenOpacity, changeScreen } = useScreenTransition(
    'overview',
    !controls.settings.reducedMotion
  );
  const { width } = useWindowDimensions();

  useAlertsRuntime({
    notificationsEnabled: controls.settings.notificationsEnabled,
    alerts: snapshot.alerts,
    events: snapshot.events,
  });

  const stackHero = width < 430;
  const compactMetrics = width < 430;
  const globeSize = Math.max(240, Math.min(width - spacing.lg * 2 - 40, 320));
  const selectedEventWatched = useMemo(
    () =>
      controls.selectedEvent
        ? controls.watchlist.includes(controls.selectedEvent.region) ||
          controls.watchlist.includes(controls.selectedEvent.title)
        : false,
    [controls.selectedEvent, controls.watchlist]
  );

  const handleOpenEvent = (event: Parameters<typeof controls.openEvent>[0]) => {
    controls.setSelectedRegion(null);
    controls.openEvent(event);
  };

  const handleOpenRegion = (region: string) => {
    controls.setSelectedEvent(null);
    controls.openRegion(region);
  };

  const renderedScreen = (() => {
    switch (screen) {
      case 'globe':
        return (
          <GlobeScreen
            snapshot={snapshot}
            glow={radarShift}
            globeSize={globeSize}
            activeLayers={controls.activeLayers}
            watchlist={controls.watchlist}
            theme={theme}
            reducedMotion={controls.settings.reducedMotion}
            onToggleLayer={controls.toggleLayer}
            onToggleWatch={controls.toggleWatch}
            onOpenEvent={handleOpenEvent}
          />
        );
      case 'alerts':
        return (
          <AlertsScreen
            snapshot={snapshot}
            searchQuery={controls.searchQuery}
            severityFilter={controls.severityFilter}
            activeCategories={controls.activeCategories}
            watchlist={controls.watchlist}
            filtersVisible={controls.filtersVisible}
            reducedMotion={controls.settings.reducedMotion}
            onSetSearchQuery={controls.setSearchQuery}
            onSetSeverityFilter={controls.setSeverityFilter}
            onToggleCategory={controls.toggleCategory}
            onToggleWatch={controls.toggleWatch}
            onOpenEvent={handleOpenEvent}
            onOpenRegion={handleOpenRegion}
            onOpenFilters={() => controls.setFiltersVisible(true)}
            onCloseFilters={() => controls.setFiltersVisible(false)}
            onResetFilters={controls.resetAlertFilters}
            onFocusCritical={controls.focusCriticalAlerts}
          />
        );
      case 'replay':
        return (
          <ReplayScreen
            snapshot={snapshot}
            history={history}
            playbackEnabled={playbackEnabled}
            reducedMotion={controls.settings.reducedMotion}
            onTogglePlayback={() => {
              selectionHaptic();
              setPlaybackEnabled((value) => !value);
            }}
            onOpenEvent={handleOpenEvent}
          />
        );
      case 'overview':
      default:
        return (
          <OverviewScreen
            snapshot={snapshot}
            previousSnapshot={previousSnapshot}
            compactMetrics={compactMetrics}
            stackHero={stackHero}
            lastUpdated={lastUpdated}
            watchlist={controls.watchlist}
            reducedMotion={controls.settings.reducedMotion}
            compareMode={controls.settings.compareMode}
            onToggleWatch={controls.toggleWatch}
            onOpenEvent={handleOpenEvent}
            onOpenRegion={handleOpenRegion}
          />
        );
    }
  })();

  return (
    <AppThemeContext.Provider value={theme}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
          <ExpoStatusBar style={theme.resolvedAppearance === 'light' ? 'dark' : 'light'} />
          <StatusBar barStyle={theme.resolvedAppearance === 'light' ? 'dark-content' : 'light-content'} />

          <View style={[styles.appShell, { backgroundColor: theme.background }]}>
            <AuroraBackground shift={backgroundShift} theme={theme} />
            <TopBar
              lastUpdated={lastUpdated}
              sourceStatus={snapshot.sourceStatus}
              isRefreshing={isRefreshing}
              theme={theme}
              categoryCountLabel={controls.categoryCountLabel}
              onRefresh={() => {
                impactHaptic();
                void refreshDashboard();
              }}
              onOpenSettings={() => controls.setSettingsVisible(true)}
            />
            {isError ? (
              <StatusBanner
                tone="danger"
                title="Refresh Failed"
                message={errorMessage ?? 'The dashboard could not refresh. Cached or fallback telemetry is being used.'}
              />
            ) : null}
            {isDegraded && !isInitialLoading ? (
              <StatusBanner
                tone="warn"
                title="Degraded Data"
                message={snapshot.sourceStatus.detail}
              />
            ) : null}
            {isInitialLoading ? (
              <View style={styles.loadingWrap}>
                <LoadingStateCard
                  title="Syncing global feeds"
                  message="Restoring cache, checking live endpoints, and preparing the dashboard shell."
                />
              </View>
            ) : (
              <ScreenHost opacity={screenOpacity}>{renderedScreen}</ScreenHost>
            )}
            <BottomNav
              activeScreen={screen}
              onChange={(nextScreen) => {
                impactHaptic();
                changeScreen(nextScreen);
              }}
            />
          </View>

          <SettingsSheet
            visible={controls.settingsVisible}
            settings={controls.settings}
            onClose={() => controls.setSettingsVisible(false)}
            onUpdate={controls.updateSettings}
          />

          <EventDetailModal
            event={controls.selectedEvent}
            visible={Boolean(controls.selectedEvent)}
            watched={selectedEventWatched}
            theme={theme}
            onClose={() => controls.setSelectedEvent(null)}
            onToggleWatch={controls.toggleWatch}
            onOpenRegion={handleOpenRegion}
          />

          <RegionDetailModal
            region={controls.selectedRegion}
            snapshot={snapshot}
            visible={Boolean(controls.selectedRegion)}
            theme={theme}
            onClose={() => controls.setSelectedRegion(null)}
            onOpenEvent={handleOpenEvent}
          />
      </SafeAreaView>
    </AppThemeContext.Provider>
  );
}

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnReconnect: true,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  appShell: {
    flex: 1,
  },
  screenHost: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
});
