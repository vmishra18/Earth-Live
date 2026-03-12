import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { radii, spacing, typeScale } from '../../theme';
import { useAppTheme } from '../../themeContext';

export type ChipOption<T extends string> = {
  label: string;
  value: T;
};

type FilterChipsProps<T extends string> = {
  options: ChipOption<T>[];
  selected: T[];
  onToggle: (value: T) => void;
};

export function FilterChips<T extends string>({ options, selected, onToggle }: FilterChipsProps<T>) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <Pressable
            key={option.value}
            onPress={() => onToggle(option.value)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

type SingleSelectChipsProps<T extends string> = {
  options: ChipOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
};

export function SingleSelectChips<T extends string>({
  options,
  selected,
  onSelect,
}: SingleSelectChipsProps<T>) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((option) => {
        const active = selected === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    row: {
      gap: spacing.sm,
      paddingRight: spacing.md,
    },
    chip: {
      borderRadius: radii.pill,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 12,
      paddingVertical: 9,
      backgroundColor: theme.surfaceSoft,
    },
    chipActive: {
      borderColor: theme.accent,
      backgroundColor: theme.accentSoft,
    },
    chipText: {
      color: theme.subtleText,
      fontSize: typeScale.meta,
      fontWeight: '700',
    },
    chipTextActive: {
      color: theme.accent,
    },
  });
