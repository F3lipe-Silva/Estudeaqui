import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { Target, Play, ChevronDown, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useStudy } from '../contexts/study-context';
import { useAlert } from '../contexts/alert-context';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { ThemedText } from './themed-text';

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
  const [customTime, setCustomTime] = useState('25');
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const availableTopics = subjects.find(s => s.id === selectedSubject)?.topics || [];
  const selectedSubjectData = subjects.find(s => s.id === selectedSubject);

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
            primaryButton: { text: 'OK', action: () => {} }
          });
          return;
        }
        duration = numericTime * 60;
      }
      onStartSession(selectedSubject, selectedTopic, duration);
    } else {
      showAlert({
        title: 'Erro',
        message: 'Selecione uma matéria e um assunto para iniciar a sessão.',
        variant: 'destructive',
        primaryButton: { text: 'OK', action: () => {} }
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>Nova Sessão</ThemedText>
      </View>
      
      <View style={styles.form}>
        {/* Seleção de Matéria */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Matéria</ThemedText>
          <TouchableOpacity
            style={[styles.selector, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (subjects.length === 0) {
                showAlert({
                  title: 'Nenhuma matéria',
                  message: 'Adicione matérias primeiro.',
                  variant: 'default',
                  primaryButton: { text: 'OK', action: () => {} }
                });
                return;
              }
              setShowSubjectModal(true);
            }}
            disabled={disabled}
            accessibilityLabel="Selecionar matéria"
          >
            <View style={styles.selectorContent}>
                {selectedSubjectData && (
                    <View style={[styles.colorDot, { backgroundColor: selectedSubjectData.color }]} />
                )}
                <ThemedText style={[styles.selectorValue, !selectedSubjectData && styles.placeholder]}>
                {selectedSubjectData ? selectedSubjectData.name : 'Selecione uma matéria'}
                </ThemedText>
            </View>
            <ChevronDown size={20} color={theme.icon} />
          </TouchableOpacity>
        </View>

        {/* Seleção de Assunto */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Assunto</ThemedText>
          <TouchableOpacity
            style={[styles.selector, { backgroundColor: theme.card, borderColor: theme.border }, !selectedSubject && { opacity: 0.5 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (!selectedSubject) return;
              if (availableTopics.length === 0) {
                 showAlert({
                  title: 'Nenhum assunto',
                  message: 'Esta matéria não tem assuntos cadastrados.',
                  variant: 'default',
                  primaryButton: { text: 'OK', action: () => {} }
                });
                return;
              }
              setShowTopicModal(true);
            }}
            disabled={disabled || !selectedSubject}
            accessibilityLabel="Selecionar assunto"
          >
            <ThemedText style={[styles.selectorValue, !selectedTopic && styles.placeholder]}>
              {selectedTopic ? availableTopics.find(t => t.id === selectedTopic)?.name : 'Selecione um assunto'}
            </ThemedText>
            <ChevronDown size={20} color={theme.icon} />
          </TouchableOpacity>
        </View>

        {/* Opção de tempo personalizado */}
        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => {
               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
               setUseCustomTime(!useCustomTime);
            }}
          >
            <View style={[styles.checkbox, { borderColor: theme.border }, useCustomTime && { backgroundColor: theme.tint, borderColor: theme.tint }]}>
              {useCustomTime && <Check size={12} color="white" />}
            </View>
            <ThemedText>Tempo personalizado</ThemedText>
          </TouchableOpacity>
        </View>

        {useCustomTime && (
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Minutos</ThemedText>
              <TextInput
                value={customTime}
                onChangeText={setCustomTime}
                keyboardType="numeric"
                style={[styles.textInput, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }]}
                placeholder="25"
                placeholderTextColor={theme.icon}
              />
            </View>
        )}
      </View>

      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          handleStartSession();
        }}
        disabled={!selectedSubject || !selectedTopic || disabled}
        style={[
            styles.startButton, 
            { backgroundColor: '#2563EB' },
            (!selectedSubject || !selectedTopic || disabled) && { opacity: 0.5 }
        ]}
        accessibilityLabel="Iniciar sessão pomodoro"
      >
        <Play size={20} color="white" fill="white" style={{ marginRight: 8 }} />
        <ThemedText style={styles.startButtonText}>Iniciar Foco</ThemedText>
      </TouchableOpacity>


      {/* Modals - Simplified for brevity in this response, using existing logic but cleaner styles */}
       <Modal visible={showSubjectModal} animationType="slide" transparent onRequestClose={() => setShowSubjectModal(false)}>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                <View style={styles.modalHeader}>
                    <ThemedText type="subtitle">Selecione a Matéria</ThemedText>
                    <TouchableOpacity onPress={() => setShowSubjectModal(false)} style={styles.closeButton}>
                         <ThemedText style={{fontSize: 24, color: theme.text}}>×</ThemedText>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={subjects}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={[styles.modalItem, { borderBottomColor: theme.border }]}
                            onPress={() => {
                                setSelectedSubject(item.id);
                                setSelectedTopic('');
                                setShowSubjectModal(false);
                            }}
                        >
                            <View style={[styles.colorDot, { backgroundColor: item.color, marginRight: 12 }]} />
                            <ThemedText style={{ fontSize: 16 }}>{item.name}</ThemedText>
                            {selectedSubject === item.id && <Check size={16} color={theme.tint} style={{ marginLeft: 'auto' }} />}
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
      </Modal>

      <Modal visible={showTopicModal} animationType="slide" transparent onRequestClose={() => setShowTopicModal(false)}>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                <View style={styles.modalHeader}>
                    <ThemedText type="subtitle">Selecione o Assunto</ThemedText>
                    <TouchableOpacity onPress={() => setShowTopicModal(false)} style={styles.closeButton}>
                         <ThemedText style={{fontSize: 24, color: theme.text}}>×</ThemedText>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={availableTopics}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={[styles.modalItem, { borderBottomColor: theme.border }]}
                            onPress={() => {
                                setSelectedTopic(item.id);
                                setShowTopicModal(false);
                            }}
                        >
                            <ThemedText style={{ fontSize: 16 }}>{item.name}</ThemedText>
                            {selectedTopic === item.id && <Check size={16} color={theme.tint} style={{ marginLeft: 'auto' }} />}
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  header: {
      marginBottom: 8
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 4,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectorContent: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  placeholder: {
      opacity: 0.5,
      fontWeight: '400',
  },
  colorDot: {
      width: 10, 
      height: 10, 
      borderRadius: 5, 
      marginRight: 8
  },
  checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 4,
  },
  checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
  },
  textInput: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      fontSize: 16,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 100, // Pill shape
    marginTop: 20,
    elevation: 2,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Modal Styles
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
  },
  modalContainer: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      height: '70%',
      paddingTop: 8,
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  closeButton: {
      padding: 4,
  },
  modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
  }
});