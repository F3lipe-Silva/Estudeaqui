import React from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';
import { FormField, FormError } from '@/hooks/use-form';

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  required?: boolean;
  description?: string;
  disabled?: boolean;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  multiline = false,
  numberOfLines = 1,
  required = false,
  description,
  disabled = false,
}: FormInputProps<T>) {
  const { resolvedTheme } = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <FormField
          label={label}
          error={error?.message}
          required={required}
          description={description}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: resolvedTheme === 'dark' ? '#1f262e' : '#ffffff',
                borderColor: error ? '#ef4444' : resolvedTheme === 'dark' ? '#252d36' : '#dae6e7',
                color: resolvedTheme === 'dark' ? '#eafafb' : '#29333d',
                opacity: disabled ? 0.5 : 1,
              },
              multiline && styles.multilineInput,
            ]}
            placeholder={placeholder}
            placeholderTextColor={resolvedTheme === 'dark' ? '#64748b' : '#94a3b8'}
            value={value || ''}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            multiline={multiline}
            numberOfLines={numberOfLines}
            editable={!disabled}
          />
        </FormField>
      )}
    />
  );
}

interface FormSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  description?: string;
  disabled?: boolean;
}

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  required = false,
  description,
  disabled = false,
}: FormSelectProps<T>) {
  const { resolvedTheme } = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormField
          label={label}
          error={error?.message}
          required={required}
          description={description}
        >
          <View
            style={[
              styles.select,
              {
                backgroundColor: resolvedTheme === 'dark' ? '#1f262e' : '#ffffff',
                borderColor: error ? '#ef4444' : resolvedTheme === 'dark' ? '#252d36' : '#dae6e7',
                opacity: disabled ? 0.5 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.selectText,
                {
                  color: value
                    ? resolvedTheme === 'dark' ? '#eafafb' : '#29333d'
                    : resolvedTheme === 'dark' ? '#64748b' : '#94a3b8',
                },
              ]}
            >
              {value ? options.find(opt => opt.value === value)?.label : placeholder}
            </Text>
            <Text style={[styles.chevron, { color: resolvedTheme === 'dark' ? '#eafafb' : '#29333d' }]}>
              ▼
            </Text>
          </View>
          {/* In a real implementation, you would add a modal or picker here */}
        </FormField>
      )}
    />
  );
}

interface FormCheckboxProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function FormCheckbox<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled = false,
}: FormCheckboxProps<T>) {
  const { resolvedTheme } = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View style={[styles.checkboxContainer, { opacity: disabled ? 0.5 : 1 }]}>
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: value ? '#4db8a5' : 'transparent',
                borderColor: resolvedTheme === 'dark' ? '#252d36' : '#dae6e7',
              },
            ]}
          >
            {value && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.checkboxContent}>
            {label && (
              <ThemedText style={styles.checkboxLabel}>{label}</ThemedText>
            )}
            {description && (
              <ThemedText style={styles.checkboxDescription}>
                {description}
              </ThemedText>
            )}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  select: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
    flex: 1,
  },
  chevron: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  checkboxContent: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 16,
    marginBottom: 2,
  },
  checkboxDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
});