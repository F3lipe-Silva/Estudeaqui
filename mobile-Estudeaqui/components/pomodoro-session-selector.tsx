import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Target, Play, BookOpen } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useStudy } from '../contexts/study-context';
import { useAlert } from '../contexts/alert-context';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';

interface PomodoroSessionSelectorProps {
  onStartSession: (subjectId: string, topicId: string, customDuration?: number) => void;
  disabled?: boolean;
}

export default function PomodoroSessionSelector({ onStartSession, disabled = false }: PomodoroSessionSelectorProps) {
  const { data } = useStudy();
  const { showAlert } = useAlert();
  const { subjects } = data;
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState('25'); // Default to 25 minutes
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const availableTopics = subjects.find(s => s.id === selectedSubject)?.topics || [];

  const handleStartSession = () => {
    if (selectedSubject && selectedTopic) {
      let duration: number | undefined = undefined;
      if (useCustomTime) {
        const numericTime = parseInt(customTime);
        if (isNaN(numericTime) || numericTime < 1) {
          showAlert({
            title: 'Erro',
            message: 'Tempo personalizado deve ser um número maior ou igual a 1.',
            variant: 'destructive',
            primaryButton: {
              text: 'OK',
              action: () => {}
            }
          });
          return;
        }
        duration = numericTime * 60; // Convert to seconds
      }
      onStartSession(selectedSubject, selectedTopic, duration);
    } else {
      showAlert({
        title: 'Erro',
        message: 'Selecione uma matéria e um assunto para iniciar a sessão.',
        variant: 'destructive',
        primaryButton: {
          text: 'OK',
          action: () => {}
        }
      });
    }
  };

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject);

  return (
    <>
    <Card style={styles.container}>
      <CardHeader style={styles.header}>
        <CardTitle style={styles.title}>
          <Target size={20} color={theme.icon} style={styles.icon} />
          <Text style={styles.titleText}>Iniciar Sessão</Text>
        </CardTitle>
      </CardHeader>
      <CardContent style={styles.content}>
        {/* Seleção de Matéria */}
        <View style={styles.section}>
          <Text style={styles.label}>Matéria</Text>
          <View style={[styles.selectContainer, { borderColor: theme.border }]}>
            <TouchableOpacity
              style={styles.selectTrigger}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (subjects.length === 0) {
                  showAlert({
                    title: 'Nenhuma matéria',
                    message: 'Adicione matérias primeiro.',
                    variant: 'default',
                    primaryButton: {
                      text: 'OK',
                      action: () => {}
                    }
                  });
                  return;
                }
                setShowSubjectModal(true);
              }}
              disabled={disabled}
              accessibilityLabel="Selecionar matéria"
              accessibilityHint="Abre lista de matérias disponíveis"
              accessible={true}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
              <Text style={styles.selectValue}>
                {selectedSubjectData ? selectedSubjectData.name : 'Selecione uma matéria'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seleção de Assunto */}
        <View style={styles.section}>
          <Text style={styles.label}>Assunto</Text>
          <View style={[styles.selectContainer, { borderColor: theme.border }]}>
            <TouchableOpacity
              style={styles.selectTrigger}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (!selectedSubject) {
                  showAlert({
                    title: 'Erro',
                    message: 'Selecione uma matéria primeiro.',
                    variant: 'destructive',
                    primaryButton: {
                      text: 'OK',
                      action: () => {}
                    }
                  });
                  return;
                }

                if (availableTopics.length === 0) {
                  showAlert({
                    title: 'Nenhum assunto',
                    message: 'Esta matéria não tem assuntos cadastrados.',
                    variant: 'default',
                    primaryButton: {
                      text: 'OK',
                      action: () => {}
                    }
                  });
                  return;
                }
                setShowTopicModal(true);
              }}
              disabled={disabled || !selectedSubject}
              accessibilityLabel="Selecionar assunto"
              accessibilityHint="Abre lista de assuntos da matéria selecionada"
              accessible={true}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
              <Text style={styles.selectValue}>
                {selectedTopic ? availableTopics.find(t => t.id === selectedTopic)?.name : 'Selecione um assunto'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações da Matéria Selecionada */}
        {selectedSubjectData && (
          <View style={[styles.infoContainer, { backgroundColor: theme.muted }]}>
            <View style={styles.infoRow}>
              <View style={[styles.colorDot, { backgroundColor: selectedSubjectData.color }]} />
              <Text style={styles.infoSubject}>{selectedSubjectData.name}</Text>
            </View>

            {selectedSubjectData.studyDuration && (
              <View style={styles.infoRow}>
                <BookOpen size={14} color={theme.icon} />
                <Text style={styles.infoText}>Tempo sugerido: {selectedSubjectData.studyDuration} min</Text>
              </View>
            )}

            <Text style={styles.infoText}>{availableTopics.length} assuntos disponíveis</Text>
          </View>
        )}

        {/* Opção de tempo personalizado */}
        <View style={styles.section}>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, { borderColor: theme.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setUseCustomTime(!useCustomTime);
              }}
              accessibilityLabel="Alternar tempo personalizado"
              accessibilityHint="Ativa ou desativa a opção de definir tempo customizado"
              accessible={true}
            >
              {useCustomTime && <Text style={styles.checkboxIcon}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Usar tempo personalizado</Text>
          </View>

          {useCustomTime && (
            <View style={styles.customTimeContainer}>
              <Text style={styles.label}>Tempo (minutos)</Text>
              <Input
                value={customTime}
                onChangeText={setCustomTime}
                keyboardType="numeric"
                style={[styles.input, { borderColor: theme.border, backgroundColor: theme.background }]}
              />
            </View>
          )}
        </View>

        {/* Botão Iniciar */}
        <Button
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleStartSession();
          }}
          disabled={!selectedSubject || !selectedTopic || disabled}
          style={styles.startButton}
          accessibilityLabel="Iniciar sessão pomodoro"
          accessibilityHint="Inicia uma nova sessão com a matéria e assunto selecionados"
          accessible={true}
        >
          <Play size={16} color="white" style={styles.buttonIcon} />
          <Text style={styles.startButtonText}>Iniciar Sessão Pomodoro</Text>
        </Button>

        {disabled && (
          <Text style={styles.disabledText}>
            Finalize a sessão atual para iniciar uma nova
          </Text>
        )}
      </CardContent>
    </Card>

    {/* Subject Selection Modal */}
    <Modal visible={showSubjectModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.selectionModal, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Selecionar Matéria</Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowSubjectModal(false);
              }}
              accessibilityLabel="Fechar seleção de matéria"
              accessible={true}
            >
              <Text style={[styles.closeButton, { color: theme.primary }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {subjects.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
                Nenhuma matéria cadastrada
              </Text>
            ) : (
              <FlatList
                data={subjects}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.selectionItem,
                      selectedSubject === item.id && styles.selectionItemSelected
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedSubject(item.id);
                      setSelectedTopic(''); // Reset topic when subject changes
                      setShowSubjectModal(false);
                    }}
                    accessibilityLabel={`Selecionar matéria ${item.name}`}
                    accessible={true}
                  >
                    <View style={[styles.subjectIcon, { backgroundColor: item.color + '20' }]}>
                      <Text style={{ color: item.color, fontSize: 16 }}>📚</Text>
                    </View>
                    <Text style={[styles.selectionItemText, { color: theme.text }]}>
                      {item.name}
                    </Text>
                    {selectedSubject === item.id && (
                      <Text style={[styles.checkmark, { color: theme.primary }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>

    {/* Topic Selection Modal */}
    <Modal visible={showTopicModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.selectionModal, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Selecionar Assunto
            </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowTopicModal(false);
              }}
              accessibilityLabel="Fechar seleção de assunto"
              accessible={true}
            >
              <Text style={[styles.closeButton, { color: theme.primary }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.modalContent, styles.topicModalContent]}>
            <Text style={[styles.selectedSubjectText, { color: theme.mutedForeground }]}>
              Matéria: {subjects.find(s => s.id === selectedSubject)?.name}
            </Text>
            {availableTopics.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
                Nenhum assunto cadastrado
              </Text>
            ) : (
              <FlatList
                data={availableTopics}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.selectionItem,
                      selectedTopic === item.id && styles.selectionItemSelected
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedTopic(item.id);
                      setShowTopicModal(false);
                    }}
                    accessibilityLabel={`Selecionar assunto ${item.name}`}
                    accessible={true}
                  >
                    <Text style={[styles.selectionItemText, { color: theme.text }]}>
                      {item.name}
                    </Text>
                    {selectedTopic === item.id && (
                      <Text style={[styles.checkmark, { color: theme.primary }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  selectContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectTrigger: {
    padding: 12,
    backgroundColor: 'transparent',
  },
  selectValue: {
    fontSize: 16,
  },
  infoContainer: {
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  infoSubject: {
    fontWeight: '600',
    fontSize: 14,
  },
  infoText: {
    fontSize: 12,
    opacity: 0.6,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxIcon: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
  },
  customTimeContainer: {
    paddingLeft: 24,
    gap: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  buttonIcon: {
    marginRight: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.6,
  },

  // Selection Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  selectionModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    maxHeight: '80%',
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  topicModalContent: {
    paddingTop: 10,
  },
  selectedSubjectText: {
    fontSize: 14,
    marginBottom: 16,
    fontWeight: '500',
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  selectionItemSelected: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  subjectIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectionItemText: {
    flex: 1,
    fontSize: 16,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 40,
  },
});