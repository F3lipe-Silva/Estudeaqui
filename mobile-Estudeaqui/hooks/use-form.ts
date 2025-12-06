import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';

interface UseFormProps<T extends z.ZodSchema> {
  schema: T;
  defaultValues?: Partial<z.infer<T>>;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
}

export function useZodForm<T extends z.ZodSchema>({
  schema,
  defaultValues,
  mode = 'onBlur'
}: UseFormProps<T>) {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode,
  });
}

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, required, description, children }: FormFieldProps) {
  const { resolvedTheme } = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </ThemedText>
      )}
      {description && (
        <ThemedText style={styles.description}>{description}</ThemedText>
      )}
      {children}
      {error && (
        <ThemedText style={[styles.error, { color: '#ef4444' }]}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

interface FormMessageProps {
  type?: 'error' | 'success' | 'info';
  message?: string;
}

export function FormMessage({ type = 'error', message }: FormMessageProps) {
  if (!message) return null;

  const { resolvedTheme } = useTheme();
  
  const messageStyle = {
    error: { color: '#ef4444' },
    success: { color: '#22c55e' },
    info: { color: '#3b82f6' },
  };

  return (
    <ThemedText style={[styles.message, messageStyle[type]]}>
      {message}
    </ThemedText>
  );
}

interface FormErrorProps {
  errors: any;
  name: string;
}

export function FormError({ errors, name }: FormErrorProps) {
  const error = errors?.[name];
  
  if (!error?.message) return null;

  return (
    <FormMessage type="error" message={error.message as string} />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  required: {
    color: '#ef4444',
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  error: {
    fontSize: 14,
    marginTop: 4,
  },
  message: {
    fontSize: 14,
    marginTop: 8,
  },
});