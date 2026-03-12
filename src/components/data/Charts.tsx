import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ActivityPoint, ReplayFrame } from '../../data/liveEarth';
import { colors, radii, spacing, typeScale } from '../../theme';
import { useAppTheme } from '../../themeContext';

export function ActivityChart({ points }: { points: ActivityPoint[] }) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <View style={styles.chartWrap}>
      <View style={styles.gridLines}>
        <View style={styles.gridLine} />
        <View style={styles.gridLine} />
        <View style={styles.gridLine} />
      </View>
      {points.map((point) => (
        <View key={point.label} style={styles.chartColumn}>
          <View style={styles.chartTrack}>
            <View
              style={[
                styles.chartFill,
                {
                  height: `${Math.max((point.value / maxValue) * 100, 8)}%`,
                  backgroundColor: point.highlight ? theme.accent : theme.surfaceRaised,
                },
              ]}
            />
          </View>
          <Text style={styles.chartLabel}>{point.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function ReplayBars({ frames }: { frames: ReplayFrame[] }) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const maxValue = Math.max(...frames.map((frame) => frame.intensity), 1);

  return (
    <View style={styles.replayBars}>
      <View style={styles.gridLines}>
        <View style={styles.gridLine} />
        <View style={styles.gridLine} />
        <View style={styles.gridLine} />
      </View>
      {frames.map((frame, index) => (
        <View key={frame.label} style={styles.replayColumn}>
          <View style={styles.replayTrack}>
            <View
              style={[
                styles.replayFill,
                {
                  height: `${Math.max((frame.intensity / maxValue) * 100, 12)}%`,
                  backgroundColor: index === frames.length - 1 ? theme.accent : theme.surfaceRaised,
                },
              ]}
            />
          </View>
          <Text style={styles.replayLabel}>{frame.label}</Text>
          <Text style={styles.replayStatus}>{frame.status}</Text>
        </View>
      ))}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    chartWrap: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 8,
      height: 214,
      paddingTop: spacing.sm,
    },
    gridLines: {
      ...StyleSheet.absoluteFillObject,
      top: spacing.sm,
      bottom: 28,
      justifyContent: 'space-between',
    },
    gridLine: {
      borderTopWidth: 1,
      borderColor: theme.gridLine,
      opacity: 0.45,
    },
    chartColumn: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
      zIndex: 1,
    },
    chartTrack: {
      width: '100%',
      height: 180,
      borderRadius: radii.pill,
      backgroundColor: theme.surfaceSoft,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    chartFill: {
      width: '100%',
      borderRadius: radii.pill,
    },
    chartLabel: {
      color: theme.subtleText,
      fontSize: typeScale.micro,
    },
    replayBars: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 10,
      height: 220,
      paddingTop: spacing.sm,
    },
    replayColumn: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
      zIndex: 1,
    },
    replayTrack: {
      width: '100%',
      height: 170,
      borderRadius: radii.pill,
      backgroundColor: theme.surfaceSoft,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    replayFill: {
      width: '100%',
      borderRadius: radii.pill,
    },
    replayLabel: {
      color: theme.text,
      fontSize: typeScale.label,
      fontWeight: '700',
    },
    replayStatus: {
      color: theme.subtleText,
      fontSize: typeScale.micro,
      textTransform: 'uppercase',
    },
  });
