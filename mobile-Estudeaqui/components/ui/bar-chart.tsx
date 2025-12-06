import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const BarChart = ({ data, height, unit }: any) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={{ height, justifyContent: 'flex-end', gap: 8 }}>
      {data.map((item: any, index: number) => (
        <View key={index} style={styles.barItem}>
          <ThemedText style={styles.barItemName} numberOfLines={1}>{item.name}</ThemedText>
          <View style={styles.barBackground}>
            <View style={{ 
              width: `${Math.min(item.value || item.accuracy, 100)}%`, 
              height: '100%', 
              backgroundColor: item.color || theme.primary, 
              borderRadius: 4 
            }} />
          </View>
          <ThemedText style={styles.barItemValue}>
            {item.value || item.accuracy}{unit}
          </ThemedText>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  barItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  barItemName: { 
    width: 100, 
    fontSize: 12 
  },
  barBackground: { 
    flex: 1, 
    height: 20, 
    backgroundColor: 'rgba(0,0,0,0.05)', 
    borderRadius: 4 
  },
  barItemValue: { 
    width: 40, 
    fontSize: 12, 
    textAlign: 'right' 
  },
});