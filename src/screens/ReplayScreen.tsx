import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SingleSelectChips } from '../components/common/FilterChips';
import { StaggeredItem } from '../components/common/StaggeredItem';
import { HistoryTrendChart, ReplayBars } from '../components/data/Charts';
import { TimelineList } from '../components/data/Cards';
import type { DashboardSnapshot, EventItem, FeedCategory } from '../data/liveEarth';
import { radii, shadows, spacing, typeScale } from '../theme';
import { useAppTheme } from '../themeContext';
import { deriveCategoryHistory, deriveRegionHistory } from '../utils/history';

type ReplayScreenProps = {
  snapshot: DashboardSnapshot;
  history: DashboardSnapshot[];
  availableRegions: string[];
  regionFilter?: string | null;
  playbackEnabled: boolean;
  reducedMotion?: boolean;
  onTogglePlayback: () => void;
  onOpenEvent: (event: EventItem) => void;
  onSetRegionFilter: (region: string | null) => void;
};

export function ReplayScreen({
  snapshot,
  history,
  availableRegions,
  regionFilter = null,
  playbackEnabled,
  reducedMotion = false,
  onTogglePlayback,
  onOpenEvent,
  onSetRegionFilter,
}: ReplayScreenProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const recentHistory = history.slice(-7);
  const [selectedIndex, setSelectedIndex] = useState(recentHistory.length - 1);
  const [selectedCategory, setSelectedCategory] = useState<FeedCategory>('weather');

  const selectedSnapshot = recentHistory[selectedIndex] ?? snapshot;
  const replayFrames = useMemo(
    () =>
      recentHistory.map((item, index) => ({
        label: index === recentHistory.length - 1 ? 'Now' : `${recentHistory.length - index - 1} back`,
        intensity: Number(item.summary.activeSignals) * 4,
        status: item.sourceStatus.label.toLowerCase(),
      })),
    [recentHistory]
  );
  const categoryHistory = deriveCategoryHistory(recentHistory, selectedCategory);
  const regionHistory = regionFilter ? deriveRegionHistory(recentHistory, regionFilter) : [];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StaggeredItem index={0} reducedMotion={reducedMotion}>
        <View style={styles.panelCard}>
          <View style={styles.panelHeader}>
            <View>
              <View style={styles.replayBadge}>
                <Text style={styles.replayBadgeText}>History</Text>
              </View>
              <Text style={styles.panelTitle}>Replay</Text>
              <Text style={styles.panelCopy}>Recent snapshots from local history.</Text>
            </View>
            <Pressable
              onPress={onTogglePlayback}
              style={[styles.toggleButton, playbackEnabled && styles.toggleButtonActive]}
            >
              <Text style={[styles.toggleText, playbackEnabled && styles.toggleTextActive]}>
                {playbackEnabled ? 'Playback On' : 'Playback Off'}
              </Text>
            </Pressable>
          </View>

          <ReplayBars frames={replayFrames} />
          <View style={styles.frameRow}>
            {recentHistory.map((item, index) => (
              <Pressable
                key={item.lastUpdated}
                onPress={() => setSelectedIndex(index)}
                style={[styles.frameChip, index === selectedIndex && styles.frameChipActive]}
              >
                <Text style={[styles.frameChipText, index === selectedIndex && styles.frameChipTextActive]}>
                  {new Date(item.lastUpdated).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </StaggeredItem>

      <StaggeredItem index={1} reducedMotion={reducedMotion}>
        <View style={styles.panelCard}>
          <Text style={styles.timelineTitleBlock}>History focus</Text>
          <Text style={styles.timelineCopy}>Switch category trends and apply a global region filter from replay.</Text>
          <SingleSelectChips<FeedCategory>
            options={[
              { label: 'Weather', value: 'weather' },
              { label: 'Flights', value: 'flights' },
              { label: 'Quakes', value: 'earthquakes' },
              { label: 'Ocean', value: 'ocean' },
              { label: 'Markets', value: 'markets' },
              { label: 'Sat', value: 'satellites' },
            ]}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
          <HistoryTrendChart points={categoryHistory} />
          <View style={styles.frameRow}>
            <SingleSelectChips<string>
              options={[{ label: 'All Regions', value: '__all__' }, ...availableRegions.map((item) => ({ label: item, value: item }))]}
              selected={regionFilter ?? '__all__'}
              onSelect={(value) => onSetRegionFilter(value === '__all__' ? null : value)}
            />
          </View>
          {regionFilter ? (
            <View style={styles.regionHistoryWrap}>
              <Text style={styles.timelineCopy}>Region history for {regionFilter}</Text>
              <HistoryTrendChart points={regionHistory} />
            </View>
          ) : null}
        </View>
      </StaggeredItem>

      <StaggeredItem index={2} reducedMotion={reducedMotion}>
        <View style={styles.panelCard}>
          <Text style={styles.timelineTitleBlock}>Timeline</Text>
          <Text style={styles.timelineCopy}>
            Snapshot from{' '}
            {new Date(selectedSnapshot.lastUpdated).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
            {' · '}
            {selectedSnapshot.sourceStatus.label}
          </Text>
          <TimelineList
            timeline={selectedSnapshot.timeline}
            events={selectedSnapshot.events}
            onOpenEvent={onOpenEvent}
          />
        </View>
      </StaggeredItem>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  screen: {
    flex: 1,
  },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: 136,
      gap: spacing.xxl,
    },
  panelCard: {
    backgroundColor: theme.surfaceSoft,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.xl,
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: theme.border,
    ...shadows.card,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  panelTitle: {
    color: theme.text,
    fontSize: typeScale.section,
    fontWeight: '800',
  },
  panelCopy: {
    color: theme.subtleText,
    fontSize: typeScale.meta,
    lineHeight: 18,
  },
  replayBadge: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: theme.surfaceInset,
    marginBottom: 8,
  },
  replayBadgeText: {
    color: theme.subtleText,
    fontSize: typeScale.micro,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  toggleButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceInset,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toggleButtonActive: {
    borderColor: theme.accent,
    backgroundColor: theme.accentSoft,
  },
  toggleText: {
    color: theme.text,
    fontSize: typeScale.meta,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: theme.accent,
  },
  frameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  regionHistoryWrap: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  frameChip: {
    borderRadius: radii.pill,
    backgroundColor: theme.surfaceInset,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  frameChipActive: {
    backgroundColor: theme.accentSoft,
  },
  frameChipText: {
    color: theme.text,
    fontSize: typeScale.label,
    fontWeight: '700',
  },
  frameChipTextActive: {
    color: theme.accent,
  },
  timelineTitleBlock: {
    color: theme.text,
    fontSize: typeScale.section,
    fontWeight: '800',
  },
  timelineCopy: {
    color: theme.subtleText,
    fontSize: typeScale.meta,
    lineHeight: 19,
  },
});
