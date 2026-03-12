import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { EventItem, FeedCategory, Hotspot, SatelliteTrack } from '../../data/liveEarth';
import { colors, shadows, spacing } from '../../theme';
import { useAppTheme } from '../../themeContext';
import { toneColor } from '../../utils/tone';

type OrbitalStageProps = {
  hotspots: Hotspot[];
  satellites: SatelliteTrack[];
  events: EventItem[];
  activeLayers: FeedCategory[];
  glow: Animated.Value;
  size: number;
  reducedMotion?: boolean;
  onOpenEvent?: (event: EventItem) => void;
};

export function OrbitalStage({
  hotspots,
  satellites,
  events,
  activeLayers,
  glow,
  size,
  reducedMotion = false,
  onOpenEvent,
}: OrbitalStageProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const sweepRotate = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const outerRingSize = size * 0.88;
  const midRingSize = size * 0.66;
  const innerRingSize = size * 0.42;

  return (
    <View style={styles.orbitCard}>
      <View style={styles.orbitStage}>
        <View style={[styles.globeShell, { width: size, height: size, borderRadius: size / 2 }]}>
          <View
            style={[
              styles.globeRing,
              { width: outerRingSize, height: outerRingSize, borderRadius: outerRingSize / 2 },
            ]}
          />
          <View
            style={[
              styles.globeRing,
              { width: midRingSize, height: midRingSize, borderRadius: midRingSize / 2 },
            ]}
          />
          <View
            style={[
              styles.globeRing,
              { width: innerRingSize, height: innerRingSize, borderRadius: innerRingSize / 2 },
            ]}
          />
          <View style={styles.globeCrossHorizontal} />
          <View style={styles.globeCrossVertical} />
          {!reducedMotion ? (
            <Animated.View
              style={[
                styles.radarSweep,
                {
                  top: size * 0.06,
                  height: size * 0.44,
                  transform: [{ rotate: sweepRotate }],
                },
              ]}
            />
          ) : null}

          {hotspots
            .filter((hotspot) => activeLayers.includes(hotspot.category))
            .map((hotspot, index) => {
              const event = events.find((candidate) => candidate.id === hotspot.eventId);
              const scale = glow.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.35 + index * 0.03, 1],
              });

              return (
                <Pressable
                  key={hotspot.id}
                  onPress={() => event && onOpenEvent?.(event)}
                  style={[
                    styles.hotspotWrap,
                    {
                      left: `${hotspot.x}%`,
                      top: `${hotspot.y}%`,
                    },
                  ]}
                >
                  {!reducedMotion ? (
                    <Animated.View
                      style={[
                        styles.hotspotPulse,
                        {
                          backgroundColor: hotspot.color,
                          transform: [{ scale }],
                          opacity: 0.18,
                        },
                      ]}
                    />
                  ) : null}
                  <View style={[styles.hotspotDot, { backgroundColor: hotspot.color }]} />
                  <Text style={styles.hotspotLabel}>{hotspot.label}</Text>
                  <Text style={styles.hotspotStat}>{hotspot.stat}</Text>
                </Pressable>
              );
            })}
        </View>
      </View>

      <View style={styles.orbitInfoRow}>
        {satellites.map((satellite) => (
          <View key={satellite.id} style={styles.orbitInfoCard}>
            <Text style={styles.orbitInfoLabel}>{satellite.label}</Text>
            <Text style={styles.orbitInfoOrbit}>{satellite.orbit}</Text>
            <Text style={styles.orbitInfoCoverage}>{satellite.coverage}</Text>
            <Text style={[styles.orbitInfoLatency, { color: toneColor(satellite.tone) }]}>
              {satellite.latency}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    orbitCard: {
      backgroundColor: theme.surface,
      borderRadius: 30,
      padding: spacing.lg,
      gap: spacing.lg,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.card,
    },
    orbitStage: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    globeShell: {
      backgroundColor: theme.globeShell,
      overflow: 'hidden',
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    globeRing: {
      position: 'absolute',
      borderWidth: 1,
      borderColor: theme.gridLine,
    },
    globeCrossHorizontal: {
      position: 'absolute',
      left: 20,
      right: 20,
      height: 1,
      backgroundColor: theme.gridLine,
    },
    globeCrossVertical: {
      position: 'absolute',
      top: 20,
      bottom: 20,
      width: 1,
      backgroundColor: theme.gridLine,
    },
    radarSweep: {
      position: 'absolute',
      width: 2,
      backgroundColor: theme.success,
      shadowColor: theme.success,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 8,
    },
    hotspotWrap: {
      position: 'absolute',
      alignItems: 'center',
      marginLeft: -17,
      marginTop: -17,
    },
    hotspotPulse: {
      position: 'absolute',
      width: 36,
      height: 36,
      borderRadius: 36,
    },
    hotspotDot: {
      width: 11,
      height: 11,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: theme.text,
    },
    hotspotLabel: {
      marginTop: 8,
      color: theme.text,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    hotspotStat: {
      color: theme.subtleText,
      fontSize: 10,
      marginTop: 2,
    },
    orbitInfoRow: {
      gap: spacing.sm,
    },
    orbitInfoCard: {
      backgroundColor: theme.surfaceRaised,
      borderRadius: 20,
      padding: spacing.md,
      gap: 4,
    },
    orbitInfoLabel: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '700',
    },
    orbitInfoOrbit: {
      color: theme.subtleText,
      fontSize: 12,
      textTransform: 'uppercase',
    },
    orbitInfoCoverage: {
      color: theme.text,
      fontSize: 13,
    },
    orbitInfoLatency: {
      fontSize: 12,
      fontWeight: '700',
    },
  });
