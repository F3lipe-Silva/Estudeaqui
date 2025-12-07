import React from 'react';
import { StyleSheet, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Pause, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useStudy } from '../contexts/study-context';
import { ThemedText } from './themed-text';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Card, CardContent } from './ui/card';

export default function ClockWidget() {
  const { pomodoroState, pausePomodoroTimer, setPomodoroState } = useStudy();
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
        return { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', progress: '#22c55e' }; // green
      case 'short_break':
        return { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', progress: '#3b82f6' }; // blue
      case 'long_break':
        return { bg: '#faf5ff', border: '#e9d5ff', text: '#9333ea', progress: '#a855f7' }; // purple
      case 'paused':
        return { bg: '#fefce8', border: '#fef08a', text: '#ca8a04', progress: '#eab308' }; // yellow
      default:
        return { bg: theme.background, border: theme.border, text: theme.text, progress: theme.muted };
    }
  };

  const getStatusText = () => {
    switch (pomodoroState.status) {
      case 'focus':
        return 'FOCO';
      case 'short_break':
        return 'PAUSA CURTA';
      case 'long_break':
        return 'PAUSA LONGA';
      case 'paused':
        return 'PAUSADO';
      default:
        return 'PRONTO';
    }
  };

  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (pomodoroState.status === 'focus' || pomodoroState.status === 'short_break' || pomodoroState.status === 'long_break') {
      pausePomodoroTimer();
    }
  };

  const handleReset = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setPomodoroState({
      status: 'idle',
      timeRemaining: 0,
      currentCycle: 0,
      pomodorosCompletedToday: 0,
      associatedItemId: undefined,
      associatedItemType: undefined,
      key: 0,
      previousStatus: undefined,
      pausedTime: 0,
      currentTaskIndex: undefined,
      isCustomDuration: false,
      originalDuration: undefined
    });
  };

  const colors = getStatusColor();
  const progressPercent = pomodoroState.originalDuration && pomodoroState.originalDuration > 0 
    ? ((pomodoroState.originalDuration - pomodoroState.timeRemaining) / pomodoroState.originalDuration) * 100
    : 0;

  return (
    <Card style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <CardContent style={styles.content}>
        <View style={styles.statusContainer}>
          <ThemedText style={[styles.statusText, { color: colors.text }]}>
            {getStatusText()}
          </ThemedText>
        </View>

        <View style={styles.timerContainer}>
          <ThemedText style={[styles.timerText, {
            fontSize: width < 360 ? 32 : width < 400 ? 36 : 40,
            color: colors.text
          }]}>
            {formatTime(pomodoroState.timeRemaining)}
          </ThemedText>
          
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  backgroundColor: colors.progress, 
                  width: `${progressPercent}%` 
                }
              ]} 
            />
          </View>
        </View>

        <View style={styles.controlsContainer}>
          {(pomodoroState.status === 'focus' || pomodoroState.status === 'short_break' || pomodoroState.status === 'long_break') && (
            <TouchableOpacity
              onPress={handlePause}
              style={[styles.controlButton, { borderColor: theme.border }]}
              accessibilityLabel="Pausar timer"
              accessibilityHint="Pausa a sessão atual de pomodoro"
              accessible={true}
            >
              <Pause size={24} color={theme.text} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleReset}
            style={[styles.controlButton, { borderColor: theme.border }]}
            accessibilityLabel="Reiniciar sessão"
            accessibilityHint="Reinicia o timer e volta ao estado inicial"
            accessible={true}
          >
            <RotateCcw size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {pomodoroState.currentCycle !== undefined && (
          <ThemedText style={styles.cycleText}>
            Ciclo {pomodoroState.currentCycle}
          </ThemedText>
        )}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  content: {
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  timerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  timerText: {
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  cycleText: {
    fontSize: 14,
    opacity: 0.6,
  },
});