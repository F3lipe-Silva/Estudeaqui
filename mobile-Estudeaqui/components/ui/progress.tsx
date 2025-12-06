import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProgressProps {
  value: number;
  max?: number;
  style?: ViewStyle;
  indicatorStyle?: ViewStyle;
}

export function Progress({ value, max = 100, style, indicatorStyle }: ProgressProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const percentage = Math.min(Math.max(value / max, 0), 1) * 100;

  // Ensure styles are properly handled for both objects and arrays
  const containerFinalStyle = Array.isArray(style)
    ? [styles.container, { backgroundColor: theme.muted }, ...style]
    : [styles.container, { backgroundColor: theme.muted }, style];

  const indicatorFinalStyle = Array.isArray(indicatorStyle)
    ? [styles.indicator, { width: `${percentage}%`, backgroundColor: theme.primary }, ...indicatorStyle]
    : [styles.indicator, { width: `${percentage}%`, backgroundColor: theme.primary }, indicatorStyle];

  return (
    <View style={containerFinalStyle}>
      <View style={indicatorFinalStyle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  indicator: {
    height: '100%',
    borderRadius: 4,
  },
});
