import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  // Ensure style is properly handled for both objects and arrays
  const finalStyle = Array.isArray(style)
    ? [{ backgroundColor }, ...style]
    : [{ backgroundColor }, style];

  return <View style={finalStyle} {...otherProps} />;
}
