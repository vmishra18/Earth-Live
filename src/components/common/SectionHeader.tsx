import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radii, spacing, typeScale } from '../../theme';
import { useAppTheme } from '../../themeContext';

export function SectionHeader({
  title,
  hint,
  badge,
}: {
  title: string;
  hint: string;
  badge?: string;
}) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.sectionHeader}>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionHint}>{hint}</Text>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    sectionHeader: {
      gap: spacing.xs,
    },
    badge: {
      alignSelf: 'flex-start',
      borderRadius: radii.pill,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: theme.accentSoft,
    },
    badgeText: {
      color: theme.accent,
      fontSize: typeScale.micro,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    sectionTitle: {
      color: theme.text,
      fontSize: typeScale.section,
      fontWeight: '800',
    },
    sectionHint: {
      color: theme.subtleText,
      fontSize: typeScale.meta,
    },
  });
