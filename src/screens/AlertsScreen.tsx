import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { FiltersSheet } from '../components/common/FiltersSheet';
import { EmptyStateCard } from '../components/common/StateViews';
import { SectionHeader } from '../components/common/SectionHeader';
import { StaggeredItem } from '../components/common/StaggeredItem';
import { AlertCard } from '../components/data/Cards';
import {
  filterByCategories,
  filterBySeverity,
  filterEventsByQuery,
  type DashboardSnapshot,
  type EventItem,
  type FeedCategory,
  type SeverityFilter,
} from '../data/liveEarth';
import { radii, shadows, spacing, typeScale } from '../theme';
import { useAppTheme } from '../themeContext';

type AlertsScreenProps = {
  snapshot: DashboardSnapshot;
  searchQuery: string;
  severityFilter: SeverityFilter;
  activeCategories: FeedCategory[];
  watchlist: string[];
  filtersVisible: boolean;
  reducedMotion?: boolean;
  onSetSearchQuery: (value: string) => void;
  onSetSeverityFilter: (value: SeverityFilter) => void;
  onToggleCategory: (category: FeedCategory) => void;
  onToggleWatch: (label: string) => void;
  onOpenEvent: (event: EventItem) => void;
  onOpenRegion: (region: string) => void;
  onOpenFilters: () => void;
  onCloseFilters: () => void;
  onResetFilters: () => void;
  onFocusCritical: () => void;
};

export function AlertsScreen({
  snapshot,
  searchQuery,
  severityFilter,
  activeCategories,
  watchlist,
  filtersVisible,
  reducedMotion = false,
  onSetSearchQuery,
  onSetSeverityFilter,
  onToggleCategory,
  onToggleWatch,
  onOpenEvent,
  onOpenRegion,
  onOpenFilters,
  onCloseFilters,
  onResetFilters,
  onFocusCritical,
}: AlertsScreenProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const visibleAlerts = filterBySeverity(filterByCategories(snapshot.alerts, activeCategories), severityFilter).filter(
    (alert) =>
      filterEventsByQuery(
        snapshot.events.filter((event) => event.id === alert.eventId),
        searchQuery
      ).length > 0
  );
  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.commandCard}>
          <View style={styles.commandHeader}>
            <SectionHeader badge="Queue" title="Alerts" hint="Incident search and triage" />
            <View style={styles.resultBadge}>
              <Text style={styles.resultBadgeText}>{visibleAlerts.length}</Text>
            </View>
          </View>

          <View style={styles.toolbar}>
            <TextInput
              placeholder="Search region, title, or summary"
              placeholderTextColor={theme.subtleText}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={onSetSearchQuery}
            />
            <Pressable onPress={onOpenFilters} style={styles.filterButton}>
              <Text style={styles.filterButtonLabel}>Severity</Text>
              <Text style={styles.filterButtonValue}>
                {severityFilter === 'all' ? 'All' : severityFilter}
              </Text>
            </Pressable>
          </View>

          <View style={styles.feedMetaRow}>
            <Text style={styles.resultCopy}>
              {visibleAlerts.length} alert{visibleAlerts.length === 1 ? '' : 's'}
            </Text>
            <Text style={styles.resultCopy}>
              {activeCategories.length} feed{activeCategories.length === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        {visibleAlerts.length ? (
          <View style={styles.stackGroup}>
            {visibleAlerts.map((alert, index) => (
              <StaggeredItem key={alert.id} index={1 + index} reducedMotion={reducedMotion}>
                <AlertCard
                  alert={alert}
                  event={snapshot.events.find((event) => event.id === alert.eventId)}
                  onOpenEvent={onOpenEvent}
                  onOpenRegion={onOpenRegion}
                  onToggleWatch={onToggleWatch}
                  watched={watchlist.includes(alert.region)}
                />
              </StaggeredItem>
            ))}
          </View>
        ) : (
          <EmptyStateCard
            title="No matching alerts"
            message="Try another search or broaden the current filters."
          />
        )}

      </ScrollView>

      <FiltersSheet
        visible={filtersVisible}
        activeCategories={activeCategories}
        severityFilter={severityFilter}
        onClose={onCloseFilters}
        onResetFilters={onResetFilters}
        onFocusCritical={onFocusCritical}
        onToggleCategory={onToggleCategory}
        onSetSeverityFilter={onSetSeverityFilter}
      />
    </>
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
      gap: spacing.xl,
    },
    commandCard: {
      backgroundColor: theme.surfaceSoft,
      borderTopLeftRadius: radii.xl,
      borderTopRightRadius: radii.md,
      borderBottomLeftRadius: radii.lg,
      borderBottomRightRadius: radii.md,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: theme.commandBorder,
      ...shadows.card,
    },
    commandHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: spacing.sm,
    },
    searchInput: {
      flex: 1,
      borderRadius: radii.md,
      backgroundColor: theme.inputBackground,
      color: theme.text,
      paddingHorizontal: spacing.md,
      paddingVertical: 13,
      fontSize: typeScale.body,
      borderWidth: 1,
      borderColor: theme.border,
    },
    filterButton: {
      minWidth: 94,
      borderRadius: radii.md,
      backgroundColor: theme.commandBackground,
      borderWidth: 1,
      borderColor: theme.commandBorder,
      paddingHorizontal: 12,
      paddingVertical: 11,
      justifyContent: 'center',
    },
    filterButtonLabel: {
      color: theme.subtleText,
      fontSize: typeScale.label,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    filterButtonValue: {
      color: theme.text,
      fontSize: typeScale.title,
      fontWeight: '800',
      marginTop: 4,
    },
    resultBadge: {
      minWidth: 40,
      borderRadius: radii.pill,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: 'center',
      backgroundColor: theme.commandBackground,
      borderWidth: 1,
      borderColor: theme.commandBorder,
    },
    resultBadgeText: {
      color: theme.danger,
      fontSize: typeScale.meta,
      fontWeight: '800',
    },
    feedMetaRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    resultCopy: {
      color: theme.subtleText,
      fontSize: typeScale.meta,
    },
    stackGroup: {
      gap: spacing.md,
    },
  });
