import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onCheckedChange,
  disabled = false,
  id,
  label
}) => {
  const [isChecked, setIsChecked] = useState(checked);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const handlePress = () => {
    if (disabled) return;
    
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onCheckedChange?.(newChecked);
  };

  const checkboxStyle = {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: disabled ? theme.border : theme.primary,
    borderRadius: 4,
    backgroundColor: isChecked ? theme.primary : 'transparent',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    opacity: disabled ? 0.5 : 1,
  };

  const checkmarkStyle = {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600' as const,
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={checkboxStyle}>
        {isChecked && <Text style={checkmarkStyle}>✓</Text>}
      </View>
      {label && (
        <ThemedText style={[styles.label, disabled && styles.disabledLabel]}>
          {label}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
  disabledLabel: {
    opacity: 0.5,
  },
});