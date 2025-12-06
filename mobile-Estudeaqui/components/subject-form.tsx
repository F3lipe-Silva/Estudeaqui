import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useStudy } from '../contexts/study-context';
import { useAlert } from '../contexts/alert-context';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Plus, Trash2, X } from 'lucide-react-native';

interface SubjectFormProps {
  onSave: () => void;
  onCancel: () => void;
  existingSubject?: any;
}

export default function SubjectForm({ onSave, onCancel, existingSubject }: SubjectFormProps) {
  const { dispatch } = useStudy();
  const { showAlert } = useAlert();
  const [name, setName] = useState(existingSubject?.name || '');
  const [color, setColor] = useState(existingSubject?.color || '#3b82f6');
  const [studyDuration, setStudyDuration] = useState(existingSubject?.studyDuration?.toString() || '60');
  const [topics, setTopics] = useState<any[]>(existingSubject?.topics || []);
  const [newTopicName, setNewTopicName] = useState('');

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', 
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', 
    '#f43f5e', '#64748b'
  ];

  const handleAddTopic = () => {
    if (!newTopicName.trim()) return;
    
    const newTopic = {
      id: Date.now().toString(), // Temp ID
      name: newTopicName,
      order: topics.length,
      isCompleted: false,
      subjectId: existingSubject?.id || 'temp',
    };
    
    setTopics([...topics, newTopic]);
    setNewTopicName('');
  };

  const handleRemoveTopic = (index: number) => {
    const newTopics = [...topics];
    newTopics.splice(index, 1);
    setTopics(newTopics);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      showAlert({
        title: 'Erro',
        message: 'O nome da matéria é obrigatório.',
        variant: 'destructive',
        primaryButton: {
          text: 'OK',
          action: () => {}
        }
      });
      return;
    }

    const subjectData = {
      name,
      color,
      studyDuration: Number(studyDuration) || 60,
      description: '',
      materialUrl: '',
    };

    if (existingSubject) {
      // Update Subject
      dispatch({
        type: 'UPDATE_SUBJECT',
        payload: { id: existingSubject.id, data: subjectData },
      });

      // Handle Topics Sync (Naive approach: Delete all and re-add? No, too risky for completion status)
      // Better: We assume this form is for managing the Subject mostly.
      // For topics, we can try to sync them.
      // Current reducer ADD_TOPIC adds one by one.
      // Let's just save the subject data for now and handle new topics if added.

      // Identifying new topics
      const originalTopicIds = existingSubject.topics.map((t: any) => t.id);
      topics.forEach(t => {
          if (!originalTopicIds.includes(t.id)) {
              dispatch({
                  type: 'ADD_TOPIC',
                  payload: { subjectId: existingSubject.id, name: t.name, id: t.id }
              });
          }
      });

      // Identifying deleted topics
      const currentTopicIds = topics.map(t => t.id);
      existingSubject.topics.forEach((t: any) => {
          if (!currentTopicIds.includes(t.id)) {
              dispatch({
                  type: 'DELETE_TOPIC',
                  payload: { subjectId: existingSubject.id, topicId: t.id }
              });
          }
      });

      showAlert({
        title: 'Sucesso',
        message: 'Matéria atualizada!',
        variant: 'success',
        primaryButton: {
          text: 'OK',
          action: () => {}
        }
      });
    } else {
      // Create New Subject
      const newId = Date.now().toString(); // Simple ID generation
      dispatch({
        type: 'ADD_SUBJECT',
        payload: { ...subjectData, id: newId },
      });

      // Add Topics
      topics.forEach(t => {
           dispatch({
              type: 'ADD_TOPIC',
              payload: { subjectId: newId, name: t.name }
           });
      });

      showAlert({
        title: 'Sucesso',
        message: 'Matéria criada!',
        variant: 'success',
        primaryButton: {
          text: 'OK',
          action: () => {}
        }
      });
    }
    onSave();
  };

  return (
    <View style={styles.container}>
      <Card style={{...styles.card, backgroundColor: theme.background, borderColor: theme.border}}>
        <CardHeader>
          <CardTitle style={{ color: theme.text }}>
            {existingSubject ? 'Editar Matéria' : 'Nova Matéria'}
          </CardTitle>
        </CardHeader>
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Nome</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                placeholder="Ex: Direito Constitucional"
                placeholderTextColor={theme.mutedForeground}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Meta Semanal (minutos)</Text>
              <TextInput
                value={studyDuration}
                onChangeText={setStudyDuration}
                keyboardType="numeric"
                style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Cor</Text>
              <View style={styles.colorGrid}>
                {COLORS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorCircle, 
                      { backgroundColor: c },
                      color === c && styles.selectedColor
                    ]}
                    onPress={() => setColor(c)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Tópicos</Text>
              <View style={styles.addTopicRow}>
                <TextInput
                  value={newTopicName}
                  onChangeText={setNewTopicName}
                  style={[styles.input, { flex: 1, borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                  placeholder="Novo tópico..."
                  placeholderTextColor={theme.mutedForeground}
                />
                 <Button size="sm" onPress={handleAddTopic}>
                   <Plus size={16} color="white" />
                 </Button>
              </View>
              
              <View style={styles.topicsList}>
                {topics.map((topic, index) => (
                  <View key={index} style={[styles.topicItem, { backgroundColor: theme.muted }]}>
                    <Text style={[styles.topicName, { color: theme.text }]}>{topic.name}</Text>
                     <TouchableOpacity onPress={() => handleRemoveTopic(index)}>
                       <Trash2 size={14} color={theme.destructive} />
                     </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
        
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Button variant="outline" style={{ flex: 1, borderColor: theme.border }} onPress={onCancel}>
              <Text style={{ color: theme.text }}>Cancelar</Text>
            </Button>
            <Button style={{ flex: 1, backgroundColor: theme.primary }} onPress={handleSubmit}>
              <Text style={{ color: 'white' }}>Salvar</Text>
            </Button>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    maxHeight: '90%',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 0,
  },
  content: {
    padding: 12,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 15,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addTopicRow: {
    flexDirection: 'row',
    gap: 6,
  },
  topicsList: {
    marginTop: 6,
    gap: 6,
  },
  topicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
  },
  topicName: {
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
  },
});
