import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, Alert } from 'react-native';
import { useStudy } from '@/contexts/study-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import StudyLogModal from '@/components/study-log-modal';
import { format, parseISO } from 'date-fns';

export default function HistoryScreen() {
  const { data, dispatch } = useStudy();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeTextColor = isDark ? '#FFF' : '#000';
  const subTextColor = isDark ? '#AAA' : '#666';

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);

  const getSubjectName = (id: string) => data.subjects.find(s => s.id === id)?.name || 'N/A';
  const getSubjectColor = (id: string) => data.subjects.find(s => s.id === id)?.color || '#ccc';
  const getTopicName = (subjectId: string, topicId: string) => data.subjects.find(s => s.id === subjectId)?.topics.find(t => t.id === topicId)?.name || 'N/A';

  const getSourceDisplayName = (source?: string) => {
      if (!source || source === 'site-questoes') return 'Questões';
      if (['A', 'B', 'C', 'D'].includes(source)) return `Rev. ${source}`;
      return source;
  }

  const handleAddNew = () => {
      setEditingLog(null);
      setIsLogModalOpen(true);
  }

  const handleEdit = (log: any) => {
      setEditingLog(log);
      setIsLogModalOpen(true);
  }

  const handleDelete = (logId: string) => {
      Alert.alert(
          "Remover Registro",
          "Tem certeza que deseja apagar este registro?",
          [
              { text: "Cancelar", style: "cancel" },
              {
                  text: "Apagar",
                  style: "destructive",
                  onPress: () => dispatch({ type: 'DELETE_STUDY_LOG', payload: logId })
              }
          ]
      );
  }

  const renderItem = ({ item: log }: { item: any }) => {
    const pagesRead = log.endPage > 0 ? log.endPage - log.startPage + 1 : 0;
    const accuracy = log.questionsTotal > 0 ? (log.questionsCorrect / log.questionsTotal) * 100 : 0;

    return (
      <Card style={[styles.card, { borderLeftColor: getSubjectColor(log.subjectId) }]}>
          <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                  <Text style={[styles.subjectName, { color: themeTextColor }]}>{getSubjectName(log.subjectId)}</Text>
                  <Text style={[styles.topicName, { color: subTextColor }]}>{getTopicName(log.subjectId, log.topicId)}</Text>
                  <Text style={[styles.date, { color: subTextColor }]}>
                      {format(parseISO(log.date), "dd/MM/yyyy 'às' HH:mm")}
                  </Text>
              </View>
              <View style={styles.actions}>
                  <Pressable onPress={() => handleEdit(log)} style={styles.actionButton}>
                      <Ionicons name="pencil" size={20} color={themeTextColor} />
                  </Pressable>
                  <Pressable onPress={() => handleDelete(log.id)} style={styles.actionButton}>
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </Pressable>
              </View>
          </View>

          <View style={styles.statsGrid}>
              <View style={[styles.statItem, { backgroundColor: isDark ? '#333' : '#F2F2F7' }]}>
                  <Text style={[styles.statLabel, { color: subTextColor }]}>Fonte</Text>
                  <Text style={[styles.statValue, { color: themeTextColor }]}>{getSourceDisplayName(log.source)}</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: isDark ? '#333' : '#F2F2F7' }]}>
                  <Text style={[styles.statLabel, { color: subTextColor }]}>Tempo</Text>
                  <Text style={[styles.statValue, { color: themeTextColor }]}>{log.duration} min</Text>
              </View>
               <View style={[styles.statItem, { backgroundColor: isDark ? '#333' : '#F2F2F7' }]}>
                  <Text style={[styles.statLabel, { color: subTextColor }]}>Págs</Text>
                  <Text style={[styles.statValue, { color: themeTextColor }]}>{pagesRead > 0 ? pagesRead : '-'}</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: isDark ? '#333' : '#F2F2F7' }]}>
                  <Text style={[styles.statLabel, { color: subTextColor }]}>Questões</Text>
                  <Text style={[styles.statValue, { color: themeTextColor }]}>{log.questionsTotal > 0 ? `${log.questionsCorrect}/${log.questionsTotal}` : '-'}</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: isDark ? '#333' : '#F2F2F7' }]}>
                  <Text style={[styles.statLabel, { color: subTextColor }]}>Acertos</Text>
                  <Text style={[styles.statValue, { color: themeTextColor }]}>{log.questionsTotal > 0 ? `${accuracy.toFixed(0)}%` : '-'}</Text>
              </View>
          </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeTextColor }]}>Histórico</Text>
        <Pressable onPress={handleAddNew} style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
            <Ionicons name="add" size={24} color="#FFF" />
        </Pressable>
      </View>

      {data.studyLog.length === 0 ? (
           <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={64} color={subTextColor} />
                <Text style={[styles.emptyStateText, { color: subTextColor }]}>Nenhum registro encontrado</Text>
                <Text style={[styles.emptyStateSubText, { color: subTextColor }]}>Registre suas sessões de estudo para acompanhar seu progresso.</Text>
            </View>
      ) : (
          <FlatList
            data={data.studyLog}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
      )}

      <StudyLogModal
        visible={isLogModalOpen}
        onClose={() => { setIsLogModalOpen(false); setEditingLog(null); }}
        existingLog={editingLog}
      />
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
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderLeftWidth: 4,
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
  },
  subjectName: {
      fontSize: 16,
      fontWeight: 'bold',
  },
  topicName: {
      fontSize: 14,
      marginTop: 2,
  },
  date: {
      fontSize: 12,
      marginTop: 4,
  },
  actions: {
      flexDirection: 'row',
      gap: 12,
  },
  actionButton: {
      padding: 4,
  },
  statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
  },
  statItem: {
      padding: 8,
      borderRadius: 8,
      minWidth: 60,
      alignItems: 'center',
      flex: 1,
  },
  statLabel: {
      fontSize: 10,
      textTransform: 'uppercase',
      marginBottom: 2,
  },
  statValue: {
      fontSize: 12,
      fontWeight: 'bold',
  },
  emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
      paddingTop: 100,
  },
  emptyStateText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 16,
  },
  emptyStateSubText: {
      textAlign: 'center',
      marginTop: 8,
  }
});
