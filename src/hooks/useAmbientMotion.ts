import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export function useAmbientMotion(enabled = true) {
  const backgroundShift = useRef(new Animated.Value(0)).current;
  const radarShift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) {
      backgroundShift.setValue(0);
      radarShift.setValue(0);
      return;
    }

    const aurora = Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundShift, {
          toValue: 1,
          duration: 6400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(backgroundShift, {
          toValue: 0,
          duration: 6400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const radar = Animated.loop(
      Animated.timing(radarShift, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    aurora.start();
    radar.start();

    return () => {
      aurora.stop();
      radar.stop();
    };
  }, [backgroundShift, radarShift, enabled]);

  return {
    backgroundShift,
    radarShift,
  };
}
