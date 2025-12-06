import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Target, Play, BookOpen } from 'lucide-react-native';
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
  const [customTime, setCustomTime] = useState(25); // Default to 25 minutes
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const availableTopics = subjects.find(s => s.id === selectedSubject)?.topics || [];

  const handleStartSession = () => {
    if (selectedSubject && selectedTopic) {
      const duration = useCustomTime ? customTime * 60 : undefined; // Convert to seconds
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

                // For multiple options, we'll create a custom dialog or use a different approach
                // For now, we'll just show a simple message since AlertDialog doesn't support multiple options well
                // For many options, use a different approach - render a scrollable list in the alert
                // Since AlertDialog with many buttons is not user-friendly, we'll show simple instructions
                showAlert({
                  title: 'Selecione uma matéria',
                  message: 'Por favor, use a interface da aba "Matérias" para selecionar matérias e tópicos de forma mais eficiente.',
                  variant: 'default',
                  primaryButton: {
                    text: 'OK',
                    action: () => {}
                  }
                });
              }}
              disabled={disabled}
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

                // For many options, use a different approach - render a scrollable list in the alert
                // Since AlertDialog with many buttons is not user-friendly, we'll show simple instructions
                showAlert({
                  title: 'Selecione um assunto',
                  message: 'Por favor, use a interface da aba "Matérias" para selecionar tópicos de forma mais eficiente.',
                  variant: 'default',
                  primaryButton: {
                    text: 'OK',
                    action: () => {}
                  }
                });
              }}
              disabled={disabled || !selectedSubject}
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
              onPress={() => setUseCustomTime(!useCustomTime)}
            >
              {useCustomTime && <Text style={styles.checkboxIcon}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Usar tempo personalizado</Text>
          </View>

          {useCustomTime && (
            <View style={styles.customTimeContainer}>
              <Text style={styles.label}>Tempo (minutos)</Text>
              <Input
                value={customTime.toString()}
                onChangeText={(text) => setCustomTime(Math.max(1, parseInt(text) || 1))}
                keyboardType="numeric"
                style={[styles.input, { borderColor: theme.border, backgroundColor: theme.background }]}
              />
            </View>
          )}
        </View>

        {/* Botão Iniciar */}
        <Button
          onPress={handleStartSession}
          disabled={!selectedSubject || !selectedTopic || disabled}
          style={styles.startButton}
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
});