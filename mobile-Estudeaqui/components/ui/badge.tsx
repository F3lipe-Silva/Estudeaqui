import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'default',
  className
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const getBadgeStyle = () => {
    const baseStyle = {
      paddingHorizontal: size === 'sm' ? 8 : size === 'lg' ? 16 : 12,
      paddingVertical: size === 'sm' ? 2 : size === 'lg' ? 8 : 4,
      borderRadius: 9999,
      alignSelf: 'flex-start',
    };

    const variantStyles = {
      default: {
        backgroundColor: theme.primary,
      },
      secondary: {
        backgroundColor: theme.secondary,
      },
      destructive: {
        backgroundColor: theme.error,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.border,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontSize: size === 'sm' ? 10 : size === 'lg' ? 16 : 12,
      fontWeight: '600' as const,
    };

    const colorStyles = {
      default: { color: '#ffffff' },
      secondary: { color: theme.text },
      destructive: { color: '#ffffff' },
      outline: { color: theme.text },
    };

    return {
      ...baseTextStyle,
      ...colorStyles[variant],
    };
  };

  return (
    <View style={[styles.badge, getBadgeStyle(), className]}>
      <ThemedText style={[styles.text, getTextStyle()]}>
        {children}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});