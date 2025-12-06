import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({
  children,
  htmlFor,
  className
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <ThemedText style={[styles.label, { color: theme.text }, className]}>
      {children}
    </ThemedText>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
});