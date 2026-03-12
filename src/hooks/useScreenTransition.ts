import { useRef, useState } from 'react';
import { Animated } from 'react-native';
import type { ScreenKey } from '../constants/navigation';

export function useScreenTransition(initialScreen: ScreenKey, animated = true) {
  const [screen, setScreen] = useState<ScreenKey>(initialScreen);
  const screenOpacity = useRef(new Animated.Value(1)).current;

  const changeScreen = (nextScreen: ScreenKey) => {
    if (nextScreen === screen) {
      return;
    }

    if (!animated) {
      setScreen(nextScreen);
      screenOpacity.setValue(1);
      return;
    }
    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      setScreen(nextScreen);
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  };

  return {
    screen,
    screenOpacity,
    changeScreen,
  };
}
