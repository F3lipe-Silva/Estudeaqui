import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { Play, RotateCcw, Calendar, ArrowRight, Plus, Trash2, Edit, Clock, ArrowUp, ArrowDown, X, Save, PlusCircle, Upload, Settings, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useStudy } from '../../contexts/study-context';
import { useAlert } from '../../contexts/alert-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'expo-router';
import StudyLogForm from '@/components/study-log-form'; // Assuming this component exists

export default function PlanningScreen() {
  const { data, dispatch, startPomodoroForItem } = useStudy();
  const { showAlert } = useAlert();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets(); // Hook for safe area insets

  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSequence, setEditingSequence] = useState<any[]>([]);
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [logInitialData, setLogInitialData] = useState<any>(undefined);

  const { studySequence, sequenceIndex, subjects } = data;

  const openLogForm = (subjectId: string, itemSequenceIndex: number) => {
    setLogInitialData({ subjectId, sequenceItemIndex: itemSequenceIndex });
    setIsLogFormOpen(true);
  };

  // Inicializar a sequência de edição quando a sequência principal muda
  useEffect(() => {
    if (studySequence) {
      setEditingSequence([...studySequence.sequence]);
    }
  }, [studySequence]);

  const handleStart = (subjectId: string, index: number) => {
      const subject = subjects.find(s => s.id === subjectId);
      if (subject && subject.topics.length > 0) {
          // Pega o primeiro tópico não concluído ou o primeiro geral
          const nextTopic = subject.topics.find(t => !t.isCompleted) || subject.topics[0];

          showAlert({
              title: "Iniciar Sessão",
              message: index !== sequenceIndex
                ? `Deseja pular para ${subject.name} e iniciar o foco?`
                : `Iniciar foco em ${subject.name}?`,
              variant: 'default',
              primaryButton: {
                  text: "Iniciar",
                  action: () => {
                      if (index !== sequenceIndex) {
                          // Opcional: atualizar o índice da sequência para este item
                          dispatch({ type: 'UPDATE_SEQUENCE_INDEX', payload: index });
                      }
                      startPomodoroForItem(nextTopic.id, 'topic', true);
                      router.push('/pomodoro');
                  }
              },
              secondaryButton: {
                  text: "Cancelar",
                  variant: 'secondary',
                  action: () => {}
              }
          });
      } else {
          showAlert({
              title: "Aviso",
              message: "Esta matéria não possui tópicos cadastrados.",
              variant: 'default',
              primaryButton: {
                  text: "OK",
                  action: () => {}
              }
          });
      }
  };

  const handleReset = () => {
      showAlert({
          title: "Reiniciar Ciclo",
          message: "Deseja zerar o progresso de tempo estudado de todas as matérias?",
          variant: 'destructive',
          primaryButton: {
              text: "Confirmar",
              variant: 'destructive',
              action: () => dispatch({ type: 'RESET_STUDY_SEQUENCE' })
          },
          secondaryButton: {
              text: "Cancelar",
              variant: 'secondary',
              action: () => {}
          }
      });
  };

  const handleDeleteSequence = () => {
      showAlert({
          title: "Apagar Sequência",
          message: "Tem certeza que deseja apagar sua sequência de estudos atual?",
          variant: 'destructive',
          primaryButton: {
              text: "Apagar",
              variant: 'destructive',
              action: () => dispatch({ type: 'SAVE_STUDY_SEQUENCE', payload: null })
          },
          secondaryButton: {
              text: "Cancelar",
              variant: 'secondary',
              action: () => {}
          }
      });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleCreateDefaultPlan = () => {
      if (subjects.length === 0) {
          showAlert({
              title: "Erro",
              message: "Adicione matérias antes de criar um plano.",
              variant: 'destructive',
              primaryButton: {
                  text: "OK",
                  action: () => {}
              }
          });
          return;
      }

      const newSequence = {
          id: Date.now().toString(),
          name: "Plano Padrão",
          sequence: subjects.map(s => ({ subjectId: s.id, totalTimeStudied: 0 })),
      };

      dispatch({ type: 'SAVE_STUDY_SEQUENCE', payload: newSequence });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditingSequence(studySequence?.sequence || []);
      setIsEditing(false);
    } else {
      setEditingSequence([...(studySequence?.sequence || [])]);
      setIsEditing(true);
    }
  };

  const handleSaveSequence = () => {
    if (!studySequence) return;

    dispatch({
      type: 'SAVE_STUDY_SEQUENCE',
      payload: { ...studySequence, sequence: editingSequence }
    });
    setIsEditing(false);
    showAlert({
      title: "Sucesso",
      message: "Sequência atualizada!",
      variant: 'success',
      primaryButton: {
        text: "OK",
        action: () => {}
      }
    });
  };

  const moveSequenceItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= editingSequence.length) return;
    const newSequence = [...editingSequence];
    const [movedItem] = newSequence.splice(fromIndex, 1);
    newSequence.splice(toIndex, 0, movedItem);
    setEditingSequence(newSequence);
  };

  const handleDeleteSequenceItem = (index: number) => {
    const newSequence = [...editingSequence];
    newSequence.splice(index, 1);
    setEditingSequence(newSequence);
  };

  const handleAddSubjectToSequence = () => {
    if (subjects.length === 0) {
      showAlert({
        title: "Erro",
        message: "Adicione matérias antes.",
        variant: 'destructive',
        primaryButton: {
          text: "OK",
          action: () => {}
        }
      });
      return;
    }

    // For this specific case, we need to implement a custom selector dialog or use a different approach
    // since our AlertDialog only supports primary/secondary buttons, not multiple options like Alert
    // For now, we'll just show a simple message suggesting to manage subjects elsewhere
    showAlert({
      title: "Adicionar Matéria",
      message: "Gerencie suas matérias na aba 'Matérias' e adicione-as ao seu plano de estudos.",
      variant: 'default',
      primaryButton: {
        text: "OK",
        action: () => {}
      }
    });
  };

  // Import logic placeholders (functionality relies on context not fully shown here, keeping it simple)
  const handleImportToPlanning = () => {
      // Placeholder for future full implementation if needed
      showAlert({
        title: "Info",
        message: "Importação para planejamento não disponível nesta versão.",
        variant: 'default',
        primaryButton: {
          text: "OK",
          action: () => {}
        }
      });
  };

  const handleImportFromSchedule = () => {
      // Placeholder
      showAlert({
        title: "Info",
        message: "Importação de cronograma não disponível nesta versão.",
        variant: 'default',
        primaryButton: {
          text: "OK",
          action: () => {}
        }
      });
  };
  
  const handleCreateEmptyManualSequence = () => {
      const newSequence = {
          id: Date.now().toString(),
          name: "Plano Manual Vazio",
          sequence: [],
      };
      dispatch({ type: 'SAVE_STUDY_SEQUENCE', payload: newSequence });
  };


  if (!studySequence || studySequence.sequence.length === 0) {
      return (
        <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
             <ThemedView style={styles.header}>
                <ThemedText type="title">Planejamento</ThemedText>
            </ThemedView>
             <View style={styles.emptyState}>
                 <View style={styles.emptyIconContainer}>
                   <Calendar size={48} color={theme.primary} style={{ opacity: 0.6 }} />
                 </View>
                 <ThemedText style={styles.emptyTitle}>Crie seu plano de estudos</ThemedText>
                 <ThemedText style={styles.emptyDesc}>
                     Organize suas matérias em uma sequência de estudo personalizada para maximizar sua produtividade.
                 </ThemedText>
                 <View style={styles.emptyActions}>
                    <Button onPress={handleCreateDefaultPlan} style={styles.primaryButton} variant="default">
                        <Plus size={16} color="white" style={{marginRight: 6}} />
                        Plano Automático
                    </Button>
                    <Button onPress={handleCreateEmptyManualSequence} style={styles.secondaryButton} variant="outline">
                        <Edit size={16} color={theme.primary} style={{marginRight: 6}} />
                        Plano Manual
                    </Button>
                      </View>
                 </View>
            </ThemedView>
      );
   };

   const renderItem = ({ item, index }: { item: any, index: number }) => {
     const subject = subjects.find(s => s.id === item.subjectId);
     if (!subject) return null;

     const isCurrent = index === sequenceIndex && !isEditing;
     const timeGoal = subject.studyDuration || 60;
     const progress = Math.min(100, Math.round(((item.totalTimeStudied || 0) / timeGoal) * 100));
     const isCompleted = (item.totalTimeStudied || 0) >= timeGoal;
     const isUpcoming = index > sequenceIndex && !isEditing;

     const statusInfo = {
       label: isCompleted ? 'Concluída' : isCurrent ? 'Atual' : isUpcoming ? 'Próxima' : 'Pendente'
     };

     return (
       <Card style={{
           ...styles.card,
           ...(isCurrent ? { borderColor: theme.primary, borderWidth: 2, backgroundColor: theme.primary + '05' } : {}),
           ...(isCompleted ? { backgroundColor: '#22c55e10', borderColor: '#22c55e30' } : {}),
           ...(isUpcoming ? { opacity: 0.8 } : {})
       }}>
         <CardContent style={styles.cardContent}>
           <View style={styles.cardMain}>
             <View style={styles.subjectInfo}>
               <ThemedText style={[styles.subjectName, { color: theme.text }, isCompleted && styles.completedText]} numberOfLines={1}>
                 {subject.name}
               </ThemedText>
               <ThemedText style={[styles.statusLabel, { color: statusInfo.label === 'Concluída' ? '#22c55e' : statusInfo.label === 'Atual' ? theme.primary : theme.mutedForeground }]}>
                 {statusInfo.label}
               </ThemedText>
             </View>

             <View style={styles.cardActions}>
               {isEditing ? (
                 <View style={styles.editActions}>
                    <TouchableOpacity
                      onPress={() => moveSequenceItem(index, index - 1)}
                      disabled={index === 0}
                      style={[styles.editButton, { backgroundColor: theme.card }, index === 0 && styles.disabledButton]}
                    >
                      <ArrowUp size={14} color={index === 0 ? theme.mutedForeground : theme.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => moveSequenceItem(index, index + 1)}
                      disabled={index === editingSequence.length - 1}
                      style={[styles.editButton, { backgroundColor: theme.card }, index === editingSequence.length - 1 && styles.disabledButton]}
                    >
                      <ArrowDown size={14} color={index === editingSequence.length - 1 ? theme.mutedForeground : theme.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteSequenceItem(index)}
                      style={[styles.editButton, styles.deleteButton, { backgroundColor: theme.destructive }]}
                    >
                      <Trash2 size={14} color="white" />
                    </TouchableOpacity>
                 </View>
               ) : (
                 <View style={styles.viewActions}>
                    <TouchableOpacity
                      onPress={() => openLogForm(subject.id, index)}
                      style={[styles.actionButton, { backgroundColor: theme.primary }]}
                    >
                      <PlusCircle size={14} color="white" />
                      <ThemedText style={styles.actionButtonText}>Registrar</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleStart(subject.id, index)}
                      style={[
                          styles.startButton,
                          { borderColor: theme.border },
                          isCurrent ? [styles.startButtonActive, { backgroundColor: theme.primary, borderColor: theme.primary }] : styles.startButtonInactive
                      ]}>
                      <Play size={14} color={isCurrent ? 'white' : theme.icon} />
                      <ThemedText style={[
                        styles.startButtonText,
                        { color: isCurrent ? 'white' : theme.icon }
                      ]}>
                        {isCurrent ? 'Continuar' : 'Iniciar'}
                      </ThemedText>
                    </TouchableOpacity>
                 </View>
               )}
             </View>

             <View style={styles.progressSection}>
               <View style={styles.progressRow}>
                   <Progress value={progress} style={styles.progressBar} />
                   <ThemedText style={styles.progressText}>
                       {item.totalTimeStudied || 0}/{timeGoal}min
                   </ThemedText>
               </View>
               {isCurrent && timeGoal > (item.totalTimeStudied || 0) && (
                 <ThemedText style={[styles.timeRemaining, { color: theme.primary }]}>
                   Faltam: {timeGoal - (item.totalTimeStudied || 0)}min
                 </ThemedText>
               )}
             </View>
           </View>
         </CardContent>
       </Card>
     );
   };

   return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
       <ThemedView style={styles.header}>
         <View style={styles.headerTop}>
          <View style={styles.titleSection}>
            <ThemedText type="title" style={styles.mainTitle}>Planejamento</ThemedText>
            <View style={[styles.progressBadge, {
              backgroundColor: theme.primary + '20',
              borderColor: theme.primary + '30'
            }]}>
              <ThemedText style={[styles.progressText, { color: theme.primary }]}>
                {sequenceIndex + 1}/{studySequence.sequence.length}
              </ThemedText>
            </View>
          </View>
          <View style={styles.headerActions}>
            {isEditing ? (
              <>
                 <TouchableOpacity onPress={handleEditToggle} style={[styles.headerButton, { backgroundColor: theme.card }]}>
                   <X size={18} color={theme.icon} />
                 </TouchableOpacity>
                 <TouchableOpacity onPress={handleSaveSequence} style={[styles.headerButton, styles.saveButton, { backgroundColor: theme.primary }]}>
                   <Save size={18} color="white" />
                 </TouchableOpacity>
              </>
            ) : (
              <>
                 <TouchableOpacity onPress={handleReset} style={[styles.headerButton, { backgroundColor: theme.card }]}>
                   <RefreshCw size={16} color={theme.icon} />
                 </TouchableOpacity>
                 <TouchableOpacity onPress={handleEditToggle} style={[styles.headerButton, { backgroundColor: theme.card }]}>
                   <Settings size={18} color={theme.icon} />
                 </TouchableOpacity>
              </>
            )}
          </View>
         </View>
        <View style={styles.sequenceInfo}>
          <ThemedText style={[styles.sequenceName, { color: theme.text }]}>{studySequence.name}</ThemedText>
          <View style={styles.sequenceStatsRow}>
            <ThemedText style={styles.sequenceStats}>
              {studySequence.sequence.length} matérias • {Math.round(studySequence.sequence.reduce((acc, item) => acc + (item.totalTimeStudied || 0), 0) / 60 * 10) / 10}h estudadas
            </ThemedText>
            {data.cycleResetCount > 0 && (
              <View style={styles.cycleInfo}>
                <RefreshCw size={14} color={theme.primary} />
                <ThemedText style={[styles.cycleInfoText, { color: theme.primary }]}>
                  {data.cycleResetCount} ciclo{data.cycleResetCount !== 1 ? 's' : ''} reiniciado{data.cycleResetCount !== 1 ? 's' : ''}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
       </ThemedView>

      <FlatList
        data={isEditing ? editingSequence : studySequence.sequence}
        keyExtractor={(item, index) => `${item.subjectId}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={
            isEditing ? (
                <Button onPress={handleAddSubjectToSequence} style={{marginTop: 12}} variant="outline">
                    <Plus size={14} color={theme.primary} style={{marginRight: 6}} />
                    Adicionar Matéria
                </Button>
            ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>Nenhuma sequência de estudos encontrada.</ThemedText>
          </View>
        }
      />

      {/* Formulário de registro de estudo */}
      <Modal visible={isLogFormOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <StudyLogForm
            onSave={() => setIsLogFormOpen(false)}
            onCancel={() => setIsLogFormOpen(false)}
            initialData={logInitialData}
          />
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mainTitle: { fontSize: 20, fontWeight: 'bold' },
  progressBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1
  },
  progressText: { fontSize: 11, fontWeight: '600' },
  headerActions: { flexDirection: 'row', gap: 6 },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveButton: { },
  sequenceInfo: { marginTop: 6 },
  sequenceName: { fontSize: 14, fontWeight: '600' },
  sequenceStatsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  sequenceStats: { fontSize: 11, opacity: 0.6 },
  cycleInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cycleInfoText: { fontSize: 11, fontWeight: '500' },
  content: { padding: 16, paddingBottom: 80 },
  card: { marginBottom: 8, borderRadius: 10 },
  cardContent: {
      padding: 12,
  },
  cardMain: { gap: 8 },
  subjectInfo: { marginBottom: 4 },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'transparent' // Will be overridden inline
  },
  statusEmoji: { fontSize: 18 },
  subjectHeader: { marginBottom: 8 },
  subjectName: { fontSize: 14, fontWeight: '600', marginBottom: 1 },
  completedText: { textDecorationLine: 'line-through', opacity: 0.7 },
  statusLabel: { fontSize: 11, fontWeight: '500' },
  cardLeft: { flexDirection: 'row', gap: 8, alignItems: 'center', flex: 1 },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  indexBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  indexText: { fontSize: 11, fontWeight: 'bold' },
  subjectName: { fontSize: 14, fontWeight: '600' },
  progressSection: { marginTop: 6 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  progressBar: { flex: 1, height: 6 },
  progressText: { fontSize: 11, opacity: 0.7 },
  timeRemaining: { fontSize: 10, opacity: 0.6, marginTop: 1 },
  completedBadge: { backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  completedText: { color: '#22c55e', fontSize: 10, fontWeight: 'bold' },
  waitingBadge: { opacity: 0.3 },
  waitingText: { fontSize: 10 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, marginTop: 30 },
  emptyIconContainer: { marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
  emptyDesc: { textAlign: 'center', opacity: 0.6, marginBottom: 20, lineHeight: 18 },
  emptyActions: { gap: 10, width: '100%', maxWidth: 260 },
  primaryButton: { flex: 1 },
  secondaryButton: { flex: 1 },
  emptyText: { opacity: 0.5 },

  // Action buttons
  cardActions: { alignItems: 'flex-end' },
  editActions: { flexDirection: 'row', gap: 3 },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  disabledButton: { opacity: 0.3 },
  deleteButton: { },
  viewActions: { flexDirection: 'row', gap: 6 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16
  },
  actionButtonText: { color: 'white', fontSize: 11, fontWeight: '600' },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1
  },
  startButtonActive: { },
  startButtonInactive: { backgroundColor: 'transparent' },
  startButtonText: { fontSize: 11, fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  formContainer: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconButton: { padding: 8 },
  playButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  resetButton: {
    position: 'relative',
  },
  resetButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetCounter: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  resetCounterText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});