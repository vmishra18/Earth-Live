import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { radii, shadows, spacing, typeScale } from '../../theme';
import { useAppTheme } from '../../themeContext';

export function StatusBanner({
  tone = 'info',
  title,
  message,
}: {
  tone?: 'info' | 'warn' | 'danger';
  title: string;
  message: string;
}) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const tint = tone === 'danger' ? theme.danger : tone === 'warn' ? theme.warning : theme.accent;

  return (
    <View style={[styles.banner, { borderColor: tint, backgroundColor: `${tint}14` }]}>
      <Text style={[styles.bannerTitle, { color: tint }]}>{title}</Text>
      <Text style={styles.bannerMessage}>{message}</Text>
    </View>
  );
}

export function LoadingStateCard({ title, message }: { title: string; message: string }) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.stateCard}>
      <ActivityIndicator color={theme.accent} />
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateMessage}>{message}</Text>
    </View>
  );
}

export function EmptyStateCard({ title, message }: { title: string; message: string }) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.stateCard}>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateMessage}>{message}</Text>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    banner: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
      borderRadius: radii.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderWidth: 1,
    },
    bannerTitle: {
      fontSize: typeScale.meta,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.7,
    },
    bannerMessage: {
      color: theme.text,
      fontSize: typeScale.body,
      lineHeight: 19,
      marginTop: 4,
    },
    stateCard: {
      backgroundColor: theme.surfaceSoft,
      borderRadius: radii.lg,
      padding: spacing.xl,
      gap: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.card,
    },
    stateTitle: {
      color: theme.text,
      fontSize: typeScale.section,
      fontWeight: '800',
      textAlign: 'center',
    },
    stateMessage: {
      color: theme.subtleText,
      fontSize: typeScale.body,
      lineHeight: 21,
      textAlign: 'center',
    },
  });
