import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, ScrollView, Alert, Pressable, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useStudy } from '@/contexts/study-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import type { StudyLogEntry } from '@/lib/types';

interface StudyLogModalProps {
  visible: boolean;
  onClose: () => void;
  initialData?: { subjectId?: string; topicId?: string; sequenceItemIndex?: number; duration?: number; source?: string };
  existingLog?: StudyLogEntry;
}

export default function StudyLogModal({ visible, onClose, initialData, existingLog }: StudyLogModalProps) {
  const { data, dispatch } = useStudy();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [duration, setDuration] = useState('');
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [questionsTotal, setQuestionsTotal] = useState('');
  const [questionsCorrect, setQuestionsCorrect] = useState('');
  const [source, setSource] = useState('');

  const [hasUserModified, setHasUserModified] = useState({
    subjectId: false,
    topicId: false,
    duration: false,
    startPage: false,
    endPage: false,
    questionsTotal: false,
    questionsCorrect: false,
    source: false
  });

  const availableTopics = data.subjects.find(s => s.id === subjectId)?.topics || [];

  useEffect(() => {
    if (visible) {
      if (existingLog) {
         if (!hasUserModified.subjectId) setSubjectId(existingLog.subjectId);
        if (!hasUserModified.topicId) setTopicId(existingLog.topicId);
        if (!hasUserModified.duration) setDuration(String(existingLog.duration));
        if (!hasUserModified.startPage) setStartPage(existingLog.startPage ? String(existingLog.startPage) : '');
        if (!hasUserModified.endPage) setEndPage(existingLog.endPage ? String(existingLog.endPage) : '');
        if (!hasUserModified.questionsTotal) setQuestionsTotal(existingLog.questionsTotal ? String(existingLog.questionsTotal) : '');
        if (!hasUserModified.questionsCorrect) setQuestionsCorrect(existingLog.questionsCorrect ? String(existingLog.questionsCorrect) : '');
        if (!hasUserModified.source) setSource(existingLog.source || '');
      } else if (!hasUserModified.subjectId && !hasUserModified.topicId && !hasUserModified.duration) {
        setSubjectId(initialData?.subjectId || '');
        setTopicId(initialData?.topicId || '');
        setDuration(initialData?.duration ? String(initialData.duration) : '');
        setStartPage('');
        setEndPage('');
        setQuestionsTotal('');
        setQuestionsCorrect('');
        setSource(initialData?.source || '');
      }
    }
  }, [visible, existingLog, initialData, hasUserModified]);

  const handleSubmit = () => {
    const numericDuration = Number(duration);
    if (!subjectId || !topicId || numericDuration <= 0) {
      Alert.alert('Erro', 'Preencha pelo menos a matéria, assunto e duração.');
      return;
    }

    const logData = {
      subjectId,
      topicId,
      duration: numericDuration,
      startPage: startPage ? Number(startPage) : undefined,
      endPage: endPage ? Number(endPage) : undefined,
      questionsTotal: questionsTotal ? Number(questionsTotal) : undefined,
      questionsCorrect: questionsCorrect ? Number(questionsCorrect) : undefined,
      source,
      sequenceItemIndex: initialData?.sequenceItemIndex,
    };

    if (existingLog) {
      dispatch({
        type: 'UPDATE_STUDY_LOG',
        payload: { ...existingLog, ...logData },
      });
      Alert.alert('Sucesso', 'Registro de estudo atualizado!');
    } else {
      dispatch({
        type: 'ADD_STUDY_LOG',
        payload: logData,
      });
      Alert.alert('Sucesso', 'Sessão de estudo registrada!');
    }
    onClose();
    // Reset form after close is handled by useEffect or state reset if needed
    setHasUserModified({
      subjectId: false,
      topicId: false,
      duration: false,
      startPage: false,
      endPage: false,
      questionsTotal: false,
      questionsCorrect: false,
      source: false
    });
  };

  const themeTextColor = isDark ? '#FFF' : '#000';
  const themeBackgroundColor = isDark ? '#121212' : '#F2F2F7';
  const themeCardColor = isDark ? '#1E1E1E' : '#FFF';
  const themeBorderColor = isDark ? '#333' : '#E5E5E5';

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: themeCardColor }]}>
          <View style={styles.header}>
             <Text style={[styles.modalTitle, { color: themeTextColor }]}>{existingLog ? 'Editar Sessão' : 'Registrar Sessão'}</Text>
             <Pressable onPress={onClose}>
                <Ionicons name="close" size={24} color={themeTextColor} />
             </Pressable>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeTextColor }]}>Matéria</Text>
              <View style={[styles.pickerContainer, { borderColor: themeBorderColor }]}>
                <Picker
                  selectedValue={subjectId}
                  style={{ color: themeTextColor }}
                  onValueChange={(itemValue) => {
                    setSubjectId(itemValue);
                    setHasUserModified(prev => ({ ...prev, subjectId: true }));
                    // Reset topic when subject changes
                     setTopicId('');
                  }}
                >
                  <Picker.Item label="Selecione a matéria" value="" color={isDark ? '#888' : '#888'} />
                  {data.subjects.map(subject => (
                    <Picker.Item key={subject.id} label={subject.name} value={subject.id} color={themeTextColor} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeTextColor }]}>Assunto</Text>
              <View style={[styles.pickerContainer, { borderColor: themeBorderColor }]}>
                <Picker
                  selectedValue={topicId}
                   style={{ color: themeTextColor }}
                  onValueChange={(itemValue) => {
                    setTopicId(itemValue);
                    setHasUserModified(prev => ({ ...prev, topicId: true }));
                  }}
                  enabled={!!subjectId}
                >
                  <Picker.Item label="Selecione o assunto" value="" color={isDark ? '#888' : '#888'} />
                  {availableTopics.map(topic => (
                    <Picker.Item key={topic.id} label={topic.name} value={topic.id} color={themeTextColor} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={[styles.label, { color: themeTextColor }]}>Duração (min)</Text>
                    <TextInput
                        style={[styles.input, { color: themeTextColor, borderColor: themeBorderColor }]}
                        onChangeText={(text) => {
                            setDuration(text);
                            setHasUserModified(prev => ({ ...prev, duration: true }));
                        }}
                        value={duration}
                        placeholder="Ex: 50"
                        placeholderTextColor={isDark ? '#666' : '#999'}
                        keyboardType="numeric"
                    />
                </View>
                 <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={[styles.label, { color: themeTextColor }]}>Fonte / Revisão</Text>
                     <View style={[styles.pickerContainer, { borderColor: themeBorderColor, height: 44, justifyContent: 'center' }]}>
                         <Picker
                            selectedValue={source}
                             style={{ color: themeTextColor, height: 44 }}
                            onValueChange={(itemValue) => {
                                setSource(itemValue);
                                setHasUserModified(prev => ({ ...prev, source: true }));
                            }}
                        >
                            <Picker.Item label="Selecione" value="" color={isDark ? '#888' : '#888'} />
                            <Picker.Item label="Site de Questões" value="site-questoes" color={themeTextColor} />
                            <Picker.Item label="Revisão A" value="A" color={themeTextColor} />
                            <Picker.Item label="Revisão B" value="B" color={themeTextColor} />
                            <Picker.Item label="Revisão C" value="C" color={themeTextColor} />
                            <Picker.Item label="Revisão D" value="D" color={themeTextColor} />
                        </Picker>
                    </View>
                </View>
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={[styles.label, { color: themeTextColor }]}>Pág. Início</Text>
                    <TextInput
                        style={[styles.input, { color: themeTextColor, borderColor: themeBorderColor }]}
                        onChangeText={(text) => {
                            setStartPage(text);
                             setHasUserModified(prev => ({ ...prev, startPage: true }));
                        }}
                        value={startPage}
                         placeholderTextColor={isDark ? '#666' : '#999'}
                        keyboardType="numeric"
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={[styles.label, { color: themeTextColor }]}>Pág. Fim</Text>
                    <TextInput
                        style={[styles.input, { color: themeTextColor, borderColor: themeBorderColor }]}
                        onChangeText={(text) => {
                            setEndPage(text);
                            setHasUserModified(prev => ({ ...prev, endPage: true }));
                        }}
                        value={endPage}
                         placeholderTextColor={isDark ? '#666' : '#999'}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={[styles.label, { color: themeTextColor }]}>Questões (Total)</Text>
                    <TextInput
                        style={[styles.input, { color: themeTextColor, borderColor: themeBorderColor }]}
                        onChangeText={(text) => {
                            setQuestionsTotal(text);
                            setHasUserModified(prev => ({ ...prev, questionsTotal: true }));
                        }}
                        value={questionsTotal}
                         placeholderTextColor={isDark ? '#666' : '#999'}
                        keyboardType="numeric"
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={[styles.label, { color: themeTextColor }]}>Acertos</Text>
                    <TextInput
                        style={[styles.input, { color: themeTextColor, borderColor: themeBorderColor }]}
                        onChangeText={(text) => {
                            setQuestionsCorrect(text);
                            setHasUserModified(prev => ({ ...prev, questionsCorrect: true }));
                        }}
                        value={questionsCorrect}
                         placeholderTextColor={isDark ? '#666' : '#999'}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <Pressable style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]} onPress={handleSubmit}>
              <Text style={styles.textStyle}>Salvar</Text>
            </Pressable>
             <Pressable style={[styles.button, styles.buttonCancel]} onPress={onClose}>
              <Text style={[styles.textStyle, { color: themeTextColor }]}>Cancelar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
  },
  scrollView: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 12,
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  pickerContainer: {
      borderWidth: 1,
      borderRadius: 8,
      overflow: 'hidden', // Required for borderRadius on some platforms
  },
  button: {
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonCancel: {
      backgroundColor: 'transparent',
      marginTop: 8,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
