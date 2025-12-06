import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BarChart as NativeBarChart } from 'react-native-chart-kit';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const { width: screenWidth } = Dimensions.get('window');

interface AccuracyData {
  subject: string;
  accuracy: number;
  totalQuestions: number;
  correctQuestions: number;
}

interface AccuracyChartProps {
  data: AccuracyData[];
  height?: number;
  width?: number;
  title?: string;
  showDetails?: boolean;
}

export const AccuracyChart: React.FC<AccuracyChartProps> = ({
  data,
  height = 220,
  width = screenWidth - 40,
  title = 'Precisão por Matéria',
  showDetails = true
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // Transform data for chart
  const chartData = {
    labels: data.map(item => item.subject.substring(0, 10)),
    datasets: [{
      data: data.map(item => item.accuracy),
      colors: data.map(item => (opacity: number) => {
        if (item.accuracy >= 80) return `rgba(34, 197, 94, ${opacity})`; // green
        if (item.accuracy >= 60) return `rgba(251, 191, 36, ${opacity})`; // yellow
        return `rgba(239, 68, 68, ${opacity})`; // red
      })
    }]
  };

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
    },
    propsForLabels: {
      fontSize: 10,
    },
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) theme.success;
    if (accuracy >= 60) theme.warning;
    return theme.error;
  };

  return (
    <View style={[styles.container, { width }]}>
      {title && (
        <ThemedText style={styles.title}>{title}</ThemedText>
      )}
      <NativeBarChart
        data={chartData}
        width={width}
        height={height}
        chartConfig={chartConfig}
        showLegend={false}
        showGrid={true}
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        fromZero={true}
        segments={4}
      />
      
      {showDetails && (
        <View style={styles.detailsContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.detailItem}>
              <ThemedText style={styles.subjectName}>{item.subject}</ThemedText>
              <View style={styles.accuracyRow}>
                <ThemedText 
                  style={[
                    styles.accuracyText, 
                    { color: getAccuracyColor(item.accuracy) }
                  ]}
                >
                  {item.accuracy}%
                </ThemedText>
                <ThemedText style={styles.questionsText}>
                  ({item.correctQuestions}/{item.totalQuestions})
                </ThemedText>
              </View>
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
  detailsContainer: {
    marginTop: 16,
    width: '100%',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accuracyText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  questionsText: {
    fontSize: 12,
    opacity: 0.7,
  },
});