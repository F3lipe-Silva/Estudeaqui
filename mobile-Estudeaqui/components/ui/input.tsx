import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Text } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          { 
            color: theme.text, 
            borderColor: error ? theme.destructive : theme.border,
            backgroundColor: theme.background === '#0f131a' ? theme.muted : '#ffffff', // Slight contrast for input bg
          },
          style
        ]}
        placeholderTextColor={theme.mutedForeground}
        {...props}
      />
      {error && (
        <Text style={[styles.error, { color: theme.destructive }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
