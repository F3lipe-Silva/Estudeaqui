import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'default',
  size = 'default',
  isLoading = false,
  children,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const getBackgroundColor = () => {
    if (disabled) return theme.muted;
    switch (variant) {
      case 'default': return theme.primary;
      case 'secondary': return theme.secondary;
      case 'destructive': return theme.destructive;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return theme.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.mutedForeground;
    switch (variant) {
      case 'default': return theme.primaryForeground;
      case 'secondary': return theme.secondaryForeground;
      case 'destructive': return theme.destructiveForeground;
      case 'outline': return theme.primary; // Using primary color for outline text
      case 'ghost': return theme.text;
      default: return theme.primaryForeground;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return theme.border; // Or theme.input
    return 'transparent';
  };

  // Ensure style is properly handled for both objects and arrays
  const finalStyle = Array.isArray(style)
    ? [styles.base,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          borderRadius: 8,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: disabled ? 0.7 : 1,
          ...getSizeStyles(size),
        },
        ...style]
    : [
        styles.base,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          borderRadius: 8,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: disabled ? 0.7 : 1,
          ...getSizeStyles(size),
        },
        style as ViewStyle
      ];

  const textStyle: TextStyle = {
    color: getTextColor(),
    fontWeight: '600',
    fontSize: size === 'lg' ? 18 : 16,
  };

  return (
    <TouchableOpacity
      style={finalStyle}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        typeof children === 'string' ? (
          <Text style={textStyle}>{children}</Text>
        ) : Array.isArray(children) ? (
          children.map((child, index) =>
            typeof child === 'string' ? (
              <Text key={index} style={textStyle}>
                {child}
              </Text>
            ) : (
              child
            )
          )
        ) : (
          children
        )
      )}
    </TouchableOpacity>
  );
}

function getSizeStyles(size: 'default' | 'sm' | 'lg'): ViewStyle {
  switch (size) {
    case 'sm': return { paddingVertical: 8, paddingHorizontal: 12 };
    case 'lg': return { paddingVertical: 16, paddingHorizontal: 32 };
    default: return { paddingVertical: 12, paddingHorizontal: 20 };
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
