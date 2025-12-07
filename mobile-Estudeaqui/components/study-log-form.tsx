import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Modal, useWindowDimensions, ScrollView } from 'react-native';
import { useStudy } from '../contexts/study-context';
import { useAlert } from '../contexts/alert-context';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';

interface StudyLogFormProps {
  onSave: () => void;
  onCancel: () => void;
  existingLog?: any;
  initialData?: { subjectId?: string, topicId?: string, sequenceItemIndex?: number, duration?: number, source?: string };
}

export default function StudyLogForm({ onSave, onCancel, existingLog, initialData }: StudyLogFormProps) {
  const { data, dispatch } = useStudy();
  const { showAlert } = useAlert();
  const [subjectId, setSubjectId] = useState(existingLog?.subjectId || initialData?.subjectId || '');
  const [topicId, setTopicId] = useState(existingLog?.topicId || initialData?.topicId || '');
  const [duration, setDuration] = useState(existingLog?.duration || initialData?.duration || '');
  const [startPage, setStartPage] = useState(existingLog?.startPage || '');
  const [endPage, setEndPage] = useState(existingLog?.endPage || '');
  const [questionsTotal, setQuestionsTotal] = useState(existingLog?.questionsTotal || '');
  const [questionsCorrect, setQuestionsCorrect] = useState(existingLog?.questionsCorrect || '');
  const [source, setSource] = useState(existingLog?.source || initialData?.source || '');
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth < 400;

  const availableTopics = data.subjects.find(s => s.id === subjectId)?.topics || [];

  useEffect(() => {
    if (existingLog) {
      setSubjectId(existingLog.subjectId);
      setTopicId(existingLog.topicId);
      setDuration(existingLog.duration);
      setStartPage(existingLog.startPage);
      setEndPage(existingLog.endPage);
      setQuestionsTotal(existingLog.questionsTotal);
      setQuestionsCorrect(existingLog.questionsCorrect);
      setSource(existingLog.source || '');
    } else if (!existingLog && initialData) {
      setSubjectId(initialData.subjectId || '');
      setTopicId(initialData.topicId || '');
      setDuration(initialData.duration || '');
      setStartPage('');
      setEndPage('');
      setQuestionsTotal('');
      setQuestionsCorrect('');
      setSource(initialData.source || '');
    }
  }, [existingLog, initialData]);

  const handleSubmit = () => {
    const numericDuration = Number(duration);
    if (!subjectId || !topicId || numericDuration <= 0) {
      showAlert({
        title: 'Erro',
        message: 'Preencha pelo menos a matéria, assunto e duração.',
        variant: 'destructive',
        primaryButton: {
          text: 'OK',
          action: () => {}
        }
      });
      return;
    }

    const logData = {
        subjectId,
        topicId,
        duration: numericDuration,
        startPage: Number(startPage),
        endPage: Number(endPage),
        questionsTotal: Number(questionsTotal),
        questionsCorrect: Number(questionsCorrect),
        source,
        ...(initialData?.sequenceItemIndex !== undefined && { sequenceItemIndex: initialData.sequenceItemIndex }),
    };

    if (existingLog) {
      dispatch({
        type: 'UPDATE_STUDY_LOG',
        payload: { ...existingLog, ...logData },
      });
      showAlert({
        title: 'Sucesso',
        message: 'Registro de estudo atualizado!',
        variant: 'success',
        primaryButton: {
          text: 'OK',
          action: () => {}
        }
      });
    } else {
        dispatch({
            type: 'ADD_STUDY_LOG',
            payload: logData,
        });
        showAlert({
          title: 'Sucesso',
          message: 'Sessão de estudo registrada!',
          variant: 'success',
          primaryButton: {
            text: 'OK',
            action: () => {}
          }
        });
    }
    onSave(); // Close dialog
  };

  // Funções para criar estilos dinâmicos com base no tema
  const getCardStyle = (theme: any) => ({
    ...styles.card,
    backgroundColor: theme.card,
    borderColor: theme.border,
  });

  const getSelectStyle = (theme: any) => ({
    ...styles.select,
    borderColor: theme.border,
    backgroundColor: theme.background,
  });

  const getInputStyle = (theme: any) => ({
    ...styles.input,
    borderColor: theme.border,
    backgroundColor: theme.background,
    color: theme.text,
  });

  const getButtonStyle = (theme: any, type: 'outline' | 'primary') => ({
    ...styles.button,
    borderColor: type === 'outline' ? theme.border : undefined,
    backgroundColor: type === 'outline' ? theme.muted : theme.primary,
  });

  return (
    <View style={styles.container}>
      <Card style={{ ...getCardStyle(theme), maxHeight: '90%' }}>
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <CardHeader>
            <CardTitle style={{ color: theme.text }}>
              {existingLog ? 'Editar Registro de Estudo' : 'Registrar Sessão de Estudo'}
            </CardTitle>
          </CardHeader>
        <CardContent style={styles.content}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16, paddingVertical: 16 }}>
            <View style={isSmallScreen ? styles.columnStack : styles.row}>
              <View style={isSmallScreen ? styles.columnFull : styles.column}>
                <Text style={[styles.label, { color: theme.text }]}>Matéria</Text>
                 <TouchableOpacity
                   style={getSelectStyle(theme)}
                   onPress={() => {
                     if (data.subjects.length === 0) {
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
                 >
                  <Text style={{ color: theme.text }}>
                    {data.subjects.find(s => s.id === subjectId)?.name || 'Selecione a matéria'}
                  </Text>
                 </TouchableOpacity>
              </View>
              <View style={isSmallScreen ? styles.columnFull : styles.column}>
                <Text style={[styles.label, { color: theme.text }]}>Assunto</Text>
                 <TouchableOpacity
                   style={getSelectStyle(theme)}
                   onPress={() => {
                     if (!subjectId) {
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
                   disabled={!subjectId}
                 >
                  <Text style={{ color: theme.text }}>
                    {availableTopics.find(t => t.id === topicId)?.name || 'Selecione o assunto'}
                  </Text>
                 </TouchableOpacity>
              </View>
            </View>

            <View style={isSmallScreen ? styles.columnStack : styles.row}>
              <View style={isSmallScreen ? styles.columnFull : styles.column}>
                <Text style={[styles.label, { color: theme.text }]}>Duração (min)</Text>
                <TextInput
                  value={duration.toString()}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  style={getInputStyle(theme)}
                />
              </View>
              <View style={isSmallScreen ? styles.columnFull : styles.column}>
                <Text style={[styles.label, { color: theme.text }]}>Fonte / Revisão</Text>
                 <TouchableOpacity
                   style={getSelectStyle(theme)}
                   onPress={() => setShowSourceModal(true)}
                 >
                  <Text style={{ color: theme.text }}>
                    {source || 'Fonte / Revisão'}
                  </Text>
                 </TouchableOpacity>
              </View>
            </View>

            <View style={isSmallScreen ? styles.columnStack : styles.row}>
              <View style={isSmallScreen ? styles.columnFull : styles.column}>
                <Text style={[styles.label, { color: theme.text }]}>Pág. Início</Text>
                <TextInput
                  value={startPage.toString()}
                  onChangeText={setStartPage}
                  keyboardType="numeric"
                  style={getInputStyle(theme)}
                />
              </View>
              <View style={isSmallScreen ? styles.columnFull : styles.column}>
                <Text style={[styles.label, { color: theme.text }]}>Pág. Fim</Text>
                <TextInput
                  value={endPage.toString()}
                  onChangeText={setEndPage}
                  keyboardType="numeric"
                  style={getInputStyle(theme)}
                />
              </View>
            </View>

            <View style={isSmallScreen ? styles.columnStack : styles.row}>
              <View style={isSmallScreen ? styles.columnFull : styles.column}>
                <Text style={[styles.label, { color: theme.text }]}>Questões (Total)</Text>
                <TextInput
                  value={questionsTotal.toString()}
                  onChangeText={setQuestionsTotal}
                  keyboardType="numeric"
                  style={getInputStyle(theme)}
                />
              </View>
              <View style={isSmallScreen ? styles.columnFull : styles.column}>
                <Text style={[styles.label, { color: theme.text }]}>Questões (Acertos)</Text>
                <TextInput
                  value={questionsCorrect.toString()}
                  onChangeText={setQuestionsCorrect}
                  keyboardType="numeric"
                  style={getInputStyle(theme)}
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <Button variant="outline" style={getButtonStyle(theme, 'outline')} onPress={onCancel}>
                <Text style={{ color: theme.text }}>Cancelar</Text>
              </Button>
              <Button style={getButtonStyle(theme, 'primary')} onPress={handleSubmit}>
                <Text style={{ color: 'white' }}>Salvar</Text>
              </Button>
            </View>
          </ScrollView>
        </CardContent>
        </ScrollView>
        <View style={styles.buttonRow}>
          <Button variant="outline" style={getButtonStyle(theme, 'outline')} onPress={onCancel}>
            <Text style={{ color: theme.text }}>Cancelar</Text>
          </Button>
          <Button style={getButtonStyle(theme, 'primary')} onPress={handleSubmit}>
            <Text style={{ color: 'white' }}>Salvar</Text>
          </Button>
        </View>
      </Card>

      {/* Subject Selection Modal */}
      <Modal visible={showSubjectModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.selectionModal}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Selecionar Matéria</Text>
              <TouchableOpacity onPress={() => setShowSubjectModal(false)}>
                <Text style={[styles.closeButton, { color: theme.primary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              {data.subjects.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
                  Nenhuma matéria cadastrada
                </Text>
              ) : (
                <FlatList
                  data={data.subjects}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.selectionItem,
                        subjectId === item.id && styles.selectionItemSelected
                      ]}
                      onPress={() => {
                        setSubjectId(item.id);
                        setTopicId(''); // Reset topic when subject changes
                        setShowSubjectModal(false);
                      }}
                    >
                      <View style={[styles.subjectIcon, { backgroundColor: item.color + '20' }]}>
                        <Text style={{ color: item.color, fontSize: 16 }}>📚</Text>
                      </View>
                      <Text style={[styles.selectionItemText, { color: theme.text }]}>
                        {item.name}
                      </Text>
                      {subjectId === item.id && (
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
          <View style={styles.selectionModal}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Selecionar Assunto
              </Text>
              <TouchableOpacity onPress={() => setShowTopicModal(false)}>
                <Text style={[styles.closeButton, { color: theme.primary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.modalContent, styles.topicModalContent]}>
              <Text style={[styles.selectedSubjectText, { color: theme.mutedForeground }]}>
                Matéria: {data.subjects.find(s => s.id === subjectId)?.name}
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
                        topicId === item.id && styles.selectionItemSelected
                      ]}
                      onPress={() => {
                        setTopicId(item.id);
                        setShowTopicModal(false);
                      }}
                    >
                      <Text style={[styles.selectionItemText, { color: theme.text }]}>
                        {item.name}
                      </Text>
                      {topicId === item.id && (
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

      {/* Source Selection Modal */}
      <Modal visible={showSourceModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.selectionModal}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Selecionar Fonte</Text>
              <TouchableOpacity onPress={() => setShowSourceModal(false)}>
                <Text style={[styles.closeButton, { color: theme.primary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <FlatList
                data={[
                  { label: 'Site de Questões', value: 'site-questoes', icon: '🌐' },
                  { label: 'Revisão A', value: 'A', icon: '📝' },
                  { label: 'Revisão B', value: 'B', icon: '📝' },
                  { label: 'Revisão C', value: 'C', icon: '📝' },
                  { label: 'Revisão D', value: 'D', icon: '📝' },
                ]}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.selectionItem,
                      source === item.value && styles.selectionItemSelected
                    ]}
                    onPress={() => {
                      setSource(item.value);
                      setShowSourceModal(false);
                    }}
                  >
                    <Text style={[styles.sourceIcon, { color: theme.text }]}>
                      {item.icon}
                    </Text>
                    <Text style={[styles.selectionItemText, { color: theme.text }]}>
                      {item.label}
                    </Text>
                    {source === item.value && (
                      <Text style={[styles.checkmark, { color: theme.primary }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 500, // Limit width on larger screens
    width: '100%', // Take full width on small screens
  },
  card: {
    marginBottom: 0,
    borderWidth: 1,
    minHeight: 500,
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  columnStack: {
    flexDirection: 'column',
    gap: 16,
  },
  column: {
    flex: 1,
    gap: 4,
  },
  columnFull: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  select: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
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
  sourceIcon: {
    fontSize: 20,
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