import React from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import type { EventItem } from '../../data/liveEarth';
import type { AppThemePalette } from '../../theme';
import { shadows, spacing } from '../../theme';
import { toneColor } from '../../utils/tone';

type EventDetailModalProps = {
  event: EventItem | null;
  visible: boolean;
  watched: boolean;
  theme: AppThemePalette;
  onClose: () => void;
  onToggleWatch: (label: string) => void;
  onOpenRegion?: (region: string) => void;
};

export function EventDetailModal({
  event,
  visible,
  watched,
  theme,
  onClose,
  onToggleWatch,
  onOpenRegion,
}: EventDetailModalProps) {
  if (!event) {
    return null;
  }

  const styles = createStyles(theme);

  const hasCoordinates = event.latitude != null && event.longitude != null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View style={[styles.dot, { backgroundColor: toneColor(event.tone) }]} />
            <Text style={styles.region}>{event.region}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Back</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.summary}>{event.summary}</Text>

          {hasCoordinates ? (
            Platform.OS === 'web' ? (
              <View style={styles.mapFallback}>
                <Text style={styles.mapFallbackText}>
                  {event.latitude?.toFixed(2)}, {event.longitude?.toFixed(2)}
                </Text>
              </View>
            ) : (
              <MapView
                style={styles.map}
                mapType={theme.mapType}
                initialRegion={{
                  latitude: event.latitude!,
                  longitude: event.longitude!,
                  latitudeDelta: 8,
                  longitudeDelta: 8,
                }}
              >
                <Marker
                  coordinate={{ latitude: event.latitude!, longitude: event.longitude! }}
                  title={event.title}
                  pinColor={theme.accent}
                />
              </MapView>
            )
          ) : null}

          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Category</Text>
              <Text style={styles.statValue}>{event.category}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Stat</Text>
              <Text style={styles.statValue}>{event.stat}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Source</Text>
              <Text style={styles.statValue}>{event.source}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={() => onToggleWatch(event.region)}
              style={[styles.watchButton, { backgroundColor: theme.accentSoft }]}
            >
              <Text style={[styles.watchText, { color: theme.accent }]}>
                {watched ? 'Remove From Watchlist' : 'Add To Watchlist'}
              </Text>
            </Pressable>
            <Pressable onPress={() => onOpenRegion?.(event.region)} style={styles.regionButton}>
              <Text style={styles.regionButtonText}>Open Region</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailList}>
            {event.details.map((detail) => (
              <View key={detail} style={styles.detailCard}>
                <Text style={styles.detailText}>{detail}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppThemePalette) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.surfaceOverlay,
    },
    sheet: {
      flex: 1,
      marginTop: spacing.xl,
      backgroundColor: theme.background,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      padding: spacing.lg,
      gap: spacing.md,
      ...shadows.card,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 10,
    },
    region: {
      flex: 1,
      color: theme.subtleText,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    closeButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: theme.surfaceRaised,
    },
    closeText: {
      color: theme.text,
      fontWeight: '700',
      fontSize: 12,
    },
    title: {
      color: theme.text,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '800',
    },
    summary: {
      color: theme.subtleText,
      fontSize: 14,
      lineHeight: 21,
    },
    map: {
      height: 220,
      borderRadius: 24,
    },
    mapFallback: {
      height: 120,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface,
    },
    mapFallbackText: {
      color: theme.text,
      fontWeight: '700',
    },
    statRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 18,
      padding: spacing.md,
      gap: 6,
      borderWidth: 1,
      borderColor: theme.border,
    },
    statLabel: {
      color: theme.subtleText,
      fontSize: 11,
      textTransform: 'uppercase',
    },
    statValue: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '800',
    },
    watchButton: {
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 12,
      alignSelf: 'flex-start',
    },
    watchText: {
      fontSize: 12,
      fontWeight: '800',
    },
    actionRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    regionButton: {
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 12,
      alignSelf: 'flex-start',
      backgroundColor: theme.surfaceRaised,
    },
    regionButtonText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '700',
    },
    detailList: {
      gap: spacing.sm,
      paddingBottom: spacing.lg,
    },
    detailCard: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
    },
    detailText: {
      color: theme.text,
      fontSize: 14,
      lineHeight: 20,
    },
  });
