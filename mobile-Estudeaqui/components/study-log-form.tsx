import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, FlatList, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useStudy } from '../contexts/study-context';
import { useAlert } from '../contexts/alert-context';
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
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  // State
  const [subjectId, setSubjectId] = useState(existingLog?.subjectId || initialData?.subjectId || '');
  const [topicId, setTopicId] = useState(existingLog?.topicId || initialData?.topicId || '');
  const [duration, setDuration] = useState(existingLog?.duration ? String(existingLog.duration) : initialData?.duration ? String(initialData.duration) : '');
  const [startPage, setStartPage] = useState(existingLog?.startPage ? String(existingLog.startPage) : '');
  const [endPage, setEndPage] = useState(existingLog?.endPage ? String(existingLog.endPage) : '');
  const [questionsTotal, setQuestionsTotal] = useState(existingLog?.questionsTotal ? String(existingLog.questionsTotal) : '');
  const [questionsCorrect, setQuestionsCorrect] = useState(existingLog?.questionsCorrect ? String(existingLog.questionsCorrect) : '');
  const [source, setSource] = useState(existingLog?.source || initialData?.source || '');

  // Modal States
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  
  // Search States for Modals
  const [subjectSearch, setSubjectSearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');

  // Derived Data
  const availableTopics = data.subjects.find(s => s.id === subjectId)?.topics || [];
  const currentSubject = data.subjects.find(s => s.id === subjectId);
  const currentTopic = availableTopics.find(t => t.id === topicId);

  // Filtered Lists
  const filteredSubjects = data.subjects.filter(s => 
    s.name.toLowerCase().includes(subjectSearch.toLowerCase())
  );
  const filteredTopics = availableTopics.filter(t => 
    t.name.toLowerCase().includes(topicSearch.toLowerCase())
  );

  const handleSubmit = () => {
    const numericDuration = Number(duration);
    
    if (!subjectId || !topicId || numericDuration <= 0) {
      showAlert({
        title: 'Campos obrigatórios',
        message: 'Preencha a matéria, assunto e duração.',
        variant: 'destructive',
        primaryButton: { text: 'OK', action: () => {} }
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
      dispatch({ type: 'UPDATE_STUDY_LOG', payload: { ...existingLog, ...logData } });
    } else {
      dispatch({ type: 'ADD_STUDY_LOG', payload: logData });
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave();
  };

  const Label = ({ children }: { children: string }) => (
    <Text style={[styles.label, { color: theme.text }]}>{children}</Text>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.modalContentWrapper}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>
            {existingLog ? 'Editar Registro' : 'Registrar Sessão'}
          </Text>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formContent}>
          {/* Row 1: Subject & Topic */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Label>Matéria</Label>
              <TouchableOpacity 
                style={[styles.input, { borderColor: theme.border, backgroundColor: theme.background }]}
                onPress={() => setShowSubjectModal(true)}
              >
                <Text style={{ color: currentSubject ? theme.text : theme.mutedForeground }} numberOfLines={1}>
                  {currentSubject?.name || "Selecione"}
                </Text>
                <ChevronDown size={16} color={theme.mutedForeground} />
              </TouchableOpacity>
            </View>

            <View style={styles.col}>
              <Label>Assunto</Label>
              <TouchableOpacity 
                style={[
                  styles.input, 
                  { borderColor: theme.border, backgroundColor: theme.background },
                  !subjectId && { opacity: 0.5 }
                ]}
                onPress={() => subjectId && setShowTopicModal(true)}
                disabled={!subjectId}
              >
                <Text style={{ color: currentTopic ? theme.text : theme.mutedForeground }} numberOfLines={1}>
                  {currentTopic?.name || "Selecione"}
                </Text>
                <ChevronDown size={16} color={theme.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Row 2: Duration & Source */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Label>Duração (min)</Label>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                value={duration}
                onChangeText={setDuration}
                placeholder="Ex: 50"
                placeholderTextColor={theme.mutedForeground}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.col}>
              <Label>Fonte / Revisão</Label>
              <TouchableOpacity 
                style={[styles.input, { borderColor: theme.border, backgroundColor: theme.background }]}
                onPress={() => setShowSourceModal(true)}
              >
                <Text style={{ color: source ? theme.text : theme.mutedForeground }} numberOfLines={1}>
                  {source === 'site-questoes' ? 'Site de Questões' : source ? `Revisão ${source}` : "Fonte / Revisão"}
                </Text>
                <ChevronDown size={16} color={theme.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Row 3: Pages */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Label>Pág. Início</Label>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                value={startPage}
                onChangeText={setStartPage}
                placeholder="Ex: 10"
                placeholderTextColor={theme.mutedForeground}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.col}>
              <Label>Pág. Fim</Label>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                value={endPage}
                onChangeText={setEndPage}
                placeholder="Ex: 25"
                placeholderTextColor={theme.mutedForeground}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Row 4: Questions */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Label>Questões (Total)</Label>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                value={questionsTotal}
                onChangeText={setQuestionsTotal}
                placeholder="Ex: 20"
                placeholderTextColor={theme.mutedForeground}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.col}>
              <Label>Questões (Acertos)</Label>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                value={questionsCorrect}
                onChangeText={setQuestionsCorrect}
                placeholder="Ex: 18"
                placeholderTextColor={theme.mutedForeground}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton, { borderColor: theme.border }]} 
              onPress={onCancel}
            >
              <Text style={{ color: theme.text, fontWeight: '500' }}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.text }]} 
              onPress={handleSubmit}
            >
              <Text style={{ color: theme.background, fontWeight: '500' }}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* --- MODALS --- */}
        
        {/* Subject Modal */}
        <Modal visible={showSubjectModal} animationType="slide" presentationStyle="pageSheet">
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Selecionar Matéria</Text>
              <TouchableOpacity onPress={() => setShowSubjectModal(false)}>
                <Text style={{ color: theme.primary, fontSize: 16 }}>Fechar</Text>
              </TouchableOpacity>
            </View>
            <View style={{ padding: 16 }}>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text, marginBottom: 0 }]}
                placeholder="Buscar..."
                placeholderTextColor={theme.mutedForeground}
                value={subjectSearch}
                onChangeText={setSubjectSearch}
              />
            </View>
            <FlatList
              data={filteredSubjects}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.listItem, { borderBottomColor: theme.border }]}
                  onPress={() => {
                    setSubjectId(item.id);
                    setTopicId('');
                    setSubjectSearch('');
                    setShowSubjectModal(false);
                  }}
                >
                  <Text style={{ color: theme.text, fontSize: 16 }}>{item.name}</Text>
                  {subjectId === item.id && <Check size={16} color={theme.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>

        {/* Topic Modal */}
        <Modal visible={showTopicModal} animationType="slide" presentationStyle="pageSheet">
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
             <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Selecionar Assunto</Text>
              <TouchableOpacity onPress={() => setShowTopicModal(false)}>
                <Text style={{ color: theme.primary, fontSize: 16 }}>Fechar</Text>
              </TouchableOpacity>
            </View>
            <View style={{ padding: 16 }}>
               <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text, marginBottom: 0 }]}
                placeholder="Buscar..."
                placeholderTextColor={theme.mutedForeground}
                value={topicSearch}
                onChangeText={setTopicSearch}
              />
            </View>
            <FlatList
              data={filteredTopics}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.listItem, { borderBottomColor: theme.border }]}
                  onPress={() => {
                    setTopicId(item.id);
                    setTopicSearch('');
                    setShowTopicModal(false);
                  }}
                >
                  <Text style={{ color: theme.text, fontSize: 16 }}>{item.name}</Text>
                  {topicId === item.id && <Check size={16} color={theme.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>

        {/* Source Modal */}
        <Modal visible={showSourceModal} animationType="slide" presentationStyle="pageSheet">
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
             <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Fonte / Revisão</Text>
              <TouchableOpacity onPress={() => setShowSourceModal(false)}>
                <Text style={{ color: theme.primary, fontSize: 16 }}>Fechar</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={[
                { label: 'Site de Questões', value: 'site-questoes' },
                { label: 'Revisão A', value: 'A' },
                { label: 'Revisão B', value: 'B' },
                { label: 'Revisão C', value: 'C' },
                { label: 'Revisão D', value: 'D' },
              ]}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.listItem, { borderBottomColor: theme.border }]}
                  onPress={() => {
                    setSource(item.value);
                    setShowSourceModal(false);
                  }}
                >
                  <Text style={{ color: theme.text, fontSize: 16 }}>{item.label}</Text>
                  {source === item.value && <Check size={16} color={theme.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  modalContentWrapper: {
    flex: 1, // Occupy all available space
    width: '100%',
    height: '100%',
    borderRadius: 0, 
    overflow: 'hidden',
    paddingTop: Platform.OS === 'ios' ? 40 : 0, 
  },
  container: {
    flex: 1, // The internal container fills the wrapper, respecting its width/height constraints
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  formContent: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 40, // Standard Shadcn Input height
    borderWidth: 1,
    borderRadius: 6, // Standard Shadcn Radius
    paddingHorizontal: 12,
    justifyContent: 'center',
    fontSize: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});