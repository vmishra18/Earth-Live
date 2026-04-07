import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SectionHeader } from '../components/common/SectionHeader';
import { StaggeredItem } from '../components/common/StaggeredItem';
import { FeedHealthPanel } from '../components/common/FeedHealthPanel';
import { MetricCard, RegionFocusCard, TickerRow, TrendCard } from '../components/data/Cards';
import { ActivityChart } from '../components/data/Charts';
import { type DashboardSnapshot, type EventItem } from '../data/liveEarth';
import { radii, shadows, spacing, typeScale } from '../theme';
import { useAppTheme } from '../themeContext';
import { deriveRegionFocus } from '../utils/regions';
import { deriveCategorySourceMeta } from '../utils/sourceStatus';

type OverviewScreenProps = {
  snapshot: DashboardSnapshot;
  previousSnapshot: DashboardSnapshot;
  compactMetrics: boolean;
  stackHero: boolean;
  lastUpdated: string;
  watchlist: string[];
  reducedMotion?: boolean;
  compareMode?: boolean;
  onToggleWatch: (label: string) => void;
  onOpenEvent: (event: EventItem) => void;
  onOpenRegion: (region: string) => void;
};

function compareLabel(current: DashboardSnapshot, previous: DashboardSnapshot, metricId: string) {
  const currentMetric = current.metrics.find((metric) => metric.id === metricId);
  const previousMetric = previous.metrics.find((metric) => metric.id === metricId);
  if (!currentMetric || !previousMetric) {
    return 'No prior frame';
  }

  const diff = currentMetric.numericValue - previousMetric.numericValue;
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${diff.toFixed(currentMetric.decimals ?? 0)} vs prior`;
}

export function OverviewScreen({
  snapshot,
  previousSnapshot,
  compactMetrics,
  stackHero,
  lastUpdated,
  watchlist,
  reducedMotion = false,
  compareMode = false,
  onToggleWatch,
  onOpenEvent,
  onOpenRegion,
}: OverviewScreenProps) {
  const uiTheme = useAppTheme();
  const styles = createStyles(uiTheme);
  const metrics = snapshot.metrics.slice(0, 3);
  const focusRegions = deriveRegionFocus(snapshot).slice(0, 2);
  const primaryMetrics = metrics.slice(0, compactMetrics ? 2 : 3);
  const featuredMetric = compactMetrics ? metrics[2] : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <StaggeredItem index={0} reducedMotion={reducedMotion}>
        <View style={styles.heroCard}>
          <View style={[styles.heroHeader, stackHero && styles.heroHeaderStacked]}>
            <View style={[styles.heroTitleWrap, stackHero && styles.heroTitleWrapStacked]}>
              <Text style={styles.eyebrow}>Home</Text>
              <Text style={styles.heroTitle}>Operations overview</Text>
              <Text style={styles.heroCopy}>Live posture and top regions.</Text>
            </View>
            <View style={[styles.inlineBadges, stackHero && styles.inlineBadgesStacked]}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{snapshot.sourceStatus.label}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>{lastUpdated}</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroPrimaryRow}>
              <View style={[styles.heroStatCard, stackHero && styles.heroStatCardCompact]}>
                <Text style={styles.heroStatValue}>{snapshot.summary.activeSignals}</Text>
                <Text
                  style={styles.heroStatLabel}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  Signals
                </Text>
              </View>
              <View style={[styles.heroStatCard, stackHero && styles.heroStatCardCompact]}>
                <Text style={styles.heroStatValue}>{snapshot.summary.alerts}</Text>
                <Text
                  style={styles.heroStatLabel}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  Alerts
                </Text>
              </View>
            </View>
            <View style={styles.heroCoverageCard}>
              <Text style={styles.heroCoverageValue}>{snapshot.summary.coverage}</Text>
              <Text
                style={styles.heroStatLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Coverage
              </Text>
            </View>
          </View>
        </View>
      </StaggeredItem>

      <StaggeredItem index={1} reducedMotion={reducedMotion}>
        <SectionHeader badge="Signals" title="Key signals" hint="Core feeds only." />
      </StaggeredItem>

      <StaggeredItem index={2} reducedMotion={reducedMotion}>
        <FeedHealthPanel snapshot={snapshot} />
      </StaggeredItem>

      <StaggeredItem index={3} reducedMotion={reducedMotion}>
        <TickerRow feed={snapshot.feed} events={snapshot.events} onOpenEvent={onOpenEvent} />
      </StaggeredItem>

      <View style={styles.metricGrid}>
        {primaryMetrics.map((metric, index) => (
          <StaggeredItem
            key={metric.id}
            index={4 + index}
            reducedMotion={reducedMotion}
            style={compactMetrics ? styles.metricCellCompact : styles.metricCell}
          >
            <View style={styles.metricBlock}>
              <MetricCard metric={metric} reducedMotion={reducedMotion} />
              {compareMode ? (
                <View style={styles.compareBar}>
                  <Text style={styles.compareText}>{compareLabel(snapshot, previousSnapshot, metric.id)}</Text>
                </View>
              ) : null}
            </View>
          </StaggeredItem>
        ))}
      </View>

      {featuredMetric ? (
        <StaggeredItem index={7} reducedMotion={reducedMotion}>
          <View style={styles.featuredMetricWrap}>
            <MetricCard metric={featuredMetric} reducedMotion={reducedMotion} />
            {compareMode ? (
              <View style={styles.compareBar}>
                <Text style={styles.compareText}>{compareLabel(snapshot, previousSnapshot, featuredMetric.id)}</Text>
              </View>
            ) : null}
          </View>
        </StaggeredItem>
      ) : null}

      <StaggeredItem index={8} reducedMotion={reducedMotion}>
        <SectionHeader badge="Trends" title="Trend deck" hint="Tap to open the linked event." />
      </StaggeredItem>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendRow}>
        {snapshot.trending.map((item, index) => {
          const event = snapshot.events.find((candidate) => candidate.id === item.eventId);

          return (
            <StaggeredItem key={item.id} index={9 + index} reducedMotion={reducedMotion}>
              <TrendCard
                item={item}
                event={event}
                onOpenEvent={onOpenEvent}
                sourceMeta={deriveCategorySourceMeta(snapshot, item.category)}
              />
            </StaggeredItem>
          );
        })}
      </ScrollView>

      <StaggeredItem index={13} reducedMotion={reducedMotion}>
        <View style={styles.activityCard}>
          <SectionHeader badge="Flow" title="Activity" hint="12-hour range" />
          <ActivityChart points={snapshot.activity} />
        </View>
      </StaggeredItem>

      <StaggeredItem index={14} reducedMotion={reducedMotion}>
        <SectionHeader badge="Focus" title="Priority regions" hint="Open a region or event." />
      </StaggeredItem>

      <View style={styles.regionStack}>
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
      paddingTop: spacing.md,
      paddingBottom: 156,
      gap: spacing.xxl,
    },
    heroCard: {
      backgroundColor: theme.surfaceSoft,
      borderRadius: radii.xl,
      padding: spacing.lg,
      gap: spacing.md,
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
    heroHeaderStacked: {
      flexDirection: 'column',
    },
    heroTitleWrap: {
      flex: 1,
      minWidth: 0,
      gap: spacing.sm,
    },
    heroTitleWrapStacked: {
      width: '100%',
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
      lineHeight: 32,
    },
    heroCopy: {
      color: theme.subtleText,
      fontSize: typeScale.body,
      lineHeight: 20,
    },
    inlineBadges: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
    },
    inlineBadgesStacked: {
      width: '100%',
      justifyContent: 'flex-start',
    },
    heroStats: {
      gap: spacing.sm,
    },
    heroPrimaryRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    heroStatCard: {
      flex: 1,
      minHeight: 82,
      borderRadius: radii.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      backgroundColor: theme.surfaceMuted,
      gap: 4,
    },
    heroStatCardCompact: {
      minHeight: 0,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    heroCoverageCard: {
      borderRadius: radii.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: theme.surfaceInset,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 4,
    },
    heroStatValue: {
      color: theme.text,
      fontSize: typeScale.metric,
      fontWeight: '800',
    },
    heroCoverageValue: {
      color: theme.text,
      fontSize: typeScale.metric,
      fontWeight: '800',
    },
    heroStatLabel: {
      color: theme.subtleText,
      fontSize: typeScale.label,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    statusBadge: {
      borderRadius: radii.pill,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.accentSoft,
    },
    statusBadgeText: {
      color: theme.accent,
      fontSize: typeScale.label,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    metaBadge: {
      borderRadius: radii.pill,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.surfaceInset,
    },
    metaBadgeText: {
      color: theme.text,
      fontSize: typeScale.label,
      fontWeight: '700',
    },
    metricGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    trendRow: {
      gap: spacing.md,
      paddingRight: spacing.lg,
    },
    metricCell: {
      width: '31.5%',
      marginBottom: spacing.md,
    },
    metricCellCompact: {
      width: '48%',
      marginBottom: spacing.sm,
    },
    metricBlock: {
      gap: spacing.xs,
    },
    featuredMetricWrap: {
      gap: spacing.xs,
    },
    compareBar: {
      borderRadius: radii.md,
      backgroundColor: theme.surfaceInset,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    compareText: {
      color: theme.subtleText,
      fontSize: typeScale.label,
      fontWeight: '700',
    },
    activityCard: {
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
    regionStack: {
      gap: spacing.md,
    },
  });
