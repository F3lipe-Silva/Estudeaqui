import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  tabs: TabItem[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  tabs,
  orientation = 'horizontal',
  className
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const listStyle = orientation === 'horizontal'
    ? {
        flexDirection: 'row' as const,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }
    : {
        borderRightWidth: 1,
        borderRightColor: theme.border,
        marginRight: 16,
      };

  return (
    <View style={[styles.container, className]}>
      <View style={[styles.tabsList, listStyle]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={[
              styles.tabTrigger,
              {
                borderBottomWidth: orientation === 'horizontal' ? 2 : 0,
                borderBottomColor: value === tab.value ? theme.primary : 'transparent',
                borderLeftWidth: orientation === 'vertical' ? 2 : 0,
                borderLeftColor: value === tab.value ? theme.primary : 'transparent',
                opacity: tab.disabled ? 0.5 : 1,
              }
            ]}
            onPress={() => !tab.disabled && onValueChange(tab.value)}
            disabled={tab.disabled}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.tabText,
                {
                  color: value === tab.value ? theme.primary : theme.text,
                  fontWeight: value === tab.value ? '600' : '400',
                }
              ]}
            >
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const TabsList: React.FC<TabsListProps> = ({
  children,
  orientation = 'horizontal',
  className
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const listStyle = orientation === 'horizontal'
    ? {
        flexDirection: 'row' as const,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }
    : {
        borderRightWidth: 1,
        borderRightColor: theme.border,
        marginRight: 16,
      };

  return (
    <View style={[styles.tabsList, listStyle, className]}>
      {children}
    </View>
  );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  disabled = false,
  className
}) => {
  // This would need to be used within a Tabs context for full functionality
  return (
    <TouchableOpacity
      style={[styles.tabTrigger, disabled && styles.disabledTrigger, className]}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <ThemedText style={styles.tabText}>
        {children}
      </ThemedText>
    </TouchableOpacity>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className
}) => {
  // This would need to be used within a Tabs context for full functionality
  return (
    <View style={[styles.tabContent, className]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsList: {
    // Styles applied dynamically
  },
  tabTrigger: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledTrigger: {
    opacity: 0.5,
  },
  tabText: {
    fontSize: 16,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
});