import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SubjectTemplate, TopicTemplate } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface TemplateFormProps {
  initialTemplate?: SubjectTemplate;
  onSave: (template: SubjectTemplate) => void;
  onCancel: () => void;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  initialTemplate,
  onSave,
  onCancel
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const [templateName, setTemplateName] = useState(initialTemplate?.name || '');
  const [subjects, setSubjects] = useState(
    initialTemplate?.subjects || [{
      name: '',
      color: theme.primary,
      description: '',
      studyDuration: 60,
      materialUrl: '',
      revisionProgress: 0,
      topics: []
    }]
  );

  const addSubject = () => {
    setSubjects([...subjects, {
      name: '',
      color: theme.primary,
      description: '',
      studyDuration: 60,
      materialUrl: '',
      revisionProgress: 0,
      topics: []
    }]);
  };

  const updateSubject = (index: number, field: string, value: any) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
    setSubjects(updatedSubjects);
  };

  const addTopic = (subjectIndex: number) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[subjectIndex].topics.push({
      name: '',
      order: updatedSubjects[subjectIndex].topics.length,
      description: '',
      isCompleted: false
    });
    setSubjects(updatedSubjects);
  };

  const updateTopic = (subjectIndex: number, topicIndex: number, field: string, value: any) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[subjectIndex].topics[topicIndex] = {
      ...updatedSubjects[subjectIndex].topics[topicIndex],
      [field]: value
    };
    setSubjects(updatedSubjects);
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const removeTopic = (subjectIndex: number, topicIndex: number) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[subjectIndex].topics = updatedSubjects[subjectIndex].topics.filter((_, i) => i !== topicIndex);
    setSubjects(updatedSubjects);
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      Alert.alert('Erro', 'Nome do template é obrigatório');
      return;
    }

    const validSubjects = subjects.filter(subject => subject.name.trim());
    if (validSubjects.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos uma matéria');
      return;
    }

    const template: SubjectTemplate = {
      id: initialTemplate?.id || Date.now().toString(),
      name: templateName.trim(),
      subjects: validSubjects.map(subject => ({
        ...subject,
        name: subject.name.trim(),
        topics: subject.topics.filter(topic => topic.name.trim())
      }))
    };

    onSave(template);
  };

  const renderTopic = (subjectIndex: number, topic: TopicTemplate, topicIndex: number) => (
    <Card key={topicIndex} style={styles.topicCard}>
      <View style={styles.topicHeader}>
        <Input
          placeholder="Nome do tópico"
          value={topic.name}
          onChangeText={(value) => updateTopic(subjectIndex, topicIndex, 'name', value)}
          style={styles.topicInput}
        />
        <Button
          variant="outline"
          onPress={() => removeTopic(subjectIndex, topicIndex)}
          style={styles.removeButton}
        >
          Remover
        </Button>
      </View>
      <Input
        placeholder="Descrição (opcional)"
        value={topic.description || ''}
        onChangeText={(value) => updateTopic(subjectIndex, topicIndex, 'description', value)}
        multiline
        numberOfLines={2}
        style={styles.descriptionInput}
      />
    </Card>
  );

  const renderSubject = (subject: any, index: number) => (
    <Card key={index} style={styles.subjectCard}>
      <View style={styles.subjectHeader}>
        <ThemedText style={styles.subjectTitle}>Matéria {index + 1}</ThemedText>
        {subjects.length > 1 && (
          <Button
            variant="outline"
            onPress={() => removeSubject(index)}
            style={styles.removeButton}
          >
            Remover
          </Button>
        )}
      </View>

      <Input
        placeholder="Nome da matéria"
        value={subject.name}
        onChangeText={(value) => updateSubject(index, 'name', value)}
        style={styles.input}
      />

      <View style={styles.row}>
        <Input
          placeholder="Duração de estudo (min)"
          value={subject.studyDuration?.toString() || ''}
          onChangeText={(value) => updateSubject(index, 'studyDuration', parseInt(value) || 60)}
          keyboardType="numeric"
          style={[styles.input, styles.halfInput]}
        />
        <Input
          placeholder="Cor (hex)"
          value={subject.color}
          onChangeText={(value) => updateSubject(index, 'color', value)}
          style={[styles.input, styles.halfInput]}
        />
      </View>

      <Input
        placeholder="Descrição (opcional)"
        value={subject.description || ''}
        onChangeText={(value) => updateSubject(index, 'description', value)}
        multiline
        numberOfLines={2}
        style={styles.input}
      />

      <View style={styles.topicsSection}>
        <View style={styles.topicsHeader}>
          <ThemedText style={styles.topicsTitle}>Tópicos</ThemedText>
          <Button
            variant="outline"
            onPress={() => addTopic(index)}
            style={styles.addTopicButton}
          >
            Adicionar Tópico
          </Button>
        </View>

        {subject.topics.map((topic: TopicTemplate, topicIndex: number) =>
          renderTopic(index, topic, topicIndex)
        )}
      </View>
    </Card>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.title}>
          {initialTemplate ? 'Editar Template' : 'Criar Novo Template'}
        </ThemedText>

        <Input
          placeholder="Nome do Template"
          value={templateName}
          onChangeText={setTemplateName}
          style={styles.templateNameInput}
        />

        <View style={styles.subjectsSection}>
          <View style={styles.subjectsHeader}>
            <ThemedText style={styles.subjectsTitle}>Matérias</ThemedText>
            <Button onPress={addSubject} style={styles.addSubjectButton}>
              Adicionar Matéria
            </Button>
          </View>

          {subjects.map((subject, index) => renderSubject(subject, index))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          variant="outline"
          onPress={onCancel}
          style={styles.footerButton}
        >
          Cancelar
        </Button>
        <Button
          onPress={handleSave}
          style={styles.footerButton}
        >
          Salvar Template
        </Button>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  templateNameInput: {
    marginBottom: 24,
  },
  subjectsSection: {
    marginBottom: 100,
  },
  subjectsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addSubjectButton: {
    flex: 1,
    marginLeft: 16,
  },
  subjectCard: {
    marginBottom: 16,
    padding: 16,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  topicsSection: {
    marginTop: 16,
  },
  topicsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addTopicButton: {
    flex: 1,
    marginLeft: 16,
  },
  topicCard: {
    marginBottom: 8,
    padding: 12,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicInput: {
    flex: 1,
    marginRight: 12,
  },
  descriptionInput: {
    minHeight: 60,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'white',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerButton: {
    flex: 1,
  },
});