import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useStudy } from '../contexts/study-context';
import { ThemedText } from './themed-text';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';

export default function ClockWidget() {
  const { pomodoroState } = useStudy();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { width } = useWindowDimensions();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (pomodoroState.status) {
      case 'focus':
        return { text: '#16a34a', label: 'Foco' };
      case 'short_break':
        return { text: '#2563eb', label: 'Pausa Curta' };
      case 'long_break':
        return { text: '#9333ea', label: 'Pausa Longa' };
      case 'paused':
        return { text: '#ca8a04', label: 'Pausado' };
      default:
        return { text: theme.text, label: 'Pronto' };
    }
  };

  const statusInfo = getStatusColor();

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <ThemedText style={[styles.statusText, { color: statusInfo.text }]}>
          {statusInfo.label}
        </ThemedText>
      </View>

      <View style={styles.timerContainer}>
        <ThemedText 
          style={[styles.timerText, {
            fontSize: width < 360 ? 64 : 88,
            color: theme.text
          }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {formatTime(pomodoroState.timeRemaining)}
        </ThemedText>
      </View>

      {pomodoroState.currentCycle !== undefined && pomodoroState.status !== 'idle' && (
        <ThemedText style={styles.cycleText}>
          Ciclo {pomodoroState.currentCycle}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 24,
  },
  statusContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  timerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  timerText: {
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
    lineHeight: 100,
  },
  cycleText: {
    fontSize: 16,
    opacity: 0.5,
  },
});