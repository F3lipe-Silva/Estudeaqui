import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native';
import { useStudy } from '@/contexts/study-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import SubjectFormModal from '@/components/subject-form-modal';
import SubjectDetailModal from '@/components/subject-detail-modal';

export default function SubjectsScreen() {
  const { data, dispatch } = useStudy();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeTextColor = isDark ? '#FFF' : '#000';
  const subTextColor = isDark ? '#AAA' : '#666';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const handleAddSubject = (subjectData: any) => {
    const newSubject = { ...subjectData, id: crypto.randomUUID() };
    dispatch({ type: 'ADD_SUBJECT', payload: newSubject });
  };

  const renderSubjectItem = ({ item }: { item: any }) => {
    const completedCount = item.topics.filter((t: any) => t.isCompleted).length;
    const totalCount = item.topics.length;

    return (
      <Pressable onPress={() => setSelectedSubject(item)}>
        <Card style={[styles.card, { borderLeftColor: item.color }]}>
          <View style={styles.cardHeader}>
             <View style={{ flex: 1 }}>
                <Text style={[styles.subjectName, { color: themeTextColor }]}>{item.name}</Text>
                <Text style={[styles.topicCount, { color: subTextColor }]}>
                  {completedCount}/{totalCount} assuntos
                </Text>
             </View>
             <Ionicons name="chevron-forward" size={20} color={subTextColor} />
          </View>
          {item.description ? (
            <Text style={[styles.description, { color: subTextColor }]} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </Card>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeTextColor }]}>Matérias</Text>
        <Pressable onPress={() => setIsFormOpen(true)} style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
            <Ionicons name="add" size={24} color="#FFF" />
        </Pressable>
      </View>

      {data.subjects.length === 0 ? (
        <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color={subTextColor} />
            <Text style={[styles.emptyStateText, { color: subTextColor }]}>Nenhuma matéria cadastrada</Text>
            <Text style={[styles.emptyStateSubText, { color: subTextColor }]}>Adicione sua primeira matéria para começar.</Text>
        </View>
      ) : (
        <FlatList
            data={data.subjects}
            keyExtractor={item => item.id}
            renderItem={renderSubjectItem}
            contentContainerStyle={styles.listContent}
        />
      )}

      <SubjectFormModal
        visible={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleAddSubject}
      />

      {selectedSubject && (
        <SubjectDetailModal
            visible={!!selectedSubject}
            onClose={() => setSelectedSubject(null)}
            subject={selectedSubject}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
  },
  listContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
  },
  card: {
      borderLeftWidth: 4,
      marginBottom: 12,
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
  },
  subjectName: {
      fontSize: 18,
      fontWeight: 'bold',
  },
  topicCount: {
      fontSize: 12,
  },
  description: {
      fontSize: 14,
      marginTop: 4,
  },
  emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
  },
  emptyStateText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 16,
  },
  emptyStateSubText: {
      fontSize: 14,
      textAlign: 'center',
      marginTop: 8,
  }
});
