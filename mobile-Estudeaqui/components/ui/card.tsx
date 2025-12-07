import React from 'react';
import { View, Text, ViewStyle, StyleSheet, TextStyle } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // Ensure style is properly handled for both objects and arrays
  const finalStyle = Array.isArray(style)
    ? [
      styles.card,
      {
        backgroundColor: theme.card,
        borderColor: theme.border,
        shadowColor: theme.text, // Subtle shadow based on text color (black/white)
      },
      ...style
    ]
    : [
      styles.card,
      {
        backgroundColor: theme.card,
        borderColor: theme.border,
        shadowColor: theme.text, // Subtle shadow based on text color (black/white)
      },
      style
    ];

  return (
    <View style={finalStyle}>
      {children}
    </View>
  );
}

export function CardHeader({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  // Ensure style is properly handled for both objects and arrays
  const finalStyle = Array.isArray(style)
    ? [styles.header, ...style]
    : [styles.header, style];

  return <View style={finalStyle}>{children}</View>;
}

export function CardTitle({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // Ensure style is properly handled for both objects and arrays
  const finalStyle = Array.isArray(style)
    ? [styles.title, { color: theme.cardForeground }, ...style]
    : [styles.title, { color: theme.cardForeground }, style];

  return (
    <Text style={finalStyle}>
      {children}
    </Text>
  );
}

export function CardDescription({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // Ensure style is properly handled for both objects and arrays
  const finalStyle = Array.isArray(style)
    ? [styles.description, { color: theme.mutedForeground }, ...style]
    : [styles.description, { color: theme.mutedForeground }, style];

  return (
    <Text style={finalStyle}>
      {children}
    </Text>
  );
}

export function CardContent({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  // Ensure style is properly handled for both objects and arrays
  const finalStyle = Array.isArray(style)
    ? [styles.content, ...style]
    : [styles.content, style];

  return <View style={finalStyle}>{children}</View>;
}

export function CardFooter({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  // Ensure style is properly handled for both objects and arrays
  const finalStyle = Array.isArray(style)
    ? [styles.footer, ...style]
    : [styles.footer, style];

  return <View style={finalStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  footer: {
    padding: 16,
    paddingTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
