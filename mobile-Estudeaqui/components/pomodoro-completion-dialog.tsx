import React, { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { CheckCircle, Clock, BookOpen, X, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useStudy } from '../contexts/study-context';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import StudyLogForm from './study-log-form';

interface PomodoroCompletionDialogProps {
  visible: boolean;
  onClose: () => void;
  sessionData: {
    subjectId: string;
    topicId: string;
    duration: number;
    subjectName: string;
    topicName: string;
  } | null;
  onComplete?: () => void;
}

const { width } = Dimensions.get('window');

export default function PomodoroCompletionDialog({ 
  visible, 
  onClose, 
  sessionData 
}: PomodoroCompletionDialogProps) {
  const [showLogForm, setShowLogForm] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  if (!sessionData) return null;

  const handleRegisterSession = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowLogForm(true);
  };

  const handleLogFormSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowLogForm(false);
    onClose();
  };

  const handleLogFormCancel = () => {
    setShowLogForm(false);
    onClose(); // Ou voltar para a tela de resumo se preferir
  };

  const handleIgnore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContainer}>
          {!showLogForm ? (
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <CheckCircle size={48} color="#10B981" fill="#D1FAE5" />
                </View>
                <ThemedText type="title" style={styles.title}>Sessão Concluída!</ThemedText>
                <ThemedText style={styles.subtitle}>
                  Você manteve o foco por
                </ThemedText>
              </View>

              <View style={styles.heroSection}>
                <ThemedText style={[styles.heroTime, { color: theme.text }]}>
                  {sessionData.duration}
                  <ThemedText style={styles.heroUnit}>min</ThemedText>
                </ThemedText>
              </View>

              <View style={[styles.detailsContainer, { backgroundColor: theme.card }]}>
                <View style={styles.detailItem}>
                  <BookOpen size={20} color={theme.icon} style={styles.detailIcon} />
                  <View style={styles.detailTextContainer}>
                    <ThemedText type="defaultSemiBold">{sessionData.subjectName}</ThemedText>
                    <ThemedText style={styles.detailSubText}>{sessionData.topicName}</ThemedText>
                  </View>
                </View>
              </View>

              <ThemedText style={styles.promptText}>
                Deseja registrar esse tempo no seu histórico?
              </ThemedText>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: theme.tint }]}
                  onPress={handleRegisterSession}
                >
                  <ThemedText style={styles.primaryButtonText}>Registrar Sessão</ThemedText>
                  <ArrowRight size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleIgnore}
                >
                  <ThemedText style={[styles.secondaryButtonText, { color: theme.mutedForeground }]}>
                    Não, apenas ignorar
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <ThemedView style={styles.formContentWrapper}>
              <View style={styles.formHeader}>
                <ThemedText type="subtitle">Registrar Sessão</ThemedText>
                <TouchableOpacity onPress={handleLogFormCancel} style={styles.closeButton}>
                  <X size={24} color={theme.icon} />
                </TouchableOpacity>
              </View>
              <StudyLogForm
                onSave={handleLogFormSave}
                onCancel={handleLogFormCancel}
                initialData={{
                  subjectId: sessionData.subjectId,
                  topicId: sessionData.topicId,
                  duration: sessionData.duration,
                  source: 'pomodoro'
                }}
              />
            </ThemedView>
          )}
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    flex: 1, // Allow modal to stretch vertically
  },
  content: {
    padding: 32,
    alignItems: 'center',
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  heroTime: {
    fontSize: 64,
    fontWeight: '800',
    lineHeight: 70,
    fontVariant: ['tabular-nums'],
  },
  heroUnit: {
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 4,
  },
  detailsContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)', // Fallback if theme.card is not defined
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    opacity: 0.7,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailSubText: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  promptText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.5,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Form Styles
  formContentWrapper: {
    flex: 1,
    borderRadius: 24, // Match parent modalContainer border radius
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20, // Add padding to the header
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  closeButton: {
    padding: 4,
  },
});