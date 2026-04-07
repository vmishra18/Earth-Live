import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyStateCard } from '../components/common/StateViews';
import { StaggeredItem } from '../components/common/StaggeredItem';
import { SectionHeader } from '../components/common/SectionHeader';
import { FeedHealthPanel } from '../components/common/FeedHealthPanel';
import { SingleSelectChips } from '../components/common/FilterChips';
import {
  MarketCard,
  RegionFocusCard,
  WatchZoneCard,
  WeatherBandCard,
} from '../components/data/Cards';
import { HistoryTrendChart } from '../components/data/Charts';
import type { DashboardSnapshot, EventItem } from '../data/liveEarth';
import { radii, shadows, spacing, typeScale } from '../theme';
import { useAppTheme } from '../themeContext';
import { deriveRegionCompareHistory } from '../utils/history';
import { deriveRegionFocus, deriveRegionStats } from '../utils/regions';
import { deriveCategorySourceMeta } from '../utils/sourceStatus';

type RegionsScreenProps = {
  snapshot: DashboardSnapshot;
  history: DashboardSnapshot[];
  watchlist: string[];
  regionFilter?: string | null;
  availableRegions: string[];
  reducedMotion?: boolean;
  onToggleWatch: (label: string) => void;
  onOpenEvent: (event: EventItem) => void;
  onOpenRegion: (region: string) => void;
  onSetRegionFilter: (region: string | null) => void;
};

export function RegionsScreen({
  snapshot,
  history,
  watchlist,
  regionFilter = null,
  availableRegions,
  reducedMotion = false,
  onToggleWatch,
  onOpenEvent,
  onOpenRegion,
  onSetRegionFilter,
}: RegionsScreenProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const focusRegions = deriveRegionFocus(snapshot);
  const compareOptions = useMemo(
    () => availableRegions.slice(0, 6).map((item) => ({ label: item, value: item })),
    [availableRegions]
  );
  const initialPrimary = availableRegions[0] ?? focusRegions[0]?.name ?? 'India';
  const initialSecondary = availableRegions[1] ?? focusRegions[1]?.name ?? 'Dubai';
  const [primaryCompareRegion, setPrimaryCompareRegion] = useState(initialPrimary);
  const [secondaryCompareRegion, setSecondaryCompareRegion] = useState(
    initialSecondary === initialPrimary ? availableRegions[2] ?? 'Dubai' : initialSecondary
  );
  const compareHistory = deriveRegionCompareHistory(history, primaryCompareRegion, secondaryCompareRegion);
  const primaryStats = deriveRegionStats(snapshot, primaryCompareRegion);
  const secondaryStats = deriveRegionStats(snapshot, secondaryCompareRegion);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <StaggeredItem index={0} reducedMotion={reducedMotion}>
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.eyebrow}>Regions</Text>
              <Text style={styles.heroTitle}>Regional desk</Text>
              <Text style={styles.heroCopy}>
                Saved regions, compare mode, market pulse, and marine bands in one place.
              </Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeValue}>{watchlist.length}</Text>
              <Text style={styles.countBadgeLabel}>saved</Text>
            </View>
          </View>
        </View>
      </StaggeredItem>

      <StaggeredItem index={1} reducedMotion={reducedMotion}>
        <SectionHeader badge="Filter" title="Global region filter" hint="Apply one region across Overview, Map, Alerts, and Replay." />
      </StaggeredItem>

      <StaggeredItem index={2} reducedMotion={reducedMotion}>
        <SingleSelectChips<string>
          options={[{ label: 'All Regions', value: '__all__' }, ...compareOptions]}
          selected={regionFilter ?? '__all__'}
          onSelect={(value) => onSetRegionFilter(value === '__all__' ? null : value)}
        />
      </StaggeredItem>

      <StaggeredItem index={3} reducedMotion={reducedMotion}>
        <FeedHealthPanel snapshot={snapshot} />
      </StaggeredItem>

      <StaggeredItem index={4} reducedMotion={reducedMotion}>
        <SectionHeader badge="Saved" title="Watchlist" hint="Quick-open watched regions and corridors." />
      </StaggeredItem>

      {watchlist.length ? (
        <View style={styles.watchlistWrap}>
          {watchlist.map((item, index) => (
            <StaggeredItem key={item} index={5 + index} reducedMotion={reducedMotion}>
              <View style={styles.watchPill}>
                <Pressable onPress={() => onOpenRegion(item)} style={styles.watchPillMain}>
                  <Text style={styles.watchPillLabel}>{item}</Text>
                </Pressable>
                <Pressable onPress={() => onSetRegionFilter(item)} style={styles.watchPillAction}>
                  <Text style={styles.watchPillActionText}>Filter</Text>
                </Pressable>
                <Pressable onPress={() => onToggleWatch(item)} style={styles.watchPillAction}>
                  <Text style={styles.watchPillActionText}>Remove</Text>
                </Pressable>
              </View>
            </StaggeredItem>
          ))}
        </View>
      ) : (
        <EmptyStateCard
          title="No saved regions yet"
          message="Save a region from Overview, Alerts, or Map to pin it here."
        />
      )}

      <StaggeredItem index={12} reducedMotion={reducedMotion}>
        <SectionHeader badge="Compare" title="Region compare" hint="Compare signal volume between two regions across recent history." />
      </StaggeredItem>

      <StaggeredItem index={13} reducedMotion={reducedMotion}>
        <View style={styles.compareCard}>
          <View style={styles.compareSelectors}>
            <View style={styles.compareSelectorBlock}>
              <Text style={styles.compareLabel}>Primary</Text>
              <SingleSelectChips<string>
                options={compareOptions}
                selected={primaryCompareRegion}
                onSelect={setPrimaryCompareRegion}
              />
            </View>
            <View style={styles.compareSelectorBlock}>
              <Text style={styles.compareLabel}>Secondary</Text>
              <SingleSelectChips<string>
                options={compareOptions.filter((option) => option.value !== primaryCompareRegion)}
                selected={secondaryCompareRegion === primaryCompareRegion ? compareOptions[1]?.value ?? primaryCompareRegion : secondaryCompareRegion}
                onSelect={setSecondaryCompareRegion}
              />
            </View>
          </View>

          <HistoryTrendChart points={compareHistory} secondaryLabel={secondaryCompareRegion} />

          <View style={styles.compareStatsRow}>
            <View style={styles.compareStatsCard}>
              <Text style={styles.compareStatsTitle}>{primaryCompareRegion}</Text>
              <Text style={styles.compareStatsCopy}>{primaryStats.events} events</Text>
              <Text style={styles.compareStatsMeta}>{primaryStats.hotspots} nodes · {primaryStats.alerts} alerts</Text>
            </View>
            <View style={styles.compareStatsCard}>
              <Text style={styles.compareStatsTitle}>{secondaryCompareRegion}</Text>
              <Text style={styles.compareStatsCopy}>{secondaryStats.events} events</Text>
              <Text style={styles.compareStatsMeta}>{secondaryStats.hotspots} nodes · {secondaryStats.alerts} alerts</Text>
            </View>
          </View>
        </View>
      </StaggeredItem>

      <StaggeredItem index={14} reducedMotion={reducedMotion}>
        <SectionHeader badge="Focus" title="Regional briefings" hint="Expanded region cards with linked source labels." />
      </StaggeredItem>

      <View style={styles.stackGroup}>
        {focusRegions.map((item, index) => (
          <StaggeredItem key={item.name} index={15 + index} reducedMotion={reducedMotion}>
            <RegionFocusCard
              item={item}
              watched={watchlist.includes(item.name)}
              onOpenRegion={onOpenRegion}
              onOpenEvent={onOpenEvent}
              onToggleWatch={onToggleWatch}
              sourceMeta={deriveCategorySourceMeta(snapshot, item.category)}
            />
          </StaggeredItem>
        ))}
      </View>

      <StaggeredItem index={20} reducedMotion={reducedMotion}>
        <SectionHeader badge="Markets" title="Market pulse" hint="Existing market cards, now surfaced." />
      </StaggeredItem>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
        {snapshot.markets.map((market, index) => (
          <StaggeredItem key={market.id} index={21 + index} reducedMotion={reducedMotion}>
            <MarketCard
              market={market}
              event={snapshot.events.find((event) => event.id === market.eventId)}
              onOpenEvent={onOpenEvent}
              sourceMeta={deriveCategorySourceMeta(snapshot, market.category)}
            />
          </StaggeredItem>
        ))}
      </ScrollView>

      <StaggeredItem index={28} reducedMotion={reducedMotion}>
        <SectionHeader badge="Marine" title="Weather bands" hint="Marine and severe weather watch bands." />
      </StaggeredItem>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
        {snapshot.weatherBands.map((band, index) => (
          <StaggeredItem key={band.id} index={29 + index} reducedMotion={reducedMotion}>
            <WeatherBandCard
              band={band}
              event={snapshot.events.find((event) => event.id === band.eventId)}
              onOpenEvent={onOpenEvent}
              sourceMeta={deriveCategorySourceMeta(snapshot, band.category)}
            />
          </StaggeredItem>
        ))}
      </ScrollView>

      <StaggeredItem index={34} reducedMotion={reducedMotion}>
        <SectionHeader badge="Watch" title="Regional overlaps" hint="Full watch-zone list, not just the first two." />
      </StaggeredItem>

      <View style={styles.stackGroup}>
        {snapshot.watchZones.map((zone, index) => (
          <StaggeredItem key={zone.id} index={35 + index} reducedMotion={reducedMotion}>
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
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.card,
    },
    heroHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    eyebrow: {
      color: theme.accent,
      fontSize: typeScale.label,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    heroTitle: {
      color: theme.text,
      fontSize: typeScale.display,
      fontWeight: '800',
      marginTop: 6,
    },
    heroCopy: {
      color: theme.subtleText,
      fontSize: typeScale.body,
      lineHeight: 20,
      marginTop: spacing.xs,
      maxWidth: 260,
    },
    countBadge: {
      minWidth: 74,
      borderRadius: radii.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: theme.surfaceInset,
      alignItems: 'center',
    },
    countBadgeValue: {
      color: theme.text,
      fontSize: typeScale.metric,
      fontWeight: '800',
    },
    countBadgeLabel: {
      color: theme.subtleText,
      fontSize: typeScale.label,
      textTransform: 'uppercase',
      fontWeight: '700',
      letterSpacing: 0.7,
    },
    watchlistWrap: {
      gap: spacing.sm,
    },
    watchPill: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radii.lg,
      backgroundColor: theme.surfaceSoft,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    watchPillMain: {
      flex: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: 14,
    },
    watchPillLabel: {
      color: theme.text,
      fontSize: typeScale.title,
      fontWeight: '700',
    },
    watchPillAction: {
      paddingHorizontal: spacing.md,
      paddingVertical: 14,
      backgroundColor: theme.surfaceRaised,
    },
    watchPillActionText: {
      color: theme.subtleText,
      fontSize: typeScale.label,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    horizontalRow: {
      gap: spacing.md,
      paddingRight: spacing.lg,
    },
    compareCard: {
      backgroundColor: theme.surfaceSoft,
      borderRadius: radii.xl,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.card,
    },
    compareSelectors: {
      gap: spacing.md,
    },
    compareSelectorBlock: {
      gap: spacing.xs,
    },
    compareLabel: {
      color: theme.subtleText,
      fontSize: typeScale.label,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.7,
    },
    compareStatsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    compareStatsCard: {
      flex: 1,
      backgroundColor: theme.surfaceInset,
      borderRadius: radii.lg,
      padding: spacing.md,
      gap: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },
    compareStatsTitle: {
      color: theme.text,
      fontSize: typeScale.title,
      fontWeight: '800',
    },
    compareStatsCopy: {
      color: theme.text,
      fontSize: typeScale.body,
      fontWeight: '700',
    },
    compareStatsMeta: {
      color: theme.subtleText,
      fontSize: typeScale.meta,
    },
    stackGroup: {
      gap: spacing.md,
    },
  });
