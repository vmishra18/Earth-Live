import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

function canUseHaptics() {
  return Platform.OS !== 'web';
}

export function selectionHaptic() {
  if (!canUseHaptics()) {
    return;
  }

  Haptics.selectionAsync().catch(() => {
    // Ignore device support issues.
  });
}

export function impactHaptic() {
  if (!canUseHaptics()) {
    return;
  }

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
    // Ignore device support issues.
  });
}

export function successHaptic() {
  if (!canUseHaptics()) {
    return;
  }

  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {
    // Ignore device support issues.
  });
}
