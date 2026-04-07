import React, { useState } from 'react';
import {
  LayoutAnimation,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {
  AlertItem,
  EventItem,
  FeedItem,
  MarketPulse,
  Metric,
  TimelineEntry,
  Trend,
  WatchZone,
  WeatherBand,
} from '../../data/liveEarth';
import { radii, shadows, spacing, typeScale } from '../../theme';
import { useAppTheme } from '../../themeContext';
import type { RegionFocus } from '../../utils/regions';
import type { SourceMeta } from '../../utils/sourceStatus';
import { toneColor } from '../../utils/tone';
import { SourceBadge } from '../common/SourceBadge';
import { AnimatedNumber } from '../common/AnimatedNumber';

type EventPressableProps = {
  event?: EventItem;
  onOpenEvent?: (event: EventItem) => void;
  onOpenRegion?: (region: string) => void;
  onToggleWatch?: (label: string) => void;
  watched?: boolean;
};

function maybeOpen(event: EventItem | undefined, onOpenEvent?: (event: EventItem) => void) {
  if (event && onOpenEvent) {
    onOpenEvent(event);
  }
}

export function MetricCard({
  metric,
  reducedMotion,
}: {
  metric: Metric;
  reducedMotion?: boolean;
}) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricDot, { backgroundColor: toneColor(metric.tone) }]} />
        <Text
          style={styles.metricLabel}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {metric.label}
        </Text>
      </View>
      <AnimatedNumber
        value={metric.numericValue}
        prefix={metric.prefix}
        suffix={metric.suffix}
        decimals={metric.decimals}
        reducedMotion={reducedMotion}
        style={styles.metricValue}
      />
      <Text style={styles.metricDelta}>{metric.delta}</Text>
    </View>
  );
}

export function TickerRow({
  feed,
  events,
  onOpenEvent,
}: {
  feed: FeedItem[];
  events: EventItem[];
  onOpenEvent?: (event: EventItem) => void;
}) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tickerRow}>
      {feed.map((item) => {
        const event = events.find((candidate) => candidate.id === item.eventId);
        return (
          <Pressable key={item.id} onPress={() => maybeOpen(event, onOpenEvent)} style={styles.tickerPill}>
            <View style={[styles.metricDot, { backgroundColor: toneColor(item.tone) }]} />
            <Text style={styles.tickerLabel}>{item.label}</Text>
            <Text style={styles.tickerDetail}>{item.detail}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function TrendCard({
  item,
  event,
  onOpenEvent,
  style,
  sourceMeta,
}: {
  item: Trend;
  event?: EventItem;
  onOpenEvent?: (event: EventItem) => void;
  style?: StyleProp<ViewStyle>;
  sourceMeta?: SourceMeta;
}) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable onPress={() => maybeOpen(event, onOpenEvent)} style={[styles.trendCard, style]}>
      <Text style={styles.trendTitle}>{item.title}</Text>
      <Text style={styles.trendSubtitle}>{item.subtitle}</Text>
      <Text style={[styles.trendValue, { color: toneColor(item.tone) }]}>{item.value}</Text>
      {sourceMeta ? <SourceBadge meta={sourceMeta} compact /> : null}
    </Pressable>
  );
}

export function AlertCard({
  alert,
  event,
  onOpenEvent,
  onOpenRegion,
  onToggleWatch,
  watched,
  sourceMeta,
}: {
  alert: AlertItem;
  event?: EventItem;
  sourceMeta?: SourceMeta;
} & EventPressableProps) {
  const [expanded, setExpanded] = useState(false);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable
      onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded((value) => !value);
        maybeOpen(event, onOpenEvent);
      }}
      style={styles.alertCard}
    >
      <View style={styles.alertTopRow}>
        <View style={[styles.alertDot, { backgroundColor: toneColor(alert.tone) }]} />
        <Text style={styles.alertRegion}>{alert.region}</Text>
        <Pressable
          onPress={() => onToggleWatch?.(alert.region)}
          style={[styles.inlineWatch, watched && styles.inlineWatchActive]}
        >
          <Text style={[styles.inlineWatchText, watched && styles.inlineWatchTextActive]}>
            {watched ? 'Watching' : 'Watch'}
          </Text>
        </Pressable>
      </View>
      <Text style={styles.alertTitle}>{alert.title}</Text>
      <Text style={styles.alertBody}>{alert.body}</Text>
      {sourceMeta ? <SourceBadge meta={sourceMeta} compact /> : null}
      {expanded && event ? (
        <View style={styles.expandedCard}>
          {event.details.slice(0, 2).map((detail) => (
            <Text key={detail} style={styles.expandedText}>
              {detail}
            </Text>
          ))}
          <Pressable onPress={() => onOpenRegion?.(event.region)} style={styles.regionButton}>
            <Text style={styles.regionButtonText}>Open Region</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

export function MarketCard({
  market,
  event,
  onOpenEvent,
  style,
  sourceMeta,
}: {
  market: MarketPulse;
  event?: EventItem;
  onOpenEvent?: (event: EventItem) => void;
  style?: StyleProp<ViewStyle>;
  sourceMeta?: SourceMeta;
}) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable onPress={() => maybeOpen(event, onOpenEvent)} style={[styles.marketCard, style]}>
      <Text style={styles.marketRegion}>{market.region}</Text>
      <Text style={styles.marketName}>{market.name}</Text>
      <Text style={styles.marketValue}>{market.value}</Text>
      <Text style={[styles.marketDelta, { color: toneColor(market.tone) }]}>{market.delta}</Text>
      {sourceMeta ? <SourceBadge meta={sourceMeta} compact /> : null}
    </Pressable>
  );
}

export function WatchZoneCard({
  zone,
  event,
  onOpenEvent,
  onToggleWatch,
  watched,
}: {
  zone: WatchZone;
  event?: EventItem;
} & EventPressableProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable onPress={() => maybeOpen(event, onOpenEvent)} style={styles.watchCard}>
      <View style={styles.watchHeader}>
        <Text style={styles.watchName}>{zone.name}</Text>
        <View style={styles.watchActions}>
          <View style={[styles.badge, { backgroundColor: `${toneColor(zone.tone)}22` }]}>
            <Text style={[styles.badgeText, { color: toneColor(zone.tone) }]}>{zone.risk}</Text>
          </View>
          <Pressable
            onPress={() => onToggleWatch?.(zone.name)}
            style={[styles.inlineWatch, watched && styles.inlineWatchActive]}
          >
            <Text style={[styles.inlineWatchText, watched && styles.inlineWatchTextActive]}>
              {watched ? 'Saved' : 'Save'}
            </Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.watchDetail}>{zone.detail}</Text>
    </Pressable>
  );
}

export function WeatherBandCard({
  band,
  event,
  onOpenEvent,
  sourceMeta,
}: {
  band: WeatherBand;
  event?: EventItem;
  onOpenEvent?: (event: EventItem) => void;
  sourceMeta?: SourceMeta;
}) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable onPress={() => maybeOpen(event, onOpenEvent)} style={styles.weatherCard}>
      <Text style={styles.weatherZone}>{band.zone}</Text>
      <View style={styles.weatherStats}>
        <Text style={styles.weatherStat}>Wind {band.wind}</Text>
        <Text style={styles.weatherStat}>Seas {band.seas}</Text>
      </View>
      {sourceMeta ? <SourceBadge meta={sourceMeta} compact /> : null}
      <View style={[styles.weatherStrip, { backgroundColor: toneColor(band.tone) }]} />
    </Pressable>
  );
}

export function TimelineList({
  timeline,
  events,
  onOpenEvent,
}: {
  timeline: TimelineEntry[];
  events: EventItem[];
  onOpenEvent?: (event: EventItem) => void;
}) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.timelineList}>
      {timeline.map((entry) => {
        const event = events.find((candidate) => candidate.id === entry.eventId);
        return (
          <Pressable key={entry.id} onPress={() => maybeOpen(event, onOpenEvent)} style={styles.timelineRow}>
            <Text style={styles.timelineTime}>{entry.time}</Text>
            <View style={[styles.timelineDivider, { backgroundColor: toneColor(entry.tone) }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>{entry.title}</Text>
              <Text style={styles.timelineBody}>{entry.body}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function RegionFocusCard({
  item,
  watched,
  onOpenRegion,
  onOpenEvent,
  onToggleWatch,
  sourceMeta,
}: {
  item: RegionFocus;
  watched?: boolean;
  onOpenRegion: (region: string) => void;
  onOpenEvent: (event: EventItem) => void;
  onToggleWatch: (label: string) => void;
  sourceMeta?: SourceMeta;
}) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.regionCard}>
      <View style={styles.regionTopRow}>
        <View>
          <Text style={styles.regionName}>{item.name}</Text>
          <Text style={styles.regionMeta}>{item.category}</Text>
        </View>
        <Pressable
          onPress={() => onToggleWatch(item.name)}
          style={[styles.inlineWatch, watched && styles.inlineWatchActive]}
        >
          <Text style={[styles.inlineWatchText, watched && styles.inlineWatchTextActive]}>
            {watched ? 'Saved' : 'Save'}
          </Text>
        </Pressable>
      </View>
      <Text style={styles.regionSummary}>{item.summary}</Text>
      {sourceMeta ? <SourceBadge meta={sourceMeta} compact /> : null}
      <View style={styles.regionFooter}>
        <Text style={styles.regionStat}>{item.stat}</Text>
        <View style={styles.regionActions}>
          <Pressable onPress={() => onOpenRegion(item.name)} style={styles.regionSecondaryButton}>
            <Text style={styles.regionSecondaryText}>Region</Text>
          </Pressable>
          <Pressable onPress={() => onOpenEvent(item.event)} style={styles.regionPrimaryButton}>
            <Text style={styles.regionPrimaryText}>Event</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    metricCard: {
      backgroundColor: theme.surfaceSoft,
      borderRadius: radii.lg,
      padding: spacing.md,
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.card,
    },
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minWidth: 0,
    },
    metricDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
    },
    metricLabel: {
      color: theme.subtleText,
      flex: 1,
      minWidth: 0,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    metricValue: {
      color: theme.text,
      fontSize: typeScale.metric,
      fontWeight: '800',
    },
    metricDelta: {
      color: theme.subtleText,
      fontSize: typeScale.label,
    },
    tickerRow: {
      gap: spacing.sm,
      paddingRight: spacing.md,
    },
    tickerPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.surfaceRaised,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    tickerLabel: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    tickerDetail: {
      color: theme.subtleText,
      fontSize: 12,
    },
    trendCard: {
      width: 236,
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: spacing.md,
      gap: 10,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.card,
    },
    trendTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '800',
    },
    trendSubtitle: {
      color: theme.subtleText,
      fontSize: 13,
      lineHeight: 19,
    },
    trendValue: {
      fontSize: 15,
      fontWeight: '700',
    },
    alertCard: {
      backgroundColor: theme.surfaceSoft,
      borderRadius: radii.lg,
      padding: spacing.md,
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: theme.border,
      borderLeftWidth: 3,
      ...shadows.card,
    },
    alertTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    alertDot: {
      width: 10,
      height: 10,
      borderRadius: 10,
    },
    alertRegion: {
      color: theme.subtleText,
      fontSize: typeScale.label,
      fontWeight: '700',
      textTransform: 'uppercase',
      flex: 1,
      letterSpacing: 0.8,
    },
    alertTitle: {
      color: theme.text,
      fontSize: typeScale.title,
      fontWeight: '800',
    },
    alertBody: {
      color: theme.subtleText,
      fontSize: typeScale.meta,
      lineHeight: 18,
    },
    expandedCard: {
      marginTop: 8,
      gap: spacing.xs,
      backgroundColor: theme.surfaceInset,
      borderRadius: radii.md,
      padding: spacing.md,
    },
    expandedText: {
      color: theme.text,
      fontSize: typeScale.meta,
      lineHeight: 18,
    },
    regionButton: {
      marginTop: 4,
      alignSelf: 'flex-start',
      borderRadius: radii.pill,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.accentSoft,
    },
    regionButtonText: {
      color: theme.accent,
      fontSize: typeScale.label,
      fontWeight: '800',
    },
    marketCard: {
      width: 170,
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: spacing.md,
      gap: 8,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.card,
    },
    marketRegion: {
      color: theme.subtleText,
      fontSize: 12,
      textTransform: 'uppercase',
    },
    marketName: {
      color: theme.text,
      fontSize: 17,
      fontWeight: '800',
    },
    marketValue: {
      color: theme.text,
      fontSize: 22,
      fontWeight: '800',
    },
    marketDelta: {
      fontSize: 14,
      fontWeight: '700',
    },
    watchCard: {
      backgroundColor: theme.surfaceSoft,
      borderRadius: radii.lg,
      padding: spacing.md,
      gap: 10,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.card,
    },
    watchHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.md,
    },
    watchActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    watchName: {
      color: theme.text,
      fontSize: typeScale.title,
      fontWeight: '800',
      flex: 1,
    },
    watchDetail: {
      color: theme.subtleText,
      fontSize: typeScale.meta,
      lineHeight: 18,
    },
    badge: {
      borderRadius: radii.pill,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    badgeText: {
      fontSize: typeScale.meta,
      fontWeight: '700',
    },
    inlineWatch: {
      borderRadius: radii.pill,
      backgroundColor: theme.surfaceRaised,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    inlineWatchActive: {
      backgroundColor: theme.accentSoft,
    },
    inlineWatchText: {
      color: theme.text,
      fontSize: typeScale.label,
      fontWeight: '700',
    },
    inlineWatchTextActive: {
      color: theme.accent,
    },
    weatherCard: {
      width: 190,
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: spacing.md,
      gap: 10,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.card,
    },
    weatherZone: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '800',
    },
    weatherStats: {
      gap: 4,
    },
    weatherStat: {
      color: theme.subtleText,
      fontSize: 13,
    },
    weatherStrip: {
      height: 6,
      borderRadius: 999,
    },
    timelineList: {
      gap: spacing.md,
    },
    timelineRow: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'flex-start',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    timelineTime: {
      width: 54,
      color: theme.subtleText,
      fontSize: typeScale.meta,
      fontWeight: '700',
      paddingTop: 2,
    },
    timelineDivider: {
      width: 3,
      minHeight: 56,
      borderRadius: radii.pill,
    },
    timelineContent: {
      flex: 1,
      gap: 4,
    },
    timelineTitle: {
      color: theme.text,
      fontSize: typeScale.body,
      fontWeight: '700',
    },
    timelineBody: {
      color: theme.subtleText,
      fontSize: typeScale.meta,
      lineHeight: 18,
    },
    regionCard: {
      backgroundColor: theme.surfaceSoft,
      borderRadius: 22,
      padding: spacing.md,
      gap: 10,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.card,
    },
    regionTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    regionName: {
      color: theme.text,
      fontSize: typeScale.title,
      fontWeight: '800',
    },
    regionMeta: {
      color: theme.subtleText,
      fontSize: typeScale.micro,
      textTransform: 'uppercase',
      marginTop: 2,
      letterSpacing: 0.7,
    },
    regionSummary: {
      color: theme.subtleText,
      fontSize: typeScale.meta,
      lineHeight: 18,
    },
    regionFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.md,
    },
    regionStat: {
      color: theme.text,
      fontSize: typeScale.meta,
      fontWeight: '700',
      flex: 1,
    },
    regionActions: {
      flexDirection: 'row',
      gap: 8,
    },
    regionPrimaryButton: {
      backgroundColor: theme.accentSoft,
      borderRadius: radii.pill,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    regionPrimaryText: {
      color: theme.accent,
      fontSize: typeScale.label,
      fontWeight: '800',
    },
    regionSecondaryButton: {
      backgroundColor: theme.surfaceRaised,
      borderRadius: radii.pill,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    regionSecondaryText: {
      color: theme.text,
      fontSize: typeScale.label,
      fontWeight: '700',
    },
  });
