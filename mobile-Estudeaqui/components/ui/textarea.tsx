import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface TextareaProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  label?: string;
  error?: string;
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  value,
  onChangeText,
  placeholder,
  disabled = false,
  numberOfLines = 4,
  maxLength,
  label,
  error,
  className
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const inputStyle = {
    borderWidth: 1,
    borderColor: error ? theme.error : theme.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.background,
    minHeight: numberOfLines * 24,
    textAlignVertical: 'top' as const,
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText style={styles.label}>{label}</ThemedText>
      )}
      <TextInput
        style={[styles.textarea, inputStyle, className]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        editable={!disabled}
        multiline
        numberOfLines={numberOfLines}
        maxLength={maxLength}
      />
      {error && (
        <ThemedText style={[styles.errorText, { color: theme.error }]}>
          {error}
        </ThemedText>
      )}
      {maxLength && (
        <ThemedText style={styles.charCount}>
          {value?.length || 0}/{maxLength}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textarea: {
    // Styles are applied dynamically
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
    textAlign: 'right',
  },
});