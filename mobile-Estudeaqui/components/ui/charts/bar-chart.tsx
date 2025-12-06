import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BarChart as NativeBarChart } from 'react-native-chart-kit';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const { width: screenWidth } = Dimensions.get('window');

interface BarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      colors?: Array<(opacity: number) => string>;
    }>;
  };
  height?: number;
  width?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  unit?: string;
  title?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 220,
  width = screenWidth - 40,
  showLegend = true,
  showGrid = true,
  unit = '',
  title
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
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.primary,
    },
    propsForLabels: {
      fontSize: 10,
    },
  };

  return (
    <View style={[styles.container, { width }]}>
      {title && (
        <ThemedText style={styles.title}>{title}</ThemedText>
      )}
      <NativeBarChart
        data={data}
        width={width}
        height={height}
        chartConfig={chartConfig}
        showLegend={showLegend}
        showGrid={showGrid}
        style={styles.chart}
        withInnerLines={showGrid}
        withOuterLines={showGrid}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        fromZero={true}
        segments={4}
      />
      {unit && (
        <ThemedText style={styles.unit}>Unidade: {unit}</ThemedText>
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
  unit: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
});