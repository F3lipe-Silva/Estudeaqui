import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PieChart as NativePieChart } from 'react-native-chart-kit';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const { width: screenWidth } = Dimensions.get('window');

interface PieChartProps {
  data: Array<{
    name: string;
    population: number;
    color: string;
    legendFontColor?: string;
    legendFontSize?: number;
  }>;
  height?: number;
  width?: number;
  showLegend?: boolean;
  title?: string;
  accessor?: string;
  backgroundColor?: string;
  paddingLeft?: string;
  center?: Array<number>;
  absolute?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 220,
  width = screenWidth - 40,
  showLegend = true,
  title,
  accessor = 'population',
  backgroundColor = 'transparent',
  paddingLeft = '15',
  center = [10, 10],
  absolute = false
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const chartConfig = {
    backgroundColor: theme.background,
    backgroundGradientFrom: theme.background,
    backgroundGradientTo: theme.background,
    color: (opacity = 1) => theme.primary,
    labelColor: (opacity = 1) => theme.text,
    style: {
      borderRadius: 16,
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
      <NativePieChart
        data={data}
        width={width}
        height={height}
        chartConfig={chartConfig}
        accessor={accessor}
        backgroundColor={backgroundColor}
        paddingLeft={paddingLeft}
        center={center}
        absolute={absolute}
        style={styles.chart}
      />
      {showLegend && (
        <View style={styles.legendContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendColor, 
                  { backgroundColor: item.color }
                ]} 
              />
              <ThemedText style={styles.legendText}>
                {item.name}: {item.population}
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
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
});