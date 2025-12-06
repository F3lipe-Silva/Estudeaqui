import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { Settings, Target, Clock, Timer } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useStudy } from '../../contexts/study-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import ClockWidget from '@/components/clock-widget';
import PomodoroSessionSelector from '@/components/pomodoro-session-selector';
import PomodoroCompletionDialog from '@/components/pomodoro-completion-dialog';
import PomodoroSettingsDialog from '@/components/pomodoro-settings-dialog';

export default function PomodoroScreen() {
  const { pomodoroState, data, startPomodoroForItem } = useStudy();
  const { subjects, pomodoroSettings } = data;
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

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
      status: pomodoroState.status,
      color: subject.color
    };
  };

  const currentSession = getCurrentSessionInfo();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.header}>
        <View>
          <ThemedText type="title">Pomodoro</ThemedText>
          <ThemedText style={styles.subtitle}>Gerencie seu foco</ThemedText>
        </View>
        <TouchableOpacity onPress={() => setSettingsDialogOpen(true)} style={styles.settingsButton}>
          <Settings size={24} color={theme.icon} />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Widget do Relógio */}
        <ClockWidget />

        {/* Seletor de Sessão */}
        <View style={styles.section}>
            <PomodoroSessionSelector
              onStartSession={(subjectId, topicId, customDuration) => {
                startPomodoroForItem(topicId, 'topic', true, customDuration);
              }}
              disabled={pomodoroState.status !== 'idle'}
            />
        </View>

        {/* Status da Sessão */}
        {currentSession && (
            <Card style={styles.statusCard}>
              <CardHeader style={styles.cardHeader}>
                <CardTitle style={styles.cardTitle}>
                  <Target size={20} color={theme.icon} />
                  <ThemedText type="defaultSemiBold">Detalhes da Sessão</ThemedText>
                </CardTitle>
              </CardHeader>
              <CardContent style={styles.cardContent}>
                <View style={styles.sessionInfoRow}>
                  <View style={[styles.colorDot, { backgroundColor: currentSession.color }]} />
                  <View>
                    <ThemedText style={styles.subjectName}>{currentSession.subject}</ThemedText>
                    <ThemedText style={styles.topicName}>{currentSession.topic}</ThemedText>
                  </View>
                </View>
                
                <View style={styles.statusRow}>
                  <Clock size={16} color={theme.mutedForeground} />
                  <ThemedText style={styles.statusLabel}>Status: </ThemedText>
                  <ThemedText style={[
                      styles.statusValue, 
                      currentSession.status === 'focus' && { color: '#16a34a' },
                      currentSession.status === 'paused' && { color: '#ca8a04' },
                      currentSession.status === 'short_break' && { color: '#2563eb' },
                      currentSession.status === 'long_break' && { color: '#9333ea' }
                  ]}>
                      {currentSession.status === 'focus' && 'Foco'}
                      {currentSession.status === 'paused' && 'Pausado'}
                      {currentSession.status === 'short_break' && 'Pausa Curta'}
                      {currentSession.status === 'long_break' && 'Pausa Longa'}
                  </ThemedText>
                </View>
              </CardContent>
            </Card>
        )}

        {/* Estado Vazio (Sem Sessão) */}
        {!currentSession && (
            <Card style={styles.emptyCard}>
              <CardContent style={styles.emptyContent}>
                  <View style={styles.emptyIconContainer}>
                    <Timer size={48} color={theme.mutedForeground} />
                  </View>
                  <ThemedText type="subtitle" style={styles.emptyTitle}>Nenhuma sessão ativa</ThemedText>
                  <ThemedText style={styles.emptyText}>
                    Selecione uma matéria e assunto acima para iniciar.
                  </ThemedText>
              </CardContent>
            </Card>
        )}
      </ScrollView>

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
  content: { padding: 20, paddingBottom: 40, gap: 20 },
  section: { marginBottom: 0 },
  
  // Status Card Styles
  statusCard: { marginTop: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardContent: { padding: 16, gap: 16 },
  sessionInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  colorDot: { width: 16, height: 16, borderRadius: 8 },
  subjectName: { fontWeight: '600', fontSize: 16 },
  topicName: { fontSize: 14, opacity: 0.7 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusLabel: { fontSize: 14, opacity: 0.7 },
  statusValue: { fontWeight: 'bold', fontSize: 14 },

  // Empty Card Styles
  emptyCard: { marginTop: 10 },
  emptyContent: { alignItems: 'center', padding: 32, gap: 12 },
  emptyIconContainer: { padding: 16, borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.03)', marginBottom: 8 },
  emptyTitle: { textAlign: 'center' },
  emptyText: { textAlign: 'center', opacity: 0.6, maxWidth: 250 },
});