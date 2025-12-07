import React, { useState } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, RefreshControl, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Swipeable } from 'react-native-gesture-handler';
import { Calendar, Clock, Target, Trash2, PlusCircle, FileClock, Edit } from 'lucide-react-native';
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
                 </View>
           </CardHeader>

         <CardContent style={styles.cardContent}>
           <View style={styles.metricsRow}>
             <View style={styles.primaryMetrics}>
               <View style={styles.metricItem}>
                 <Clock size={14} color={theme.mutedForeground} />
                 <ThemedText style={styles.metricValue}>{item.duration}min</ThemedText>
               </View>

               {item.questionsTotal > 0 && (
                 <View style={styles.metricItem}>
                   <Target size={14} color={theme.mutedForeground} />
                   <ThemedText style={styles.metricValue}>
                     {item.questionsCorrect}/{item.questionsTotal}
                   </ThemedText>
                   {accuracy > 0 && (
                     <ThemedText style={[styles.accuracyBadge, {
                       backgroundColor: accuracyColor + '20',
                       color: accuracyColor
                     }]}>
                       {accuracy.toFixed(0)}%
                     </ThemedText>
                   )}
                 </View>
               )}
             </View>

             <View style={styles.secondaryMetrics}>
               <ThemedText style={styles.sourceText}>
                 {getSourceDisplayName(item.source)}
               </ThemedText>
               {pagesRead > 0 && (
                 <ThemedText style={styles.pagesText}>
                   {pagesRead} página{pagesRead !== 1 ? 's' : ''}
                 </ThemedText>
               )}
             </View>
           </View>
         </CardContent>
        </Card>
      </Swipeable>
    );
  };

   // Calculate overall history stats
   const overallStats = React.useMemo(() => {
     const logs = data.studyLog || [];
     const totalSessions = logs.length;
     const totalMinutes = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
     const avgMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

     return { sessions: totalSessions, totalMinutes, avgMinutes };
   }, [data.studyLog]);

   return (
     <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
       <ThemedView style={styles.header}>
         {/* Header Principal */}
         <View style={styles.headerMain}>
           <View style={styles.titleSection}>
             <FileClock size={20} color={theme.primary} />
             <View style={styles.titleContainer}>
               <ThemedText style={styles.mainTitle}>Histórico</ThemedText>
               <ThemedText style={styles.subtitle}>Suas sessões de estudo</ThemedText>
             </View>
           </View>

           {/* Estatísticas Gerais */}
           <View style={styles.statsOverview}>
             <View style={[styles.statBadge, { backgroundColor: theme.primaryContainer }]}>
               <Clock size={14} color={theme.onPrimaryContainer} />
               <ThemedText style={[styles.statText, { color: theme.onPrimaryContainer }]}>
                 {overallStats.sessions}
               </ThemedText>
             </View>
             <ThemedText style={styles.statsLabel}>Sessões</ThemedText>
           </View>
         </View>

         {/* Filtros Otimizados */}
         <View style={styles.filtersSection}>
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

         {/* Botão de Ação */}
         <View style={styles.actionSection}>
           <Button
             onPress={handleAddNew}
             style={styles.addButton}
             accessibilityLabel="Registrar nova sessão de estudo"
           >
             <PlusCircle size={16} color="white" />
             <ThemedText style={styles.addButtonText}>Registrar Sessão</ThemedText>
           </Button>
         </View>
       </ThemedView>

        <View style={styles.listContainer}>
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
                <View style={[styles.emptyIconContainer, { backgroundColor: theme.primary + '10' }]}>
                  <FileClock size={56} color={theme.primary} />
                </View>
                <ThemedText style={styles.emptyTitle}>
                  {selectedSubject ? 'Nenhum registro encontrado' : 'Seu histórico aparecerá aqui'}
                </ThemedText>
                <ThemedText style={styles.emptyDesc}>
                  {selectedSubject
                    ? "Nenhum registro para esta matéria. Tente alterar o filtro ou registre uma nova sessão."
                    : "Registre suas sessões de estudo para acompanhar seu progresso e revisar seu aprendizado."
                  }
                </ThemedText>
                <Button
                  style={{ marginTop: 20 }}
                  onPress={handleAddNew}
                  accessibilityLabel="Registrar primeira sessão de estudo"
                >
                  <PlusCircle size={16} color="white" style={{ marginRight: 8 }} />
                  <ThemedText style={{ color: 'white', fontWeight: '600' }}>
                    Registrar Sessão
                  </ThemedText>
                </Button>
              </View>
            }
          />
        </View>


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
     paddingBottom: 16,
     gap: 16,
   },
   headerMain: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'flex-start',
   },
   titleSection: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 8,
     flex: 1,
   },
   titleContainer: {
     flex: 1,
   },
   mainTitle: {
     fontSize: 22,
     fontWeight: '600',
     marginBottom: 2,
   },
   subtitle: {
     fontSize: 14,
     opacity: 0.7,
     fontWeight: '400'
   },
   statsOverview: {
     alignItems: 'center',
     gap: 4,
   },
   statBadge: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 4,
     paddingHorizontal: 8,
     paddingVertical: 4,
     borderRadius: 12,
   },
   statText: {
     fontSize: 12,
     fontWeight: '600',
   },
   statsLabel: {
     fontSize: 11,
     opacity: 0.6,
     fontWeight: '400',
   },
   filtersSection: {
     height: 40,
   },
   actionSection: {
     alignItems: 'flex-start',
   },
   actionButtonsRow: {
     flexDirection: 'row',
     gap: 8,
     alignItems: 'center',
   },
   settingsButton: {
     width: 44,
     height: 44,
     borderRadius: 22,
     borderWidth: 1,
     alignItems: 'center',
     justifyContent: 'center',
     backgroundColor: 'transparent',
   },
   addButton: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 6,
     paddingHorizontal: 16,
     paddingVertical: 10,
   },
   addButtonText: {
     color: 'white',
     fontSize: 14,
     fontWeight: '600',
   },
   listContent: {
     padding: 16,
   },
   listContainer: {
     flex: 1,
   },
   card: {
     marginBottom: 12,
     overflow: 'hidden',
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.08,
     shadowRadius: 3,
     elevation: 2,
   },
   cardHeader: {
     padding: 12,
     paddingBottom: 8,
   },
   cardContent: {
     paddingTop: 0,
     paddingHorizontal: 12,
     paddingBottom: 12,
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
     gap: 8,
   },
   actionButton: {
     width: 36,
     height: 36,
     borderRadius: 18,
     alignItems: 'center',
     justifyContent: 'center',
   },
   metricsRow: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
   },
   primaryMetrics: {
     flexDirection: 'row',
     gap: 16,
   },
   metricItem: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 6,
   },
   metricValue: {
     fontSize: 14,
     fontWeight: '500',
     opacity: 0.9,
   },
   accuracyBadge: {
     fontSize: 11,
     fontWeight: '600',
     paddingHorizontal: 6,
     paddingVertical: 2,
     borderRadius: 8,
     marginLeft: 4,
   },
   secondaryMetrics: {
     alignItems: 'flex-end',
     gap: 2,
   },
   sourceText: {
     fontSize: 12,
     opacity: 0.7,
     fontWeight: '500',
   },
   pagesText: {
     fontSize: 11,
     opacity: 0.6,
   },
   emptyState: {
     flex: 1,
     alignItems: 'center',
     justifyContent: 'center',
     padding: 40,
     gap: 16,
   },
   emptyIconContainer: {
     padding: 20,
     borderRadius: 32,
   },
   emptyTitle: {
     fontSize: 18,
     fontWeight: '600',
     textAlign: 'center',
     marginBottom: 4,
   },
   emptyDesc: {
     textAlign: 'center',
     fontSize: 14,
     opacity: 0.7,
     lineHeight: 20,
     maxWidth: 300,
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