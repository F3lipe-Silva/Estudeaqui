import React, { useState } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, RefreshControl, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useWindowDimensions } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Calendar, Clock, BookOpen, Target, Percent, Repeat, Trash2, PlusCircle, FileClock, Edit } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import useSafeAreaInsets

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useStudy } from '../../contexts/study-context';
import { useAlert } from '../../contexts/alert-context';
import { Button } from '@/components/ui/button';
import StudyLogForm from '@/components/study-log-form'; // Assuming this component exists

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { data, dispatch } = useStudy();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets(); // Hook for safe area insets
  const { width } = useWindowDimensions();

  const [refreshing, setRefreshing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const getSubjectName = (id: string) => (data.subjects || []).find(s => s.id === id)?.name || 'N/A';
  const getTopicName = (subjectId: string, topicId: string) => {
    const subject = (data.subjects || []).find(s => s.id === subjectId);
    return (subject?.topics || []).find(t => t.id === topicId)?.name || 'N/A';
  };

  const getSourceDisplayName = (source?: string) => {
      if (!source || source === 'site-questoes') return 'Site de Questões';
      if (['A', 'B', 'C', 'D'].includes(source)) return `Revisão ${source}`;
      return source;
  };

  const filteredLogs = selectedSubject 
    ? (data.studyLog || []).filter(log => log.subjectId === selectedSubject)
    : (data.studyLog || []);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simular refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleEdit = (log: any) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setEditingLog(log);
      setIsFormOpen(true);
  };

  const handleAddNew = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setEditingLog(null);
      setIsFormOpen(true);
  };

  const handleDelete = (logId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    showAlert({
      title: "Remover Registro",
      message: "Tem certeza que deseja apagar este registro?",
      variant: 'destructive',
      primaryButton: {
        text: "Apagar",
        variant: 'destructive',
        action: () => dispatch({ type: 'DELETE_STUDY_LOG', payload: logId })
      },
      secondaryButton: {
        text: "Cancelar",
        variant: 'secondary',
        action: () => {}
      }
    });
  };

  const handleCloseForm = () => {
      setIsFormOpen(false);
      setEditingLog(null);
  };

  const renderMetric = (icon: React.ReactNode, label: string, value: string, valueColor?: string) => (
    <View style={[styles.metricContainer, { flexBasis: width > 350 ? '48%' : '100%' }]}>
      <View style={[styles.metricIcon, { backgroundColor: theme.muted }]}>
        {icon}
      </View>
      <View>
        <ThemedText style={[styles.metricValue, valueColor && { color: valueColor }]}>{value}</ThemedText>
        <ThemedText style={styles.metricLabel}>{label}</ThemedText>
      </View>
    </View>
  );

  const renderRightActions = (item: any) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity onPress={() => handleEdit(item)} style={[styles.swipeAction, { backgroundColor: theme.primary }]}>
        <Edit size={20} color="white" />
        <ThemedText style={styles.swipeActionText}>Editar</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.swipeAction, { backgroundColor: theme.destructive }]}>
        <Trash2 size={20} color="white" />
        <ThemedText style={styles.swipeActionText}>Deletar</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderLogItem = ({ item }: { item: any }) => {
    const pagesRead = item.endPage > 0 ? item.endPage - item.startPage + 1 : 0;
    const accuracy = item.questionsTotal > 0 ? (item.questionsCorrect / item.questionsTotal) * 100 : 0;
    const accuracyColor = accuracy >= 80 ? '#22c55e' : accuracy >= 50 ? '#f59e0b' : '#ef4444'; // Verde, amarelo ou vermelho

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <Card style={styles.card}>
          <CardHeader style={styles.cardHeader}>
              <CardTitle style={{ fontSize: 18, marginBottom: 4 }}>{getSubjectName(item.subjectId)}</CardTitle>
              <CardDescription style={styles.topicName}>{getTopicName(item.subjectId, item.topicId)}</CardDescription>

              <View style={styles.metadataRow}>
                  <View style={styles.dateBadge}>
                      <Calendar size={12} color={theme.mutedForeground} />
                      <ThemedText style={styles.dateText}>
                        {format(parseISO(item.date), "dd/MM/yyyy 'às' HH:mm")}
                      </ThemedText>
                  </View>

                  <View style={styles.actionButtons}>
                  <TouchableOpacity onPress={() => handleEdit(item)} hitSlop={{top: 16, bottom: 16, left: 16, right: 16}} accessibilityLabel="Editar registro">
                    <Edit size={18} color={theme.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={{top: 16, bottom: 16, left: 16, right: 16}} accessibilityLabel="Deletar registro">
                    <Trash2 size={18} color={theme.destructive} />
                  </TouchableOpacity>
                  </View>
              </View>
          </CardHeader>

        <CardContent>
            <View style={[styles.metricsGrid, { flexDirection: 'row' }]}>
                  {renderMetric(
                      <Repeat size={14} color={theme.primary} />,
                      "FONTE",
                      getSourceDisplayName(item.source),
                      theme.primary
                  )}
                  {renderMetric(
                      <Clock size={14} color={theme.primary} />,
                      "DURAÇÃO",
                      `${item.duration} min`,
                      theme.primary
                  )}
                  {renderMetric(
                      <BookOpen size={14} color={theme.primary} />,
                      "LEITURA",
                      pagesRead > 0 ? `${pagesRead} pág.` : "N/A",
                      theme.primary
                  )}
                  {renderMetric(
                      <Target size={14} color={theme.primary} />,
                      "QUESTÕES",
                      item.questionsTotal > 0 ? `${item.questionsCorrect}/${item.questionsTotal}` : "N/A",
                      theme.primary
                  )}
                  {renderMetric(
                      <Percent size={14} color={accuracyColor} />,
                      "ACERTOS",
                      item.questionsTotal > 0 ? `${accuracy.toFixed(0)}%` : "N/A",
                      accuracyColor
                  )}
              </View>
          </CardContent>
        </Card>
      </Swipeable>
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.header}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
          <View>
            <ThemedText style={styles.headerTitle}>Histórico de Estudos</ThemedText>
            <ThemedText style={styles.subtitle}>Visualize e registre suas sessões</ThemedText>
          </View>
           {width > 480 ? (
             <Button size="sm" onPress={handleAddNew} accessibilityLabel="Adicionar novo registro">
               <PlusCircle size={16} color="white" />
               <ThemedText style={{ color: 'white', marginLeft: 4 }}>Novo Registro</ThemedText>
             </Button>
           ) : (
             <Button size="sm" onPress={handleAddNew} accessibilityLabel="Registrar sessão de estudo">
               <PlusCircle size={16} color="white" />
               <ThemedText style={{ color: 'white', marginLeft: 4 }}>Registrar Sessão</ThemedText>
             </Button>
           )}
        </View>

        {/* Filters */}
        <View style={{ height: 40 }}>
            <FlatList
                horizontal
                data={[{id: 'all', name: 'Todas'}, ...(data.subjects || [])]}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingRight: 20 }}
                renderItem={({ item }) => {
                    const isActive = item.id === 'all' ? selectedSubject === null : selectedSubject === item.id;
                    return (
                         <TouchableOpacity
                             onPress={() => {
                               Haptics.selectionAsync();
                               setSelectedSubject(item.id === 'all' ? null : item.id);
                             }}
                             accessibilityLabel={`Filtrar por ${item.name}`}
                             style={[
                                styles.filterChip,
                                isActive && { backgroundColor: theme.primary, borderColor: theme.primary }
                            ]}
                        >
                            <ThemedText style={[
                                styles.filterChipText,
                                isActive && { color: 'white', fontWeight: '600' }
                            ]}>
                                {item.name}
                            </ThemedText>
                        </TouchableOpacity>
                    )
                }}
            />
        </View>
      </ThemedView>

      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderLogItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FileClock size={48} color={theme.mutedForeground} style={{ marginBottom: 16 }} />
            <ThemedText style={styles.emptyTitle}>Nenhum registro encontrado</ThemedText>
            <ThemedText style={styles.emptyDesc}>
              {selectedSubject ? "Nenhum registro para esta matéria." : "Comece registrando suas sessões de estudo para acompanhar seu progresso."}
            </ThemedText>
            {!selectedSubject && (
                <Button style={{ marginTop: 16 }} onPress={handleAddNew}>
                <PlusCircle size={16} color="white" style={{ marginRight: 8 }} />
                Registrar Estudo
                </Button>
            )}
          </View>
        }
      />


       {/* Formulário de edição/criação */}
        <Modal
          visible={isFormOpen}
          animationType="slide"
          transparent
        >
          <KeyboardAvoidingView
            style={styles.formOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={[styles.formContainer, { backgroundColor: theme.background }]}>
              <StudyLogForm
                onSave={handleCloseForm}
                onCancel={handleCloseForm}
                existingLog={editingLog}
              />
            </View>
          </KeyboardAvoidingView>
        </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  topicName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 13,
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 12,
    borderRadius: 12,
    flexBasis: '100%', // Single column for better mobile readability
    marginBottom: 6,
  },
  metricIcon: {
    padding: 8,
    borderRadius: 8,
    marginTop: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 11,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDesc: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 16,
  },
  formOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  formContainer: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  formHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  formContent: {
    padding: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    opacity: 0.8,
  },
  swipeActions: {
    flexDirection: 'row',
    width: 160,
  },
  swipeAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  swipeActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
});