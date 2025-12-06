import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({
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

  const trackStyle = {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: isChecked ? theme.primary : theme.border,
    justifyContent: 'center' as const,
    paddingHorizontal: 2,
    opacity: disabled ? 0.5 : 1,
  };

  const thumbStyle = {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    transform: [{ translateX: isChecked ? 20 : 0 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={trackStyle}>
        <View style={thumbStyle} />
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
    gap: 12,
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
  disabledLabel: {
    opacity: 0.5,
  },
});