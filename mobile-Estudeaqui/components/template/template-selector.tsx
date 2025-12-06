import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SubjectTemplate } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface TemplateSelectorProps {
  templates: SubjectTemplate[];
  onSelectTemplate: (template: SubjectTemplate) => void;
  onCreateNew: () => void;
  visible: boolean;
  onClose: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  onSelectTemplate,
  onCreateNew,
  visible,
  onClose
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [selectedTemplate, setSelectedTemplate] = useState<SubjectTemplate | null>(null);

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onClose();
      setSelectedTemplate(null);
    }
  };

  const renderTemplate = ({ item }: { item: SubjectTemplate }) => (
    <TouchableOpacity
      style={[
        styles.templateCard,
        {
          borderColor: selectedTemplate?.id === item.id ? theme.primary : theme.border,
          backgroundColor: selectedTemplate?.id === item.id ? `${theme.primary}20` : theme.background
        }
      ]}
      onPress={() => setSelectedTemplate(item)}
    >
      <ThemedText style={styles.templateName}>{item.name}</ThemedText>
      <ThemedText style={styles.templateDescription}>
        {item.subjects.length} matéria{item.subjects.length !== 1 ? 's' : ''}
      </ThemedText>
      <View style={styles.topicsContainer}>
        {item.subjects.slice(0, 3).map((subject, index) => (
          <View key={index} style={styles.topicChip}>
            <ThemedText style={styles.topicText}>
              {subject.topics.length} tópicos
            </ThemedText>
          </View>
        ))}
        {item.subjects.length > 3 && (
          <View style={styles.topicChip}>
            <ThemedText style={styles.topicText}>
              +{item.subjects.length - 3}
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Selecionar Template</ThemedText>
          <TouchableOpacity onPress={onClose}>
            <ThemedText style={styles.closeButton}>✕</ThemedText>
          </TouchableOpacity>
        </View>

        <FlatList
          data={templates}
          renderItem={renderTemplate}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                Nenhum template encontrado
              </ThemedText>
              <Button onPress={onCreateNew} style={styles.createButton}>
                Criar Primeiro Template
              </Button>
            </View>
          }
        />

        <View style={styles.footer}>
          <Button
            variant="outline"
            onPress={onCreateNew}
            style={styles.footerButton}
          >
            Criar Novo Template
          </Button>
          <Button
            onPress={handleSelect}
            disabled={!selectedTemplate}
            style={[
              styles.footerButton,
              !selectedTemplate && styles.disabledButton
            ]}
          >
            Usar Template Selecionado
          </Button>
        </View>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
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
  closeButton: {
    fontSize: 24,
    fontWeight: '600',
    opacity: 0.6,
  },
  list: {
    flex: 1,
  },
  templateCard: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
  },
  templateName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  createButton: {
    marginTop: 16,
  },
  footer: {
    gap: 12,
    paddingTop: 16,
  },
  footerButton: {
    flex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
});