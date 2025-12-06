import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Settings, X, Save } from 'lucide-react-native';
import { useStudy } from '../contexts/study-context';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';

interface PomodoroSettingsDialogProps {
  visible: boolean;
  onClose: () => void;
}

export default function PomodoroSettingsDialog({ visible, onClose }: PomodoroSettingsDialogProps) {
  const { data, dispatch } = useStudy();
  const { pomodoroSettings } = data;
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const [focusDuration, setFocusDuration] = useState(25); // in minutes
  const [shortBreakDuration, setShortBreakDuration] = useState(5); // in minutes
  const [longBreakDuration, setLongBreakDuration] = useState(15); // in minutes
 const [cyclesUntilLongBreak, setCyclesUntilLongBreak] = useState(4);

  // Initialize form with current settings
 useEffect(() => {
    if (pomodoroSettings) {
      setFocusDuration(Math.round(pomodoroSettings.tasks?.[0]?.duration / 60 || 25));
      setShortBreakDuration(Math.round(pomodoroSettings.shortBreakDuration / 60 || 5));
      setLongBreakDuration(Math.round(pomodoroSettings.longBreakDuration / 60 || 15));
      setCyclesUntilLongBreak(pomodoroSettings.cyclesUntilLongBreak || 4);
    }
  }, [pomodoroSettings, visible]);

  const handleSave = () => {
    // Create a single focus task with the specified duration
    const newSettings = {
      tasks: [
        {
          id: 'task-1',
          name: 'Foco',
          duration: focusDuration * 60 // Convert to seconds
        }
      ],
      shortBreakDuration: shortBreakDuration * 60, // Convert to seconds
      longBreakDuration: longBreakDuration * 60, // Convert to seconds
      cyclesUntilLongBreak,
    };

    dispatch({
      type: 'UPDATE_POMODORO_SETTINGS',
      payload: newSettings,
    });

    onClose();
  };

  const handleCancel = () => {
    // Reset to current settings when canceling
    if (pomodoroSettings) {
      setFocusDuration(Math.round(pomodoroSettings.tasks?.[0]?.duration / 60 || 25));
      setShortBreakDuration(Math.round(pomodoroSettings.shortBreakDuration / 60 || 5));
      setLongBreakDuration(Math.round(pomodoroSettings.longBreakDuration / 60 || 15));
      setCyclesUntilLongBreak(pomodoroSettings.cyclesUntilLongBreak || 4);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.icon} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Configurações do Pomodoro</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Save size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Card style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <CardHeader>
              <CardTitle style={{ color: theme.text }}>Tempos de Sessão</CardTitle>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Tempo de Foco (minutos)</Text>
                <Input
                  value={focusDuration.toString()}
                  onChangeText={(text) => setFocusDuration(Math.max(1, parseInt(text) || 1))}
                  keyboardType="numeric"
                  style={[styles.input, { borderColor: theme.border, backgroundColor: theme.background, color: theme.text }]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Tempo de Pausa Curta (minutos)</Text>
                <Input
                  value={shortBreakDuration.toString()}
                  onChangeText={(text) => setShortBreakDuration(Math.max(1, parseInt(text) || 1))}
                  keyboardType="numeric"
                  style={[styles.input, { borderColor: theme.border, backgroundColor: theme.background, color: theme.text }]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Tempo de Pausa Longa (minutos)</Text>
                <Input
                  value={longBreakDuration.toString()}
                  onChangeText={(text) => setLongBreakDuration(Math.max(1, parseInt(text) || 1))}
                  keyboardType="numeric"
                  style={[styles.input, { borderColor: theme.border, backgroundColor: theme.background, color: theme.text }]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Ciclos até Pausa Longa</Text>
                <Input
                  value={cyclesUntilLongBreak.toString()}
                  onChangeText={(text) => setCyclesUntilLongBreak(Math.max(1, parseInt(text) || 1))}
                  keyboardType="numeric"
                  style={[styles.input, { borderColor: theme.border, backgroundColor: theme.background, color: theme.text }]}
                />
              </View>
            </CardContent>
          </Card>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 8,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 0,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardContent: {
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});