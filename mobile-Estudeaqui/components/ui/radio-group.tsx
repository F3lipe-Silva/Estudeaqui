import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface RadioGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  options: RadioGroupOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onValueChange,
  orientation = 'vertical',
  disabled = false
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    onValueChange?.(optionValue);
  };

  const radioStyle = {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.border,
    borderRadius: 10,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };

  const selectedRadioStyle = {
    ...radioStyle,
    borderColor: theme.primary,
  };

  const dotStyle = {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.primary,
  };

  const containerStyle = orientation === 'horizontal'
    ? {
        flexDirection: 'row' as const,
        flexWrap: 'wrap' as const,
        gap: 16,
      }
    : {
        gap: 12,
      };

  return (
    <View style={[styles.container, containerStyle]}>
      {options.map((option) => {
        const isSelected = value === option.value;
        const isDisabled = disabled || option.disabled;

        return (
          <TouchableOpacity
            key={option.value}
            style={styles.option}
            onPress={() => handleSelect(option.value)}
            disabled={isDisabled}
            activeOpacity={0.7}
          >
            <View
              style={[
                isSelected ? selectedRadioStyle : radioStyle,
                isDisabled && styles.disabledRadio,
              ]}
            >
              {isSelected && <View style={dotStyle} />}
            </View>
            <ThemedText
              style={[
                styles.label,
                isDisabled && styles.disabledLabel,
              ]}
            >
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Styles are applied dynamically based on orientation
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
  },
  disabledRadio: {
    opacity: 0.5,
  },
  disabledLabel: {
    opacity: 0.5,
  },
});