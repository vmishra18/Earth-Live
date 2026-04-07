import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { DashboardSnapshot } from '../../data/liveEarth';
import { radii, shadows, spacing, typeScale } from '../../theme';
import { useAppTheme } from '../../themeContext';
import { deriveFeedHealth } from '../../utils/sourceStatus';
import { SourceBadge } from './SourceBadge';

export function FeedHealthPanel({ snapshot }: { snapshot: DashboardSnapshot }) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const items = deriveFeedHealth(snapshot);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Feed health</Text>
        <Text style={styles.copy}>Source status by category.</Text>
      </View>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.category} style={styles.itemCard}>
            <Text style={styles.itemTitle}>{item.category}</Text>
            <Text style={styles.itemCount}>{item.eventCount} events</Text>
            <Text style={styles.itemMeta}>{new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            <SourceBadge meta={item.source} compact />
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.surfaceSoft,
      borderRadius: radii.xl,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.card,
    },
    header: {
      gap: 4,
    },
    title: {
      color: theme.text,
      fontSize: typeScale.section,
      fontWeight: '800',
    },
    copy: {
      color: theme.subtleText,
      fontSize: typeScale.meta,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      justifyContent: 'space-between',
    },
    itemCard: {
      width: '48%',
      borderRadius: radii.lg,
      padding: spacing.md,
      backgroundColor: theme.surfaceInset,
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: theme.border,
    },
    itemTitle: {
      color: theme.text,
      fontSize: typeScale.label,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    itemCount: {
      color: theme.subtleText,
      fontSize: typeScale.meta,
      fontWeight: '700',
    },
    itemMeta: {
      color: theme.subtleText,
      fontSize: typeScale.micro,
    },
  });
