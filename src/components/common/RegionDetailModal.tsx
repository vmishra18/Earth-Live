import React from 'react';
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import type { DashboardSnapshot, EventItem } from '../../data/liveEarth';
import { shadows, spacing, type AppThemePalette } from '../../theme';
import { deriveRegionDetail } from '../../utils/regions';
import { deriveEventSourceMeta } from '../../utils/sourceStatus';
import { SourceBadge } from './SourceBadge';

type RegionDetailModalProps = {
  region: string | null;
  snapshot: DashboardSnapshot;
  visible: boolean;
  theme: AppThemePalette;
  onClose: () => void;
  onOpenEvent: (event: EventItem) => void;
};

export function RegionDetailModal({
  region,
  snapshot,
  visible,
  theme,
  onClose,
  onOpenEvent,
}: RegionDetailModalProps) {
  if (!region) {
    return null;
  }

  const detail = deriveRegionDetail(snapshot, region);
  const styles = createStyles(theme);
  const handleShare = () => {
    void Share.share({
      message: `${detail.region}\nEvents: ${detail.relatedEvents.length}\nTimeline: ${detail.relatedTimeline.length}\nNodes: ${detail.relatedHotspots.length}`,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Region Focus</Text>
              <Text style={styles.title}>{detail.region}</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable onPress={handleShare} style={styles.closeButton}>
                <Text style={styles.closeText}>Share</Text>
              </Pressable>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>Back</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Events</Text>
              <Text style={styles.statValue}>{detail.relatedEvents.length}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Timeline</Text>
              <Text style={styles.statValue}>{detail.relatedTimeline.length}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Nodes</Text>
              <Text style={styles.statValue}>{detail.relatedHotspots.length}</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Linked Events</Text>
              {detail.relatedEvents.length ? (
                detail.relatedEvents.map((event) => (
                  <Pressable key={event.id} onPress={() => onOpenEvent(event)} style={styles.eventCard}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventSummary}>{event.summary}</Text>
                    <SourceBadge meta={deriveEventSourceMeta(snapshot, event)} compact />
                    <Text style={styles.eventStat}>{event.stat}</Text>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.emptyText}>No linked events are available for this region yet.</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Timeline</Text>
              {detail.relatedTimeline.length ? (
                detail.relatedTimeline.map((entry) => (
                  <View key={entry.id} style={styles.timelineRow}>
                    <Text style={styles.timelineTime}>{entry.time}</Text>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>{entry.title}</Text>
                      <Text style={styles.timelineBody}>{entry.body}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Replay history for this region is not populated yet.</Text>
              )}
            </View>
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    headerActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    eyebrow: {
      color: theme.accent,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    title: {
      color: theme.text,
      fontSize: 28,
      fontWeight: '800',
      marginTop: 6,
    },
    closeButton: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.surfaceRaised,
    },
    closeText: {
      color: theme.text,
      fontWeight: '700',
      fontSize: 12,
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
      borderWidth: 1,
      borderColor: theme.border,
    },
    statLabel: {
      color: theme.subtleText,
      fontSize: 11,
      textTransform: 'uppercase',
      marginBottom: 6,
    },
    statValue: {
      color: theme.text,
      fontSize: 20,
      fontWeight: '800',
    },
    content: {
      gap: spacing.lg,
      paddingBottom: spacing.xl,
    },
    section: {
      gap: spacing.sm,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 17,
      fontWeight: '800',
    },
    eventCard: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 6,
    },
    eventTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '800',
    },
    eventSummary: {
      color: theme.subtleText,
      fontSize: 13,
      lineHeight: 19,
    },
    eventStat: {
      color: theme.accent,
      fontSize: 12,
      fontWeight: '700',
    },
    timelineRow: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'flex-start',
      backgroundColor: theme.surface,
      borderRadius: 18,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
    },
    timelineTime: {
      color: theme.accent,
      fontSize: 12,
      fontWeight: '800',
      width: 54,
    },
    timelineContent: {
      flex: 1,
      gap: 4,
    },
    timelineTitle: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '800',
    },
    timelineBody: {
      color: theme.subtleText,
      fontSize: 13,
      lineHeight: 19,
    },
    emptyText: {
      color: theme.subtleText,
      fontSize: 13,
      lineHeight: 19,
    },
  });
