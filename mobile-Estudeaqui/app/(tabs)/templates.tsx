import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { TemplateSelector, TemplateForm, TemplatePreview } from '@/components/template';
import { SubjectTemplate, Subject } from '@/types';
import { useStudyContext } from '@/contexts/study-context';

type ViewMode = 'list' | 'form' | 'preview';

export default function TemplatesScreen() {
  const { data, dispatch } = useStudyContext();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<SubjectTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<SubjectTemplate | undefined>();

  const handleCreateNew = () => {
    setEditingTemplate(undefined);
    setViewMode('form');
  };

  const handleSelectTemplate = (template: SubjectTemplate) => {
    setSelectedTemplate(template);
    setViewMode('preview');
  };

  const handleEditTemplate = (template: SubjectTemplate) => {
    setEditingTemplate(template);
    setViewMode('form');
  };

  const handleSaveTemplate = (template: SubjectTemplate) => {
    try {
      if (editingTemplate) {
        // Update existing template
        dispatch({
          type: 'UPDATE_TEMPLATE',
          payload: template
        });
        Alert.alert('Sucesso', 'Template atualizado com sucesso!');
      } else {
        // Create new template
        dispatch({
          type: 'ADD_TEMPLATE',
          payload: template
        });
        Alert.alert('Sucesso', 'Template criado com sucesso!');
      }
      setViewMode('list');
      setEditingTemplate(undefined);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o template');
    }
  };

  handleApplyTemplate = () => {
    if (!selectedTemplate) return;

    try {
      // Convert template to subjects
      const newSubjects: Subject[] = selectedTemplate.subjects.map(subject => ({
        ...subject,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        topics: subject.topics.map((topic, index) => ({
          ...topic,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + index,
          subjectId: '', // Will be set after subject creation
          isCompleted: false
        }))
      }));

      // Set subjectId for each topic
      newSubjects.forEach(subject => {
        subject.topics.forEach(topic => {
          topic.subjectId = subject.id;
        });
      });

      // Add subjects to the study data
      newSubjects.forEach(subject => {
        dispatch({
          type: 'ADD_SUBJECT',
          payload: subject
        });
      });

      Alert.alert('Sucesso', 'Template aplicado com sucesso!');
      setViewMode('list');
      setSelectedTemplate(null);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível aplicar o template');
    }
  };

  const handleDeleteTemplate = (template: SubjectTemplate) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o template "${template.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            dispatch({
              type: 'DELETE_TEMPLATE',
              payload: template.id
            });
            Alert.alert('Sucesso', 'Template excluído com sucesso!');
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingTemplate(undefined);
    setSelectedTemplate(null);
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'form':
        return (
          <TemplateForm
            initialTemplate={editingTemplate}
            onSave={handleSaveTemplate}
            onCancel={handleCancel}
          />
        );

      case 'preview':
        return selectedTemplate ? (
          <TemplatePreview
            template={selectedTemplate}
            onApply={handleApplyTemplate}
            showApplyButton={true}
          />
        ) : null;

      default:
        return (
          <View style={styles.listContainer}>
            <View style={styles.header}>
              <ThemedText style={styles.title}>Templates</ThemedText>
              <Button onPress={handleCreateNew} style={styles.createButton}>
                Novo Template
              </Button>
            </View>

            <TemplateSelector
              templates={data.templates}
              onSelectTemplate={handleSelectTemplate}
              onCreateNew={handleCreateNew}
              visible={viewMode === 'list'}
              onClose={() => {}}
            />
          </View>
        );
    }
  };

  return (
    <ThemedView style={styles.container}>
      {renderContent()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    marginLeft: 16,
  },
});