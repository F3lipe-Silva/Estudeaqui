import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
  className?: string;
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  decorative = true,
  className
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const separatorStyle = orientation === 'horizontal' 
    ? {
        width: '100%',
        height: 1,
        backgroundColor: theme.border,
        marginVertical: 8,
      }
    : {
        width: 1,
        height: '100%',
        backgroundColor: theme.border,
        marginHorizontal: 8,
      };

  return (
    <View style={[styles.separator, separatorStyle, className]} />
  );
};

const styles = StyleSheet.create({
  separator: {
    alignSelf: 'center',
  },
});