import React from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { spacing, type AppAppearanceMode } from '../../theme';
import type { DataMode } from '../../data/liveEarth';
import type { DashboardSettings } from '../../hooks/useDashboardControls';
import { SingleSelectChips } from './FilterChips';
import { useAppTheme } from '../../themeContext';

type SettingsSheetProps = {
  visible: boolean;
  settings: DashboardSettings;
  onClose: () => void;
  onUpdate: (next: Partial<DashboardSettings>) => void;
};

export function SettingsSheet({ visible, settings, onClose, onUpdate }: SettingsSheetProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeAreaOverlay}>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Settings</Text>
              <Pressable onPress={onClose} style={styles.closeButton} hitSlop={10}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <View style={styles.section}>
                <Text style={styles.label}>Data Mode</Text>
                <SingleSelectChips<DataMode>
                  options={[
                    { label: 'Auto', value: 'auto' },
                    { label: 'Demo', value: 'demo' },
                    { label: 'Live', value: 'live' },
                  ]}
                  selected={settings.dataMode}
                  onSelect={(value) => onUpdate({ dataMode: value })}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Refresh</Text>
                <SingleSelectChips<'normal' | 'fast'>
                  options={[
                    { label: 'Normal', value: 'normal' },
                    { label: 'Fast', value: 'fast' },
                  ]}
                  selected={settings.refreshRate}
                  onSelect={(value) => onUpdate({ refreshRate: value })}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Appearance</Text>
                <Text style={styles.helperText}>
                  Follow the device theme or force a consistent light or dark UI. System is currently using{' '}
                  {theme.resolvedAppearance}.
                </Text>
                <SingleSelectChips<AppAppearanceMode>
                  options={[
                    {
                      label:
                        theme.resolvedAppearance === 'light' ? 'System (Light)' : 'System (Dark)',
                      value: 'system',
                    },
                    { label: 'Dark', value: 'dark' },
                    { label: 'Light', value: 'light' },
                  ]}
                  selected={settings.appearanceMode}
                  onSelect={(value) => onUpdate({ appearanceMode: value })}
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleText}>Reduced Motion</Text>
                <Pressable
                  onPress={() => onUpdate({ reducedMotion: !settings.reducedMotion })}
                  style={[styles.toggle, settings.reducedMotion && styles.toggleActive]}
                >
                  <Text style={[styles.toggleLabel, settings.reducedMotion && styles.toggleLabelActive]}>
                    {settings.reducedMotion ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleText}>Compare Mode</Text>
                <Pressable
                  onPress={() => onUpdate({ compareMode: !settings.compareMode })}
                  style={[styles.toggle, settings.compareMode && styles.toggleActive]}
                >
                  <Text style={[styles.toggleLabel, settings.compareMode && styles.toggleLabelActive]}>
                    {settings.compareMode ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleText}>Local Alerts</Text>
                <Pressable
                  onPress={() => onUpdate({ notificationsEnabled: !settings.notificationsEnabled })}
                  style={[styles.toggle, settings.notificationsEnabled && styles.toggleActive]}
                >
                  <Text
                    style={[
                      styles.toggleLabel,
                      settings.notificationsEnabled && styles.toggleLabelActive,
                    ]}
                  >
                    {settings.notificationsEnabled ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Alert Scope</Text>
                <SingleSelectChips<'all' | 'watched'>
                  options={[
                    { label: 'All Regions', value: 'all' },
                    { label: 'Watchlist Only', value: 'watched' },
                  ]}
                  selected={settings.notificationScope}
                  onSelect={(value) => onUpdate({ notificationScope: value })}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Alert Severity</Text>
                <SingleSelectChips<'critical' | 'elevated'>
                  options={[
                    { label: 'Critical', value: 'critical' },
                    { label: 'Elevated+', value: 'elevated' },
                  ]}
                  selected={settings.notificationSeverity}
                  onSelect={(value) => onUpdate({ notificationSeverity: value })}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Alert Sources</Text>
                <SingleSelectChips<'all' | 'live'>
                  options={[
                    { label: 'All Data', value: 'all' },
                    { label: 'Live Only', value: 'live' },
                  ]}
                  selected={settings.notificationSourceMode}
                  onSelect={(value) => onUpdate({ notificationSourceMode: value })}
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleCopyWrap}>
                  <Text style={styles.toggleText}>Quiet Hours</Text>
                  <Text style={styles.toggleHelper}>Suppress local alerts from 22:00 to 07:00.</Text>
                </View>
                <Pressable
                  onPress={() => onUpdate({ quietHoursEnabled: !settings.quietHoursEnabled })}
                  style={[styles.toggle, settings.quietHoursEnabled && styles.toggleActive]}
                >
                  <Text style={[styles.toggleLabel, settings.quietHoursEnabled && styles.toggleLabelActive]}>
                    {settings.quietHoursEnabled ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    safeAreaOverlay: {
      flex: 1,
      backgroundColor: theme.surfaceOverlay,
    },
    overlay: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.lg,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 28,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
      maxHeight: '92%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      color: theme.text,
      fontSize: 24,
      fontWeight: '800',
    },
    closeButton: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.surfaceRaised,
    },
    closeText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '700',
    },
    content: {
      gap: spacing.lg,
    },
    section: {
      gap: spacing.sm,
    },
    label: {
      color: theme.subtleText,
      fontSize: 12,
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    helperText: {
      color: theme.subtleText,
      fontSize: 13,
      lineHeight: 18,
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      gap: spacing.md,
    },
    toggleCopyWrap: {
      flex: 1,
      gap: 4,
    },
    toggleText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '700',
    },
    toggleHelper: {
      color: theme.subtleText,
      fontSize: 12,
      lineHeight: 17,
    },
    toggle: {
      borderRadius: 999,
      backgroundColor: theme.surfaceRaised,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    toggleActive: {
      backgroundColor: theme.accentSoft,
    },
    toggleLabel: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '700',
    },
    toggleLabelActive: {
      color: theme.accent,
    },
  });
