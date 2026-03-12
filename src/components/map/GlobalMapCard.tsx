import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, Polyline } from 'react-native-maps';
import type { AppThemePalette } from '../../theme';
import type { EventItem, FeedCategory, Hotspot, SatelliteTrack } from '../../data/liveEarth';
import { radii, shadows, spacing, typeScale } from '../../theme';
import { toneColor } from '../../utils/tone';
import { OrbitalStage } from '../globe/OrbitalStage';

type GlobalMapCardProps = {
  hotspots: Hotspot[];
  satellites: SatelliteTrack[];
  events: EventItem[];
  activeLayers: FeedCategory[];
  theme: AppThemePalette;
  glow: import('react-native').Animated.Value;
  size: number;
  mapHeight?: number;
  reducedMotion?: boolean;
  onOpenEvent?: (event: EventItem) => void;
};

const worldRegion = {
  latitude: 15,
  longitude: 0,
  latitudeDelta: 120,
  longitudeDelta: 120,
};

export function GlobalMapCard({
  hotspots,
  satellites,
  events,
  activeLayers,
  theme,
  glow,
  size,
  mapHeight = 360,
  reducedMotion = false,
  onOpenEvent,
}: GlobalMapCardProps) {
  const styles = createStyles(theme);

  if (Platform.OS === 'web') {
    return (
      <OrbitalStage
        hotspots={hotspots}
        satellites={satellites}
        events={events}
        activeLayers={activeLayers}
        glow={glow}
        size={size}
        reducedMotion={reducedMotion}
        onOpenEvent={onOpenEvent}
      />
    );
  }

  const visibleHotspots = hotspots.filter((hotspot) => activeLayers.includes(hotspot.category));
  const routeCoordinates = visibleHotspots.slice(0, 4).map((hotspot) => ({
    latitude: hotspot.latitude,
    longitude: hotspot.longitude,
  }));

  return (
    <View style={styles.card}>
      <MapView style={[styles.map, { height: mapHeight }]} initialRegion={worldRegion} mapType={theme.mapType}>
        {visibleHotspots.map((hotspot) => {
          const event = events.find((candidate) => candidate.id === hotspot.eventId);
          const accent = toneColor(event?.tone ?? 'neutral');

          return (
            <React.Fragment key={hotspot.id}>
              <Marker
                coordinate={{ latitude: hotspot.latitude, longitude: hotspot.longitude }}
                pinColor={accent}
                title={hotspot.label}
                description={hotspot.stat}
                onPress={() => event && onOpenEvent?.(event)}
              />
              <Circle
                center={{ latitude: hotspot.latitude, longitude: hotspot.longitude }}
                radius={Math.max(80000, hotspot.intensity * 1800)}
                strokeColor={accent}
                fillColor={`${accent}22`}
              />
            </React.Fragment>
          );
        })}

        {routeCoordinates.length > 1 ? (
          <Polyline coordinates={routeCoordinates} strokeColor={theme.accent} strokeWidth={3} />
        ) : null}
      </MapView>

      <View style={styles.legendOverlay}>
        <View style={styles.legendPill}>
          <Text style={styles.legendPillText}>{visibleHotspots.length} nodes</Text>
        </View>
        <View style={styles.legendPill}>
          <Text style={styles.legendPillText}>{satellites.length} assets</Text>
        </View>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Spatial monitor</Text>
        <Text style={styles.legendBody}>Tap any live node to open the linked event.</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: AppThemePalette) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.surfaceSoft,
      borderTopLeftRadius: radii.xl,
      borderTopRightRadius: radii.xl,
      borderBottomLeftRadius: radii.md,
      borderBottomRightRadius: radii.xl,
      padding: spacing.xs,
      gap: spacing.sm,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.card,
    },
    map: {
      height: 360,
      borderRadius: radii.lg,
    },
    legendOverlay: {
      position: 'absolute',
      top: spacing.md,
      left: spacing.md,
      flexDirection: 'row',
      gap: spacing.xs,
      zIndex: 2,
    },
    legendPill: {
      borderRadius: radii.pill,
      paddingHorizontal: 12,
      paddingVertical: 7,
      backgroundColor: theme.surfaceOverlay,
      borderWidth: 1,
      borderColor: theme.border,
    },
    legendPillText: {
      color: theme.text,
      fontSize: typeScale.label,
      fontWeight: '700',
    },
    legend: {
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.sm,
      gap: 4,
    },
    legendTitle: {
      color: theme.text,
      fontSize: typeScale.title,
      fontWeight: '800',
    },
    legendBody: {
      color: theme.subtleText,
      fontSize: typeScale.meta,
    },
  });
