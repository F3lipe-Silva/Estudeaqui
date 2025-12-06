import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, ScrollView as RNScrollView, Modal } from 'react-native';
import { useStudy } from '@/contexts/study-context';
import { useAlert } from '@/contexts/alert-context';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';

// Componente para o formulário de registro de estudo
const CustomStudyLogForm = ({ onSave, onCancel, initialData, subjects }: any) => {
  const { dispatch, data } = useStudy();
  const { showAlert } = useAlert();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [subjectId, setSubjectId] = useState(initialData?.subjectId || '');
  const [topicId, setTopicId] = useState(initialData?.topicId || '');
  const [duration, setDuration] = useState(initialData?.duration || '');
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [questionsTotal, setQuestionsTotal] = useState('');
  const [questionsCorrect, setQuestionsCorrect] = useState('');
  const [source, setSource] = useState(initialData?.source || '');

  const availableSubjects = (data.subjects || []);
  const availableTopics = (availableSubjects.find((s: any) => s.id === subjectId)?.topics || []);

  useEffect(() => {
    if (initialData) {
      setSubjectId(initialData.subjectId || '');
      setTopicId(initialData.topicId || '');
      setDuration(initialData.duration || '');
      setSource(initialData.source || '');
    }
  }, [initialData]);

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
      source: source,
      date: new Date().toISOString(),
    };

    dispatch({
      type: 'ADD_STUDY_LOG',
      payload: logData
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
    onSave();
  };

  const getSelectStyle = () => ({
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderColor: theme.border,
    backgroundColor: theme.background,
    color: theme.text,
  });

  const getInputStyle = () => ({
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderColor: theme.border,
    backgroundColor: theme.background,
    color: theme.text,
  });

  return (
    <RNScrollView contentContainerStyle={modalContentStyles.formScrollView}>
      <View style={{ flex: 1, gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '500', color: theme.text }}>Matéria</ThemedText>
            <TouchableOpacity
              style={getSelectStyle()}
              onPress={() => {
                if (availableSubjects.length === 0) {
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

                // For many options, use a different approach - render a scrollable list in the alert
                // Since AlertDialog with many buttons is not user-friendly, we'll show simple instructions
                showAlert({
                  title: 'Selecione a matéria',
                  message: 'Por favor, vá para a aba "Matérias" para organizar suas matérias e tópicos de forma mais eficiente.',
                  variant: 'default',
                  primaryButton: {
                    text: 'OK',
                    action: () => {}
                  }
                });
              }}
            >
              <ThemedText style={{ color: theme.text }}>
                {availableSubjects.find((s: any) => s.id === subjectId)?.name || 'Selecione a matéria'}
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '500', color: theme.text }}>Assunto</ThemedText>
            <TouchableOpacity
              style={getSelectStyle()}
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

                // For many options, use a different approach - render a scrollable list in the alert
                // Since AlertDialog with many buttons is not user-friendly, we'll show simple instructions
                showAlert({
                  title: 'Selecione o assunto',
                  message: 'Esta matéria tem vários assuntos. Por favor, selecione um assunto específico na aba "Matérias".',
                  variant: 'default',
                  primaryButton: {
                    text: 'OK',
                    action: () => {}
                  }
                });
              }}
              disabled={!subjectId}
            >
              <ThemedText style={{ color: theme.text }}>
                {availableTopics.find((t: any) => t.id === topicId)?.name || 'Selecione o assunto'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '500', color: theme.text }}>Duração (min)</ThemedText>
            <TextInput
              value={duration.toString()}
              onChangeText={setDuration}
              keyboardType="numeric"
              style={getInputStyle()}
            />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '500', color: theme.text }}>Fonte</ThemedText>
            <TouchableOpacity
              style={getSelectStyle()}
              onPress={() => {
                const sources = [
                  { label: 'Manual', value: 'manual' },
                  { label: 'Pomodoro', value: 'pomodoro' },
                ];

                // This one is fine since there are only a few options
                const sourceOptions = sources.map((sourceItem) => ({
                  text: sourceItem.label,
                  action: () => {
                    setSource(sourceItem.value);
                  }
                }));

                showAlert({
                  title: 'Selecione a fonte',
                  message: '',
                  variant: 'default',
                  additionalButtons: sourceOptions.map(option => ({
                    text: option.text,
                    action: option.action,
                    variant: 'outline'
                  })),
                  secondaryButton: {
                    text: 'Cancelar',
                    variant: 'secondary',
                    action: () => {}
                  }
                });
              }}
            >
              <ThemedText style={{ color: theme.text }}>
                {source || 'Selecione a fonte'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '500', color: theme.text }}>Pág. Início</ThemedText>
            <TextInput
              value={startPage.toString()}
              onChangeText={setStartPage}
              keyboardType="numeric"
              style={getInputStyle()}
            />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '500', color: theme.text }}>Pág. Fim</ThemedText>
            <TextInput
              value={endPage.toString()}
              onChangeText={setEndPage}
              keyboardType="numeric"
              style={getInputStyle()}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '500', color: theme.text }}>Total Questões</ThemedText>
            <TextInput
              value={questionsTotal.toString()}
              onChangeText={setQuestionsTotal}
              keyboardType="numeric"
              style={getInputStyle()}
            />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: '500', color: theme.text }}>Acertos</ThemedText>
            <TextInput
              value={questionsCorrect.toString()}
              onChangeText={setQuestionsCorrect}
              keyboardType="numeric"
              style={getInputStyle()}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <Button variant="outline" onPress={onCancel} style={{ flex: 1 }}>
            <ThemedText>Cancelar</ThemedText>
          </Button>
          <Button onPress={handleSubmit} style={{ flex: 1 }}>
            <ThemedText style={{ color: 'white' }}>Salvar</ThemedText>
          </Button>
        </View>
      </View>
    </RNScrollView>
  );
};

export const StudyLogModal = ({ visible, onClose, initialSubjectId, initialTopicId }: any) => {
  const initialData = initialSubjectId && initialTopicId ? {
    subjectId: initialSubjectId,
    topicId: initialTopicId
  } : undefined;

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalContentStyles.overlay}>
        <View style={[modalContentStyles.formContainer, { backgroundColor: theme.background }]}>
          <CardHeader style={modalContentStyles.formHeader}>
            <CardTitle>Registrar Sessão</CardTitle>
          </CardHeader>
          <CardContent style={modalContentStyles.formContent}>
            <CustomStudyLogForm
              onSave={onClose}
              onCancel={onClose}
              initialData={initialData}
            />
          </CardContent>
        </View>
      </View>
    </Modal>
  );
};

const modalContentStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxHeight: '90%', // Increased max height to accommodate ScrollView
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  formHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  formContent: {
    padding: 16,
    flexGrow: 1, // Allow content to grow
  },
  formScrollView: {
    flexGrow: 1, // Allow scroll view content to grow
  }
});