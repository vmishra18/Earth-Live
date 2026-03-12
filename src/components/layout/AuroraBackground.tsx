import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { AppThemePalette } from '../../theme';

export function AuroraBackground({
  shift,
  theme,
}: {
  shift: Animated.Value;
  theme: AppThemePalette;
}) {
  const leftTranslate = shift.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 30],
  });
  const rightTranslate = shift.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -25],
  });
  const leftScale = shift.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.12, 1],
  });
  const rightScale = shift.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1.08, 0.98, 1.08],
  });

  return (
    <View pointerEvents="none" style={styles.backgroundWrap}>
      <View style={[styles.baseWash, { backgroundColor: theme.surfaceInset }]} />
      <Animated.View
        style={[
          styles.auroraOrbLarge,
          { backgroundColor: theme.glowPrimary },
          {
            transform: [{ translateX: leftTranslate }, { scale: leftScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.auroraOrbSmall,
          { backgroundColor: theme.glowSecondary },
          {
            transform: [{ translateX: rightTranslate }, { scale: rightScale }],
          },
        ]}
      />
      <View style={[styles.backgroundGrid, { borderColor: theme.gridLine }]} />
      <View style={[styles.backgroundVeil, { backgroundColor: theme.surfaceOverlay }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  baseWash: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
  },
  auroraOrbLarge: {
    position: 'absolute',
    top: -40,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 280,
  },
  auroraOrbSmall: {
    position: 'absolute',
    top: 140,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 220,
  },
  backgroundGrid: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 1,
    opacity: 0.45,
  },
  backgroundVeil: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18,
  },
});
