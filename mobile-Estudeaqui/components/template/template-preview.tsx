import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { SubjectTemplate } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface TemplatePreviewProps {
  template: SubjectTemplate;
  onApply?: () => void;
  showApplyButton?: boolean;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onApply,
  showApplyButton = false
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const totalTopics = template.subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
  const totalStudyTime = template.subjects.reduce((sum, subject) => sum + (subject.studyDuration || 0), 0);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.headerCard}>
          <ThemedText style={styles.templateName}>{template.name}</ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{template.subjects.length}</ThemedText>
              <ThemedText style={styles.statLabel}>Matérias</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{totalTopics}</ThemedText>
              <ThemedText style={styles.statLabel}>Tópicos</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{totalStudyTime}min</ThemedText>
              <ThemedText style={styles.statLabel}>Tempo Total</ThemedText>
            </View>
          </View>
        </Card>

        <ThemedText style={styles.sectionTitle}>Matérias e Tópicos</ThemedText>
        
        {template.subjects.map((subject, subjectIndex) => (
          <Card key={subjectIndex} style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <View style={[styles.colorIndicator, { backgroundColor: subject.color }]} />
              <ThemedText style={styles.subjectName}>{subject.name}</ThemedText>
              {subject.studyDuration && (
                <ThemedText style={styles.duration}>{subject.studyDuration}min</ThemedText>
              )}
            </View>
            
            {subject.description && (
              <ThemedText style={styles.description}>{subject.description}</ThemedText>
            )}

            {subject.topics.length > 0 && (
              <View style={styles.topicsContainer}>
                <ThemedText style={styles.topicsTitle}>Tópicos ({subject.topics.length}):</ThemedText>
                {subject.topics.map((topic, topicIndex) => (
                  <View key={topicIndex} style={styles.topicItem}>
                    <ThemedText style={styles.topicOrder}>{topicIndex + 1}.</ThemedText>
                    <ThemedText style={styles.topicName}>{topic.name}</ThemedText>
                  </View>
                ))}
              </View>
            )}

            {subject.topics.length === 0 && (
              <ThemedText style={styles.noTopics}>Nenhum tópico definido</ThemedText>
            )}
          </Card>
        ))}

        {template.subjects.length === 0 && (
          <Card style={styles.emptyCard}>
            <ThemedText style={styles.emptyText}>Nenhuma matéria definida neste template</ThemedText>
          </Card>
        )}
      </ScrollView>

      {showApplyButton && onApply && (
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Este template será aplicado ao seu plano de estudos
          </ThemedText>
          <Button onPress={onApply} style={styles.applyButton}>
            Aplicar Template
          </Button>
        </View>
      )}
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
  headerCard: {
    padding: 20,
    marginBottom: 24,
  },
  templateName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  subjectCard: {
    padding: 16,
    marginBottom: 12,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  duration: {
    fontSize: 14,
    opacity: 0.7,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 20,
  },
  topicsContainer: {
    marginTop: 12,
  },
  topicsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  topicOrder: {
    fontSize: 14,
    opacity: 0.5,
    marginRight: 8,
    width: 20,
  },
  topicName: {
    fontSize: 14,
    flex: 1,
  },
  noTopics: {
    fontSize: 14,
    opacity: 0.5,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 12,
  },
  applyButton: {
    // Button styles will be applied from the Button component
  },
});