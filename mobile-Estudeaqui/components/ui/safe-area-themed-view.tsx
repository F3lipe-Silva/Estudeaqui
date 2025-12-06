import { View, type ViewProps, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export type SafeAreaThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function SafeAreaThemedView({ style, lightColor, darkColor, ...otherProps }: SafeAreaThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const insets = useSafeAreaInsets();

  const finalStyle = Array.isArray(style)
    ? [{ backgroundColor, paddingTop: insets.top }, ...style]
    : [{ backgroundColor, paddingTop: insets.top }, style];

  return <View style={finalStyle} {...otherProps} />;
}
