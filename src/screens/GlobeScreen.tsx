import React from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FilterChips } from '../components/common/FilterChips';
import { SectionHeader } from '../components/common/SectionHeader';
import { StaggeredItem } from '../components/common/StaggeredItem';
import { WatchZoneCard } from '../components/data/Cards';
import { GlobalMapCard } from '../components/map/GlobalMapCard';
import type { DashboardSnapshot, EventItem, FeedCategory } from '../data/liveEarth';
import { radii, shadows, spacing, type AppThemePalette, typeScale } from '../theme';
import { useAppTheme } from '../themeContext';

type GlobeScreenProps = {
  snapshot: DashboardSnapshot;
  glow: Animated.Value;
  globeSize: number;
  activeLayers: FeedCategory[];
  watchlist: string[];
  theme: AppThemePalette;
  reducedMotion?: boolean;
  onToggleLayer: (category: FeedCategory) => void;
  onToggleWatch: (label: string) => void;
  onOpenEvent: (event: EventItem) => void;
};

export function GlobeScreen({
  snapshot,
  glow,
  globeSize,
  activeLayers,
  watchlist,
  theme,
  reducedMotion = false,
  onToggleLayer,
  onToggleWatch,
  onOpenEvent,
}: GlobeScreenProps) {
  const uiTheme = useAppTheme();
  const styles = createStyles(uiTheme);
  const layerOptions = [
    { label: 'earthquakes', value: 'earthquakes' as FeedCategory },
    { label: 'flights', value: 'flights' as FeedCategory },
    { label: 'weather', value: 'weather' as FeedCategory },
    { label: 'markets', value: 'markets' as FeedCategory },
    { label: 'satellites', value: 'satellites' as FeedCategory },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StaggeredItem index={0} reducedMotion={reducedMotion}>
        <View style={styles.heroCard}>
          <View style={styles.headerRow}>
            <SectionHeader badge="Map" title="World view" hint="Layers and live watch regions" />
            <View style={styles.legendBadge}>
              <Text style={styles.legendBadgeText}>{activeLayers.length} active</Text>
            </View>
          </View>
          <Text style={styles.heroMeta}>Live feeds: earthquakes, flights, weather, markets, satellites</Text>
        </View>
      </StaggeredItem>

      <StaggeredItem index={1} reducedMotion={reducedMotion}>
        <View style={styles.layerRow}>
          <Text style={styles.layerLabel}>Layers</Text>
          <FilterChips options={layerOptions} selected={activeLayers} onToggle={onToggleLayer} />
        </View>
      </StaggeredItem>

      <StaggeredItem index={2} reducedMotion={reducedMotion}>
        <GlobalMapCard
          hotspots={snapshot.hotspots}
          satellites={snapshot.satellites}
          events={snapshot.events}
          activeLayers={activeLayers}
          theme={theme}
          glow={glow}
          size={globeSize}
          mapHeight={430}
          reducedMotion={reducedMotion}
          onOpenEvent={onOpenEvent}
        />
      </StaggeredItem>

      <StaggeredItem index={3} reducedMotion={reducedMotion}>
        <View style={styles.watchHeaderRow}>
          <SectionHeader badge="Saved" title="Watch regions" hint="Pinned overlaps" />
          <View style={styles.inlineLegend}>
            <View style={[styles.legendDot, { backgroundColor: theme.accent }]} />
            <Text style={styles.inlineLegendText}>saved</Text>
          </View>
        </View>
      </StaggeredItem>

      <View style={styles.stackGroup}>
        {snapshot.watchZones.slice(0, 2).map((zone, index) => (
          <StaggeredItem key={zone.id} index={4 + index} reducedMotion={reducedMotion}>
            <WatchZoneCard
              zone={zone}
              event={snapshot.events.find((event) => event.id === zone.eventId)}
              onOpenEvent={onOpenEvent}
              onToggleWatch={onToggleWatch}
              watched={watchlist.includes(zone.name)}
            />
          </StaggeredItem>
        ))}
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: 136,
      gap: spacing.xxl,
    },
    heroCard: {
      backgroundColor: theme.surfaceSoft,
      borderTopLeftRadius: radii.xl,
      borderTopRightRadius: radii.md,
      borderBottomLeftRadius: radii.lg,
      borderBottomRightRadius: radii.xl,
      padding: spacing.lg,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.card,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    heroMeta: {
      color: theme.subtleText,
      fontSize: typeScale.meta,
      lineHeight: 18,
    },
    legendBadge: {
      borderRadius: radii.pill,
      paddingHorizontal: 12,
      paddingVertical: 7,
      backgroundColor: theme.surfaceInset,
    },
    legendBadgeText: {
      color: theme.text,
      fontSize: typeScale.label,
      fontWeight: '700',
    },
    layerRow: {
      gap: spacing.sm,
    },
    layerLabel: {
      color: theme.subtleText,
      fontSize: typeScale.label,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      fontWeight: '700',
    },
    watchHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: spacing.md,
    },
    inlineLegend: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: radii.pill,
    },
    inlineLegendText: {
      color: theme.subtleText,
      fontSize: typeScale.label,
      textTransform: 'uppercase',
      letterSpacing: 0.7,
      fontWeight: '700',
    },
    stackGroup: {
      gap: spacing.lg,
    },
  });
