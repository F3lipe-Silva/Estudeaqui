import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { CheckCircle, Clock, BookOpen, X } from 'lucide-react-native';
import { useStudy } from '../contexts/study-context';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
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

export default function PomodoroCompletionDialog({ 
  visible, 
  onClose, 
  sessionData 
}: PomodoroCompletionDialogProps) {
  const [showLogForm, setShowLogForm] = useState(false);
  const { startPomodoroForItem } = useStudy();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  if (!sessionData) return null;

  const handleRegisterSession = () => {
    setShowLogForm(true);
  };

  const handleLogFormSave = () => {
    setShowLogForm(false);
    onClose();
  };

  const handleLogFormCancel = () => {
    setShowLogForm(false);
    onClose();
  };

  const handleIgnore = () => {
    onClose();
  };

  // Função para criar estilos dinâmicos com base no tema
 const getModalContentStyle = (theme: any) => ({
    ...styles.modalContent,
    backgroundColor: theme.background,
    borderColor: theme.border,
  });

  const getHeaderTitleStyle = (theme: any) => ({
    ...styles.headerTitle,
    color: theme.text,
  });

  const getDescriptionStyle = (theme: any) => ({
    ...styles.description,
    color: theme.text,
  });

  const getDetailsCardStyle = (theme: any) => ({
    ...styles.detailsCard,
    backgroundColor: theme.muted,
  });

  const getDetailStyle = (theme: any) => ({
    ...styles.detailSubject,
    color: theme.text,
  });

  const getTopicStyle = (theme: any) => ({
    ...styles.detailTopic,
    color: theme.text,
  });

  const getQuestionStyle = (theme: any) => ({
    ...styles.question,
    color: theme.text,
  });

  const getButtonStyle = (theme: any, variant: 'outline' | 'primary') => {
    if (variant === 'outline') {
      return {
        ...styles.button,
        borderColor: theme.border,
        backgroundColor: theme.muted,
      };
    } else {
      return {
        ...styles.button,
        backgroundColor: theme.primary,
      };
    }
  };

  const getButtonTextStyle = (theme: any, variant: 'outline' | 'primary') => {
    if (variant === 'outline') {
      return {
        ...styles.buttonText,
        color: theme.text,
      };
    } else {
      return {
        ...styles.buttonText,
        color: 'white',
      };
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={getModalContentStyle(theme)}>
          {!showLogForm ? (
            <ScrollView contentContainerStyle={styles.content}>
              <View style={styles.header}>
                <CheckCircle size={24} color="#10B981" style={styles.headerIcon} />
                <CardTitle style={getHeaderTitleStyle(theme)}>Sessão Concluída!</CardTitle>
              </View>
              
              <Text style={getDescriptionStyle(theme)}>
                Parabéns! Você completou mais uma sessão de estudo focada.
              </Text>
              
              <View style={styles.sessionInfo}>
                {/* Tempo decorrido */}
                <View style={[styles.timeCard, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Clock size={32} color="#10B981" style={styles.timeIcon} />
                  <Text style={[styles.timeValue, { color: '#10B981' }]}>
                    {sessionData.duration} minutos
                  </Text>
                  <Text style={[styles.timeLabel, { color: theme.text }]}>
                    Tempo de estudo focado
                  </Text>
                </View>

                {/* Detalhes da sessão */}
                <View style={getDetailsCardStyle(theme)}>
                  <View style={styles.detailRow}>
                    <BookOpen size={20} color={theme.icon} />
                    <View>
                      <Text style={getDetailStyle(theme)}>{sessionData.subjectName}</Text>
                      <Text style={getTopicStyle(theme)}>{sessionData.topicName}</Text>
                    </View>
                  </View>
                </View>

                {/* Pergunta de registro */}
                <Text style={getQuestionStyle(theme)}>
                  Deseja registrar esta sessão no seu histórico de estudos?
                </Text>
              </View>
              
              <View style={styles.buttonContainer}>
                <Button 
                  variant="outline" 
                  style={getButtonStyle(theme, 'outline')}
                  onPress={handleIgnore}
                >
                  <X size={16} color={theme.text} style={styles.buttonIcon} />
                  <Text style={getButtonTextStyle(theme, 'outline')}>Ignorar</Text>
                </Button>
                <Button 
                  style={getButtonStyle(theme, 'primary')}
                  onPress={handleRegisterSession}
                >
                  <CheckCircle size={16} color="white" style={styles.buttonIcon} />
                  <Text style={getButtonTextStyle(theme, 'primary')}>Registrar Sessão</Text>
                </Button>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.logFormContainer}>
              <CardHeader>
                <CardTitle style={{ color: theme.text }}>Registrar Sessão de Estudo</CardTitle>
              </CardHeader>
              
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
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: '90%',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  sessionInfo: {
    gap: 16,
  },
  timeCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
  },
  timeIcon: {
    marginBottom: 8,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  detailsCard: {
    padding: 12,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailSubject: {
    fontWeight: '600',
  },
  detailTopic: {
    fontSize: 12,
    opacity: 0.6,
  },
  question: {
    fontSize: 14,
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontWeight: '600',
  },
  logFormContainer: {
    flex: 1,
    padding: 20,
  },
});