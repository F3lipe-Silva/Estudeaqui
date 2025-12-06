import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = 'Selecione uma opção',
  disabled = false
}) => {
  const [visible, setVisible] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption?.label || placeholder;

  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.select,
          {
            backgroundColor: theme.background,
            borderColor: theme.border,
            opacity: disabled ? 0.5 : 1,
          }
        ]}
        onPress={() => !disabled && setVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <ThemedText style={[
          styles.selectText,
          { color: value ? theme.text : theme.placeholder }
        ]}>
          {displayValue}
        </ThemedText>
        <Text style={[styles.chevron, { color: theme.text }]}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <ThemedView style={styles.modal}>
            <View style={styles.header}>
              <ThemedText style={styles.title}>Selecione uma opção</ThemedText>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <ThemedText style={styles.closeButton}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  {
                    backgroundColor: option.value === value ? `${theme.primary}20` : 'transparent',
                    borderColor: theme.border,
                  }
                ]}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.optionText}>
                  {option.label}
                </ThemedText>
                {option.value === value && (
                  <Text style={[styles.check, { color: theme.primary }]}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  selectText: {
    fontSize: 16,
    flex: 1,
  },
  chevron: {
    fontSize: 12,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '600',
    opacity: 0.6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  check: {
    fontSize: 16,
    fontWeight: '600',
  },
});