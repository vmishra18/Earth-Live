import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, type StyleProp, type TextStyle } from 'react-native';

type AnimatedNumberProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  reducedMotion?: boolean;
  style?: StyleProp<TextStyle>;
};

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  reducedMotion = false,
  style,
}: AnimatedNumberProps) {
  const animatedValue = useRef(new Animated.Value(value)).current;
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (reducedMotion) {
      animatedValue.setValue(value);
      setDisplayValue(value);
      return;
    }

    const listener = animatedValue.addListener(({ value: next }) => {
      setDisplayValue(next);
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration: 500,
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [animatedValue, reducedMotion, value]);

  return <Text style={style}>{`${prefix}${displayValue.toFixed(decimals)}${suffix}`}</Text>;
}
