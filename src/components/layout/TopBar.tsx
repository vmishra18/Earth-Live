import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, spacing, type AppThemePalette, typeScale } from '../../theme';
import type { DataSourceStatus } from '../../data/liveEarth';

type TopBarProps = {
  lastUpdated: string;
  sourceStatus: DataSourceStatus;
  categoryCountLabel: string;
  activeRegionFilter?: string | null;
  isStale?: boolean;
  isRefreshing?: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onClearRegionFilter?: () => void;
  theme: AppThemePalette;
};

export function TopBar({
  lastUpdated,
  sourceStatus,
  categoryCountLabel,
  activeRegionFilter = null,
  isStale = false,
  isRefreshing = false,
  onRefresh,
  onOpenSettings,
  onClearRegionFilter,
  theme,
}: TopBarProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.topBar}>
      <View>
        <Text style={styles.topBarTitle}>Earth Live</Text>
        <Text style={styles.topBarSubtitle}>{activeRegionFilter ? `${activeRegionFilter} filter active` : 'Global monitor'}</Text>
      </View>
      <View style={styles.rightStack}>
        <View style={styles.topBarRight}>
          <View
            style={[
              styles.topBarDot,
              { backgroundColor: isRefreshing ? theme.accent : sourceStatus.isLive ? theme.success : theme.warning },
            ]}
          />
          <Text style={styles.topBarLiveText}>{sourceStatus.label}</Text>
          <Text style={styles.topBarLiveSubtext}>
            {isRefreshing ? 'syncing' : isStale ? `stale · ${lastUpdated}` : lastUpdated}
          </Text>
        </View>
        <View style={styles.actionRow}>
          {activeRegionFilter ? (
            <Pressable onPress={onClearRegionFilter} style={[styles.filterButton, { backgroundColor: theme.surfaceInset }]}>
              <Text style={styles.filterText}>Clear Filter</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={onRefresh}
            disabled={isRefreshing}
            style={[
              styles.refreshButton,
              { backgroundColor: theme.surfaceSoft },
              isRefreshing && styles.refreshButtonDisabled,
            ]}
          >
            <Text style={styles.refreshText}>{isRefreshing ? 'Refreshing' : 'Refresh'}</Text>
          </Pressable>
          <Pressable onPress={onOpenSettings} style={[styles.settingsButton, { backgroundColor: theme.accentSoft }]}>
            <Text style={styles.settingsText}>Settings</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: AppThemePalette) =>
  StyleSheet.create({
    topBar: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.md,
    },
    topBarTitle: {
      color: theme.text,
      fontSize: typeScale.display,
      fontWeight: '800',
    },
    topBarSubtitle: {
      color: theme.subtleText,
      fontSize: typeScale.label,
      maxWidth: 220,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    rightStack: {
      alignItems: 'flex-end',
      gap: spacing.xs,
    },
    actionRow: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    topBarRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.surfaceSoft,
      borderRadius: radii.pill,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: theme.border,
    },
    topBarDot: {
      width: 8,
      height: 8,
      borderRadius: 8,
    },
    topBarLiveText: {
      color: theme.text,
      fontSize: typeScale.label,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    topBarLiveSubtext: {
      color: theme.subtleText,
      fontSize: typeScale.label,
    },
    settingsButton: {
      minWidth: 90,
      borderRadius: radii.md,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    settingsText: {
      color: theme.text,
      fontSize: typeScale.meta,
      fontWeight: '800',
    },
    filterButton: {
      minWidth: 98,
      borderRadius: radii.md,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    filterText: {
      color: theme.text,
      fontSize: typeScale.meta,
      fontWeight: '700',
    },
    refreshButton: {
      minWidth: 92,
      borderRadius: radii.md,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    refreshButtonDisabled: {
      opacity: 0.75,
    },
    refreshText: {
      color: theme.text,
      fontSize: typeScale.meta,
      fontWeight: '700',
    },
  });
