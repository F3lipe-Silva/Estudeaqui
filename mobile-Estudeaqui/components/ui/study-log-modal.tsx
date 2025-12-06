import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { X, Clock, BookOpen, CheckCircle } from 'lucide-react-native';
import { Button } from './button';
import { Input } from './input';
import { Card, CardContent } from './card';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useStudy } from '../../contexts/study-context';
import { useAlert } from '../../contexts/alert-context';
import type { Subject, Topic } from '../../types';

const { height: screenHeight } = Dimensions.get('window');

interface StudyLogModalProps {
  visible: boolean;
  onClose: () => void;
  initialSubjectId?: string;
  initialTopicId?: string;
}

export function StudyLogModal({
  visible,
  onClose,
  initialSubjectId,
  initialTopicId
}: StudyLogModalProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { data, dispatch } = useStudy();
  const { showAlert } = useAlert();
  
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId || '');
  const [selectedTopicId, setSelectedTopicId] = useState(initialTopicId || '');
  const [duration, setDuration] = useState('');
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [questionsTotal, setQuestionsTotal] = useState('');
  const [questionsCorrect, setQuestionsCorrect] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedSubject = data.subjects.find(s => s.id === selectedSubjectId);
  const selectedTopic = selectedSubject?.topics.find(t => t.id === selectedTopicId);

  const handleSave = async () => {
    if (!selectedSubjectId || !selectedTopicId || !duration) {
      showAlert({
        title: 'Erro',
        message: 'Preencha os campos obrigatórios',
        variant: 'destructive',
        primaryButton: {
          text: 'OK',
          action: () => {}
        }
      });
      return;
    }

    setIsLoading(true);
    try {
      const newLogEntry = {
        id: Date.now().toString(),
        subjectId: selectedSubjectId,
        topicId: selectedTopicId,
        date: new Date().toISOString(),
        duration: parseInt(duration),
        startPage: startPage ? parseInt(startPage) : 0,
        endPage: endPage ? parseInt(endPage) : parseInt(startPage) || 0,
        questionsTotal: questionsTotal ? parseInt(questionsTotal) : 0,
        questionsCorrect: questionsCorrect ? parseInt(questionsCorrect) : 0,
        source: 'manual'
      };

      dispatch({
        type: 'ADD_STUDY_LOG',
        payload: newLogEntry
      });

      showAlert({
        title: 'Sucesso',
        message: 'Sessão registrada com sucesso!',
        variant: 'success',
        primaryButton: {
          text: 'OK',
          action: () => {}
        }
      });
      handleClose();
    } catch (error) {
      showAlert({
        title: 'Erro',
        message: 'Não foi possível registrar a sessão',
        variant: 'destructive',
        primaryButton: {
          text: 'OK',
          action: () => {}
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedSubjectId(initialSubjectId || '');
    setSelectedTopicId(initialTopicId || '');
    setDuration('');
    setStartPage('');
    setEndPage('');
    setQuestionsTotal('');
    setQuestionsCorrect('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Registrar Sessão</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Matéria</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.chipsContainer}
            >
              {data.subjects.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.chip,
                    { 
                      backgroundColor: selectedSubjectId === subject.id ? subject.color : theme.card,
                      borderColor: subject.color
                    }
                  ]}
                  onPress={() => {
                    setSelectedSubjectId(subject.id);
                    setSelectedTopicId('');
                  }}
                >
                  <Text style={[
                    styles.chipText,
                    { 
                      color: selectedSubjectId === subject.id ? 'white' : theme.text,
                      fontWeight: selectedSubjectId === subject.id ? '600' : '400'
                    }
                  ]}>
                    {subject.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {selectedSubject && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Tópico</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
                contentContainerStyle={styles.chipsContainer}
              >
                {selectedSubject.topics.map((topic) => (
                  <TouchableOpacity
                    key={topic.id}
                    style={[
                      styles.chip,
                      { 
                        backgroundColor: selectedTopicId === topic.id ? selectedSubject.color : theme.card,
                        borderColor: selectedSubject.color
                      }
                    ]}
                    onPress={() => setSelectedTopicId(topic.id)}
                  >
                    <Text style={[
                      styles.chipText,
                      { 
                        color: selectedTopicId === topic.id ? 'white' : theme.text,
                        fontWeight: selectedTopicId === topic.id ? '600' : '400'
                      }
                    ]}>
                      {topic.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Duração (minutos)
            </Text>
            <Input
              value={duration}
              onChangeText={setDuration}
              placeholder="Ex: 45"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <Card style={styles.optionalCard}>
            <CardContent style={styles.optionalContent}>
              <Text style={[styles.optionalTitle, { color: theme.text }]}>
                Campos Opcionais
              </Text>
              
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={[styles.label, { color: theme.text }]}>Página Inicial</Text>
                  <Input
                    value={startPage}
                    onChangeText={setStartPage}
                    placeholder="0"
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={[styles.label, { color: theme.text }]}>Página Final</Text>
                  <Input
                    value={endPage}
                    onChangeText={setEndPage}
                    placeholder="0"
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={[styles.label, { color: theme.text }]}>Questões Totais</Text>
                  <Input
                    value={questionsTotal}
                    onChangeText={setQuestionsTotal}
                    placeholder="0"
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={[styles.label, { color: theme.text }]}>Acertos</Text>
                  <Input
                    value={questionsCorrect}
                    onChangeText={setQuestionsCorrect}
                    placeholder="0"
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
              </View>
            </CardContent>
          </Card>

          <Button
            onPress={handleSave}
            isLoading={isLoading}
            style={styles.saveButton}
          >
            Registrar Sessão
          </Button>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  horizontalScroll: {
    marginBottom: 8,
  },
  chipsContainer: {
    paddingRight: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    minWidth: 80,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 14,
  },
  input: {
    marginBottom: 0,
  },
  optionalCard: {
    marginBottom: 24,
  },
  optionalContent: {
    padding: 16,
  },
  optionalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 8,
  },
});