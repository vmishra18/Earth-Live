import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { FeedCategory, SeverityFilter } from '../../data/liveEarth';
import { spacing } from '../../theme';
import { useAppTheme } from '../../themeContext';
import { FilterChips, SingleSelectChips } from './FilterChips';

type FiltersSheetProps = {
  visible: boolean;
  activeCategories: FeedCategory[];
  severityFilter: SeverityFilter;
  onClose: () => void;
  onToggleCategory: (category: FeedCategory) => void;
  onSetSeverityFilter: (value: SeverityFilter) => void;
};

const categoryOptions: Array<{ label: string; value: FeedCategory }> = [
  { label: 'earthquakes', value: 'earthquakes' },
  { label: 'flights', value: 'flights' },
  { label: 'weather', value: 'weather' },
  { label: 'ocean', value: 'ocean' },
  { label: 'markets', value: 'markets' },
  { label: 'satellites', value: 'satellites' },
];

export function FiltersSheet({
  visible,
  activeCategories,
  severityFilter,
  onClose,
  onToggleCategory,
  onSetSeverityFilter,
}: FiltersSheetProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Alert Filters</Text>
              <Text style={styles.copy}>Set severity and feed scope.</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Done</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.section}>
              <Text style={styles.label}>Severity</Text>
              <SingleSelectChips<SeverityFilter>
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Critical', value: 'critical' },
                  { label: 'Elevated', value: 'elevated' },
                  { label: 'Normal', value: 'normal' },
                ]}
                selected={severityFilter}
                onSelect={onSetSeverityFilter}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Feeds</Text>
              <FilterChips options={categoryOptions} selected={activeCategories} onToggle={onToggleCategory} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.surfaceOverlay,
    },
    sheet: {
      backgroundColor: theme.background,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      padding: spacing.lg,
      gap: spacing.lg,
      minHeight: 320,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    title: {
      color: theme.text,
      fontSize: 22,
      fontWeight: '800',
    },
    copy: {
      color: theme.subtleText,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 4,
      maxWidth: 240,
    },
    closeButton: {
      backgroundColor: theme.surfaceRaised,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    closeText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '700',
    },
    content: {
      gap: spacing.lg,
      paddingBottom: spacing.lg,
    },
    section: {
      gap: spacing.sm,
    },
    label: {
      color: theme.subtleText,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
  });
