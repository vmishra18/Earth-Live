import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { screenOptions, type ScreenKey } from '../../constants/navigation';
import { radii, spacing, typeScale } from '../../theme';
import { useAppTheme } from '../../themeContext';

type BottomNavProps = {
  activeScreen: ScreenKey;
  onChange: (screen: ScreenKey) => void;
};

export function BottomNav({ activeScreen, onChange }: BottomNavProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.bottomNav}>
      {screenOptions.map((option) => {
        const active = option.key === activeScreen;

        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[styles.navItem, active && styles.navItemActive]}
          >
            <Text style={[styles.navShort, active && styles.navShortActive]}>{option.short}</Text>
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    bottomNav: {
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
      bottom: spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.xs,
      backgroundColor: theme.navBackground,
      borderRadius: radii.xl,
      padding: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    navItem: {
      flex: 1,
      alignItems: 'center',
      borderRadius: radii.md,
      paddingVertical: 10,
      gap: 1,
    },
    navItemActive: {
      backgroundColor: theme.navActiveBackground,
    },
    navShort: {
      color: theme.subtleText,
      fontSize: typeScale.micro,
      fontWeight: '800',
      letterSpacing: 0.8,
    },
    navShortActive: {
      color: theme.text,
    },
    navLabel: {
      color: theme.subtleText,
      fontSize: typeScale.meta,
      fontWeight: '700',
    },
    navLabelActive: {
      color: theme.text,
    },
  });
