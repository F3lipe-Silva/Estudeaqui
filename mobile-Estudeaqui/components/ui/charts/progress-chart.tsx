import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ProgressChart as NativeProgressChart } from 'react-native-chart-kit';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const { width: screenWidth } = Dimensions.get('window');

interface ProgressChartProps {
  data: {
    labels: string[];
    data: number[];
  };
  height?: number;
  width?: number;
  showLegend?: boolean;
  title?: string;
  strokeWidth?: number;
  radius?: number;
  chartConfig?: any;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  height = 220,
  width = screenWidth - 40,
  showLegend = true,
  title,
  strokeWidth = 16,
  radius = 32
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const chartConfig = {
    backgroundColor: theme.background,
    backgroundGradientFrom: theme.background,
    backgroundGradientTo: theme.background,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.primary,
    labelColor: (opacity = 1) => theme.text,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 10,
    },
    strokeWidth,
    radius,
  };

  return (
    <View style={[styles.container, { width }]}>
      {title && (
        <ThemedText style={styles.title}>{title}</ThemedText>
      )}
      <NativeProgressChart
        data={data}
        width={width}
        height={height}
        strokeWidth={strokeWidth}
        radius={radius}
        chartConfig={chartConfig}
        hideLegend={!showLegend}
        style={styles.chart}
      />
      {showLegend && (
        <View style={styles.legendContainer}>
          {data.labels.map((label, index) => (
            <View key={index} style={styles.legendItem}>
              <ThemedText style={styles.legendText}>
                {label}: {Math.round(data.data[index] * 100)}%
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendText: {
    fontSize: 12,
  },
});