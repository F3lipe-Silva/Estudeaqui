import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Vibration, View, ScrollView, SafeAreaView, Animated } from 'react-native';
import { Play, Pause, RotateCcw, Settings, Target, Timer, Clock, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import useSafeAreaInsets

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudy } from '../contexts/study-context';
import PomodoroSessionSelector from '@/components/pomodoro-session-selector';
import PomodoroSettingsDialog from '@/components/pomodoro-settings-dialog';
import PomodoroCompletionDialog from '@/components/pomodoro-completion-dialog';

export default function PomodoroScreen() {
  const { pomodoroState, startPomodoroForItem, pausePomodoroTimer, data } = useStudy();
  const { subjects, pomodoroSettings } = data;
  const [settingsDialogVisible, setSettingsDialogVisible] = useState(false);
  const [completionDialogVisible, setCompletionDialogVisible] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const statusAnim = useRef(new Animated.Value(1)).current;
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets(); // Hook for safe area insets

  // Pulse animation for active timer
  useEffect(() => {
    if (pomodoroState.status !== 'idle' && pomodoroState.status !== 'paused') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [pomodoroState.status, pulseAnim]);

  // Status change animation
  useEffect(() => {
    Animated.sequence([
      Animated.timing(statusAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(statusAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pomodoroState.status, statusAnim]);

  // Detectar finalização de sessão para mostrar popup
  useEffect(() => {
    if (pomodoroState.status === 'short_break' || pomodoroState.status === 'long_break') {
      // Verificar se veio de uma sessão de foco
      if (pomodoroState.previousStatus === 'focus' && pomodoroState.associatedItemId) {
        const topic = subjects.flatMap(s => s.topics).find(t => t.id === pomodoroState.associatedItemId);
        const subject = subjects.find(s => s.id === topic?.subjectId);

        if (topic && subject) {
          // Calcular tempo decorrido (when transitioning from focus to break)
          // Use originalDuration if available, otherwise calculate from task
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
          setCompletionDialogVisible(true);
        }
      }
    }
  }, [pomodoroState.status, pomodoroState.previousStatus, pomodoroState.associatedItemId, subjects]);

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
      status: pomodoroState.status,
      color: subject.color
    };
  };

  const currentSession = getCurrentSessionInfo();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'focus': return theme.pomodoroFocus;
      case 'short_break': return '#4caf50';
      case 'long_break': return '#9c27b0';
      case 'paused': return '#ff9800';
      default: return theme.mutedForeground;
    }
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'focus': return 'Foco';
      case 'short_break': return 'Pausa Curta';
      case 'long_break': return 'Pausa Longa';
      case 'paused': return 'Pausado';
      default: return 'Inativo';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
            <View>
                <ThemedText type="title">Pomodoro</ThemedText>
                <ThemedText style={styles.subtitle}>Gerencie suas sessões de estudo</ThemedText>
            </View>
            <Button variant="outline" size="sm" style={styles.settingsButton} onPress={() => setSettingsDialogVisible(true)}>
                <Settings size={16} color={theme.text} />
                <ThemedText style={{ marginLeft: 4, fontSize: 12 }}>Config</ThemedText>
            </Button>
        </View>

        {/* Timer Section */}
        <View style={styles.timerContainer} accessibilityRole="timer" accessibilityLabel={`Timer Pomodoro: ${formatTime(pomodoroState.timeRemaining)} restante, modo ${getStatusDisplay(pomodoroState.status)}`}>
            <Animated.View style={[
                styles.timerCircle,
                {
                    transform: [{ scale: pulseAnim }]
                }
            ]}>
                <LinearGradient
                    colors={[`${getStatusColor(pomodoroState.status)}20`, `${getStatusColor(pomodoroState.status)}05`]}
                    style={styles.timerGradient}
                >
                    <View style={styles.timerInner}>
                        <ThemedText style={[styles.timerText, { color: getStatusColor(pomodoroState.status) }]}>
                            {formatTime(pomodoroState.timeRemaining)}
                        </ThemedText>
                        <ThemedText style={styles.modeText}>{getStatusDisplay(pomodoroState.status)}</ThemedText>
                        {pomodoroState.status !== 'idle' && (
                            <ThemedText style={styles.progressText}>
                                {Math.round((1 - pomodoroState.timeRemaining / (pomodoroState.originalDuration || pomodoroState.timeRemaining)) * 100)}%
                            </ThemedText>
                        )}
                    </View>
                </LinearGradient>
            </Animated.View>
        </View>

        {/* Session Details - Moved to bottom */}
        <View style={styles.detailsContainer}>
          {currentSession ? (
            <View style={styles.detailRow}>
               <View style={[styles.colorDot, { backgroundColor: currentSession.color }]} />
               <View>
                   <ThemedText style={styles.detailSubject}>{currentSession.subject}</ThemedText>
                   <ThemedText style={styles.detailTopic}>{currentSession.topic}</ThemedText>
               </View>
            </View>
          ) : (
            <View style={styles.noSessionContainer}>
              <Target size={24} color={theme.mutedForeground} style={styles.noSessionIcon} />
              <ThemedText style={styles.noSessionText}>Nenhuma sessão ativa</ThemedText>
              <ThemedText style={styles.noSessionSubtext}>Selecione um assunto para começar</ThemedText>
            </View>
          )}

          <View style={styles.statusRow}>
             <Animated.View style={[
               styles.statusBadge,
               {
                 backgroundColor: getStatusColor(pomodoroState.status) + '20',
                 borderColor: getStatusColor(pomodoroState.status),
                 transform: [{ scale: statusAnim }]
               }
             ]}>
               <Clock size={14} color={getStatusColor(pomodoroState.status)} />
               <ThemedText style={[styles.statusText, { color: getStatusColor(pomodoroState.status) }]}>
                 {getStatusDisplay(pomodoroState.status)}
               </ThemedText>
             </Animated.View>
          </View>
        </View>

        {/* Floating Controls */}
        <View style={styles.floatingControls}>
            {pomodoroState.status === 'idle' ? (
                <TouchableOpacity
                    style={[styles.mainButton, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      // Open session selector
                      setSettingsDialogVisible(true); // Placeholder, should open selector
                    }}
                    activeOpacity={0.8}
                    accessibilityLabel="Iniciar nova sessão"
                >
                    <Play color="white" size={32} />
                </TouchableOpacity>
            ) : (
                <>
                    <TouchableOpacity
                        style={[
                            styles.mainButton,
                            { backgroundColor: pomodoroState.status === 'paused' ? getStatusColor(pomodoroState.status) : theme.destructive }
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          pausePomodoroTimer();
                        }}
                        activeOpacity={0.8}
                        accessibilityLabel={pomodoroState.status === 'paused' ? 'Retomar sessão' : 'Pausar sessão'}
                    >
                        {pomodoroState.status === 'paused' ? <Play color="white" size={32} /> : <Pause color="white" size={32} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.secondaryButton, { backgroundColor: theme.muted }]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          // Reset logic
                        }}
                        activeOpacity={0.8}
                        accessibilityLabel="Reiniciar sessão"
                    >
                        <RotateCcw color={theme.icon} size={24} />
                    </TouchableOpacity>
                </>
            )}
        </View>

        {/* Session Selector Modal/Sheet - Placeholder for now */}
        {pomodoroState.status === 'idle' && (
          <View style={styles.selectorOverlay}>
            <Card style={styles.selectorCard}>
              <PomodoroSessionSelector
                onStartSession={(subjectId: string, topicId: string, customDuration?: number) => {
                  startPomodoroForItem(topicId, 'topic', true, customDuration);
                }}
                disabled={false}
              />
            </Card>
          </View>
        )}
      </ThemedView>

      {/* Settings Dialog */}
      <PomodoroSettingsDialog
        visible={settingsDialogVisible}
        onClose={() => setSettingsDialogVisible(false)}
      />

      {/* Completion Dialog */}
      <PomodoroCompletionDialog
        visible={completionDialogVisible}
        onClose={() => setCompletionDialogVisible(false)}
        sessionData={completionData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  settingsButton: {
      flexDirection: 'row',
      paddingHorizontal: 12,
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  timerGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerInner: {
    width: 260,
    height: 260,
    borderRadius: 130,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  timerText: {
    fontSize: 60,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  modeText: {
    fontSize: 18,
    marginTop: 8,
    opacity: 0.8,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.6,
    fontWeight: '400',
  },
  floatingControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  secondaryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  detailsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 100, // Space for floating controls
  },
  selectorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  selectorCard: {
    width: '100%',
    maxHeight: '70%',
  },
  detailRow: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
  },
  colorDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
  },
  detailSubject: {
      fontWeight: '500',
  },
  detailTopic: {
      fontSize: 12,
      opacity: 0.6,
  },
  statusRow: {
      alignItems: 'center',
  },
  statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
  },
  statusText: {
      fontSize: 13,
      fontWeight: '600',
  },
  noSessionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noSessionIcon: {
    marginBottom: 8,
  },
  noSessionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  noSessionSubtext: {
    fontSize: 14,
    opacity: 0.6,
  }
});