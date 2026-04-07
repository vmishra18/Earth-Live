import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radii, spacing, typeScale } from '../../theme';
import { useAppTheme } from '../../themeContext';
import { toneColor } from '../../utils/tone';
import type { SourceMeta } from '../../utils/sourceStatus';

type SourceBadgeProps = {
  meta: SourceMeta;
  compact?: boolean;
};

export function SourceBadge({ meta, compact = false }: SourceBadgeProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const tint = toneColor(meta.tone);

  return (
    <View style={[styles.badge, compact && styles.badgeCompact, { backgroundColor: `${tint}18`, borderColor: `${tint}33` }]}>
      <View style={[styles.dot, { backgroundColor: tint }]} />
      <Text style={[styles.label, { color: tint }]}>{meta.label}</Text>
      {!compact ? <Text style={styles.detail}>{meta.detail}</Text> : null}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: radii.pill,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    badgeCompact: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 7,
    },
    label: {
      fontSize: typeScale.micro,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.7,
    },
    detail: {
      color: theme.subtleText,
      fontSize: typeScale.micro,
      fontWeight: '700',
      marginLeft: spacing.xs / 2,
    },
  });
