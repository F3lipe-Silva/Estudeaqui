import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Settings, Play, Pause, Square, RotateCcw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useStudy } from '../../contexts/study-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import ClockWidget from '@/components/clock-widget';
import PomodoroSessionSelector from '@/components/pomodoro-session-selector';
import PomodoroCompletionDialog from '@/components/pomodoro-completion-dialog';
import PomodoroSettingsDialog from '@/components/pomodoro-settings-dialog';

export default function PomodoroScreen() {
  const { pomodoroState, data, startPomodoroForItem, pausePomodoroTimer, setPomodoroState } = useStudy();
  const { subjects, pomodoroSettings } = data;
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const isActive = pomodoroState.status !== 'idle';

  // Detectar finalização de sessão para mostrar popup
  useEffect(() => {
    if (pomodoroState.status === 'short_break' || pomodoroState.status === 'long_break') {
      // Verificar se veio de uma sessão de foco
      if (pomodoroState.previousStatus === 'focus' && pomodoroState.associatedItemId) {
        const topic = subjects.flatMap(s => s.topics).find(t => t.id === pomodoroState.associatedItemId);
        const subject = subjects.find(s => s.id === topic?.subjectId);

        if (topic && subject) {
          const timeElapsed = pomodoroState.originalDuration
            ? Math.round(pomodoroState.originalDuration / 60)
            : Math.round((pomodoroSettings?.tasks?.[pomodoroState.currentTaskIndex || 0]?.duration || 0) / 60);

          setCompletionData({
            subjectId: subject.id,
            topicId: topic.id,
            duration: timeElapsed,
            subjectName: subject.name,
            topicName: topic.name
          });
          setCompletionDialogOpen(true);
        }
      }
    }
  }, [pomodoroState.status, pomodoroState.previousStatus, pomodoroState.associatedItemId, subjects, pomodoroSettings]);

  const getCurrentSessionInfo = () => {
    if (!pomodoroState.associatedItemId || pomodoroState.status === 'idle') {
      return null;
    }

    const topic = subjects.flatMap(s => s.topics).find(t => t.id === pomodoroState.associatedItemId);
    const subject = subjects.find(s => s.id === topic?.subjectId);
    
    if (!topic || !subject) return null;

    return {
      subject: subject.name,
      topic: topic.name,
      color: subject.color
    };
  };

  const currentSession = getCurrentSessionInfo();

  const handlePauseResume = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pausePomodoroTimer();
  };

  const handleStop = () => {
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

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title">Pomodoro</ThemedText>
          <ThemedText style={styles.subtitle}>Gerencie seu foco</ThemedText>
        </View>
        <TouchableOpacity onPress={() => setSettingsDialogOpen(true)} style={styles.settingsButton}>
          <Settings size={24} color={theme.icon} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {!isActive ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
             <PomodoroSessionSelector
              onStartSession={(subjectId, topicId, customDuration) => {
                startPomodoroForItem(topicId, 'topic', true, customDuration);
              }}
            />
          </ScrollView>
        ) : (
          <View style={styles.activeSessionContainer}>
            <View style={styles.timerWrapper}>
              <ClockWidget />
              {currentSession && (
                <View style={styles.sessionInfo}>
                  <View style={[styles.colorDot, { backgroundColor: currentSession.color }]} />
                  <ThemedText style={styles.sessionText}>
                    {currentSession.subject} - {currentSession.topic}
                  </ThemedText>
                </View>
              )}
            </View>

            <View style={styles.controlsContainer}>
              <TouchableOpacity
                onPress={handleStop}
                style={[styles.controlButton, styles.stopButton]}
                accessibilityLabel="Parar sessão"
              >
                <Square size={24} color={theme.text} fill={theme.text} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePauseResume}
                style={[styles.controlButton, styles.playPauseButton, { backgroundColor: theme.text }]}
                accessibilityLabel={pomodoroState.status === 'paused' ? "Retomar" : "Pausar"}
              >
                {pomodoroState.status === 'paused' ? (
                  <Play size={32} color={theme.background} fill={theme.background} />
                ) : (
                  <Pause size={32} color={theme.background} fill={theme.background} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Dialogs */}
      <PomodoroCompletionDialog
        visible={completionDialogOpen}
        onClose={() => setCompletionDialogOpen(false)}
        sessionData={completionData}
      />

      <PomodoroSettingsDialog
        visible={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
      paddingHorizontal: 20, 
      paddingBottom: 10, 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
  },
  subtitle: { fontSize: 14, opacity: 0.6, marginTop: 4 },
  settingsButton: { padding: 8 },
  contentContainer: { flex: 1 },
  scrollContent: { padding: 20 },
  
  // Active Session Styles
  activeSessionContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  timerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  colorDot: { width: 8, height: 8, borderRadius: 4 },
  sessionText: { fontSize: 14, opacity: 0.7 },
  
  // Controls
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  stopButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});