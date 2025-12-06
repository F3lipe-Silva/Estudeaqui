import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ThemeToggleProps {
  variant?: 'default' | 'compact';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'default',
  showLabel = true
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const deviceTheme = useColorScheme();
  const colors = Colors[resolvedTheme];

  const themes = [
    { value: 'light' as const, label: 'Claro', icon: '☀️' },
    { value: 'dark' as const, label: 'Escuro', icon: '🌙' },
    { value: 'system' as const, label: 'Sistema', icon: '📱' }
  ];

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactButton, { backgroundColor: colors.card }]}
        onPress={() => {
          const currentIndex = themes.findIndex(t => t.value === theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          handleThemeChange(themes[nextIndex].value);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.compactIcon}>
          {themes.find(t => t.value === theme)?.icon}
        </Text>
        {showLabel && (
          <ThemedText style={styles.compactLabel}>
            {themes.find(t => t.value === theme)?.label}
          </ThemedText>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {showLabel && (
        <ThemedText style={styles.label}>Tema</ThemedText>
      )}
      
      <View style={styles.optionsContainer}>
        {themes.map((themeOption) => {
          const isSelected = theme === themeOption.value;
          const isSystemSelected = theme === 'system';
          const systemResolvedTheme = isSystemSelected ? (deviceTheme || 'light') : themeOption.value;
          const isCurrentlyActive = resolvedTheme === systemResolvedTheme;

          return (
            <TouchableOpacity
              key={themeOption.value}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                  borderColor: colors.border,
                  borderWidth: 1,
                }
              ]}
              onPress={() => handleThemeChange(themeOption.value)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.icon,
                { color: isSelected ? colors.primaryForeground : colors.text }
              ]}>
                {themeOption.icon}
              </Text>
              <ThemedText
                style={[
                  styles.optionText,
                  { color: isSelected ? colors.primaryForeground : colors.text }
                ]}
              >
                {themeOption.label}
              </ThemedText>
              {isSelected && (
                <Text style={[styles.check, { color: colors.primaryForeground }]}>
                  ✓
                </Text>
              )}
              {isSystemSelected && (
                <ThemedText style={styles.systemNote}>
                  (Atualmente {deviceTheme === 'dark' ? 'escuro' : 'claro'})
                </ThemedText>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    margin: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  check: {
    fontSize: 16,
    fontWeight: '600',
  },
  systemNote: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 8,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  compactIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  compactLabel: {
    fontSize: 14,
  },
});