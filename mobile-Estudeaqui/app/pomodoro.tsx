import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Vibration, View, ScrollView } from 'react-native';
import { Play, Pause, RotateCcw, Settings, Target, Timer, Clock, Plus } from 'lucide-react-native';
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
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets(); // Hook for safe area insets

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
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}> {/* Apply safe area insets to the main container */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
        <View style={styles.timerContainer}>
            <View style={[
                styles.timerCircle, 
                { 
                    borderColor: getStatusColor(pomodoroState.status),
                    backgroundColor: `${getStatusColor(pomodoroState.status)}10`
                }
            ]}>
                <ThemedText style={[styles.timerText, { color: getStatusColor(pomodoroState.status) }]}>
                    {formatTime(pomodoroState.timeRemaining)}
                </ThemedText>
                <ThemedText style={styles.modeText}>{getStatusDisplay(pomodoroState.status)}</ThemedText>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity 
                    style={[
                        styles.mainButton, 
                        { backgroundColor: pomodoroState.status === 'paused' ? getStatusColor(pomodoroState.status) : theme.destructive }
                    ]} 
                    onPress={pausePomodoroTimer}
                    activeOpacity={0.8}
                >
                    {pomodoroState.status === 'paused' ? <Play color="white" size={32} /> : <Pause color="white" size={32} />}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.resetButton, { backgroundColor: theme.muted }]} 
                    onPress={() => {
                      // Reset do estado do pomodoro
                    }}
                    activeOpacity={0.8}
                >
                    <RotateCcw color={theme.icon} size={24} />
                </TouchableOpacity>
            </View>
        </View>

        {/* Session Selector */}
        <Card style={styles.selectorCard}>
          <PomodoroSessionSelector
            onStartSession={(subjectId: string, topicId: string, customDuration?: number) => {
              startPomodoroForItem(topicId, 'topic', true, customDuration);
            }}
            disabled={pomodoroState.status !== 'idle'}
          />
        </Card>

        {/* Session Details */}
        <Card>
            <CardHeader style={styles.detailsHeader}>
                <CardTitle style={{ fontSize: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                     Detalhes da Sessão
                </CardTitle>
            </CardHeader>
            <CardContent style={styles.detailsContent}>
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
                    <Clock size={14} color={theme.mutedForeground} />
                    <ThemedText style={styles.statusText}>
                        Status: <ThemedText style={{ fontWeight: 'bold', color: getStatusColor(pomodoroState.status) }}>
                            {getStatusDisplay(pomodoroState.status)}
                        </ThemedText>
                    </ThemedText>
                 </View>
            </CardContent>
        </Card>
      </ScrollView>

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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    // paddingTop: 60, // Removed hardcoded padding
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  timerCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 56,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  modeText: {
    fontSize: 20,
    marginTop: 8,
    opacity: 0.7,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  mainButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  resetButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorCard: {
      marginBottom: 0,
  },
  selectorContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
  },
  selectorLabel: {
      fontSize: 12,
      opacity: 0.6,
  },
  selectorValue: {
      fontWeight: '600',
      fontSize: 14,
  },
  detailsHeader: {
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0.05)',
  },
  detailsContent: {
      paddingTop: 16,
      gap: 16,
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
  },
  statusText: {
      fontSize: 13,
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