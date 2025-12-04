import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, Alert, ScrollView } from 'react-native';
import { useStudy } from '@/contexts/study-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import AddSubjectToSequenceModal from '@/components/add-subject-to-sequence-modal';
import StudyLogModal from '@/components/study-log-modal';

export default function PlanScreen() {
  const { data, dispatch } = useStudy();
  const { subjects, studySequence, sequenceIndex } = data;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeTextColor = isDark ? '#FFF' : '#000';
  const subTextColor = isDark ? '#AAA' : '#666';

  const [isEditing, setIsEditing] = useState(false);
  const [editingSequence, setEditingSequence] = useState<any[]>([]);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logInitialData, setLogInitialData] = useState<any>(undefined);

  useEffect(() => {
    if (studySequence) {
      setEditingSequence(studySequence.sequence);
    }
  }, [studySequence]);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditingSequence(studySequence?.sequence || []);
      setIsEditing(false);
    } else {
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
    Alert.alert('Sucesso', 'Sequência de estudos atualizada!');
  };

  const handleResetSequence = () => {
    Alert.alert(
      "Reiniciar Ciclo?",
      "Isto irá zerar o progresso de tempo estudado de todas as sessões.",
      [
        { text: "Cancelar", style: "cancel" },
        {
            text: "Confirmar",
            onPress: () => {
                dispatch({ type: 'RESET_STUDY_SEQUENCE' });
                Alert.alert('Sucesso', 'Ciclo de estudos reiniciado!');
            }
        }
      ]
    );
  };

  const handleDeleteSequence = () => {
    Alert.alert(
      "Apagar Sequência?",
      "Tem certeza que deseja apagar sua sequência de estudos atual?",
      [
        { text: "Cancelar", style: "cancel" },
        {
            text: "Confirmar",
            style: "destructive",
            onPress: () => {
                dispatch({ type: 'SAVE_STUDY_SEQUENCE', payload: null });
                setIsEditing(false);
            }
        }
      ]
    );
  };

  const handleCreateEmptySequence = () => {
    const newSequence = {
      id: crypto.randomUUID(),
      name: "Plano de Estudos Manual",
      sequence: subjects.map(s => ({ subjectId: s.id, totalTimeStudied: 0 })),
    };
    dispatch({ type: 'SAVE_STUDY_SEQUENCE', payload: newSequence });
  };

  const handleCreateEmptyManualSequence = () => {
     const newSequence = {
      id: crypto.randomUUID(),
      name: "Plano de Estudos Manual Vazio",
      sequence: [],
    };
    dispatch({ type: 'SAVE_STUDY_SEQUENCE', payload: newSequence });
  };

  const handleImportFromSchedule = () => {
      // Since we don't have the schedule UI ported or verified, this is a placeholder behavior as per web code logic
      if (data.schedulePlans.length > 0) {
          // Logic to show plan selection would go here
           Alert.alert("Aviso", "Funcionalidade de importar cronograma ainda não portada completamente.");
      } else {
          Alert.alert("Erro", "Nenhum cronograma encontrado.");
      }
  };

  const handleAddSubjectToSequence = (subjectId: string) => {
    setEditingSequence(prev => [...prev, { subjectId, totalTimeStudied: 0 }]);
    setIsAddSubjectModalOpen(false);
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

  const openLogForm = (subjectId: string, itemSequenceIndex: number) => {
    setLogInitialData({ subjectId, sequenceItemIndex: itemSequenceIndex });
    setIsLogModalOpen(true);
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const subject = subjects.find(s => s.id === item.subjectId);
    if (!subject) return null;

    const isCurrent = index === sequenceIndex && !isEditing;
    const timeStudied = item.totalTimeStudied || 0;
    const timeGoal = subject.studyDuration || 60;
    const progress = timeGoal > 0 ? (timeStudied / timeGoal) * 100 : 0;
    const isCompleted = timeStudied >= timeGoal;

    return (
      <View style={[
          styles.itemCard,
          { backgroundColor: isDark ? '#1E1E1E' : '#FFF', borderColor: isCurrent ? Colors[colorScheme ?? 'light'].tint : 'transparent' },
          isCurrent && styles.currentItemCard,
          isCompleted && !isEditing && { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }
      ]}>
        <View style={styles.itemHeader}>
             <View style={[styles.indexBadge, { backgroundColor: isCurrent ? Colors[colorScheme ?? 'light'].tint : (isCompleted ? '#10B981' : '#E5E5E5') }]}>
                 <Text style={[styles.indexText, { color: isCurrent || isCompleted ? '#FFF' : '#000' }]}>{index + 1}</Text>
             </View>
             <View style={[styles.colorDot, { backgroundColor: subject.color }]} />
             <Text style={[styles.itemName, { color: themeTextColor }]}>{subject.name}</Text>
        </View>

        {!isEditing && (
             <View style={styles.progressContainer}>
                 <View style={[styles.progressBarBase, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]}>
                    <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: isCompleted ? '#10B981' : Colors[colorScheme ?? 'light'].tint }]} />
                 </View>
                 <View style={styles.progressLabels}>
                     <Text style={[styles.progressText, { color: subTextColor }]}>{timeStudied} min</Text>
                     <Text style={[styles.progressText, { color: subTextColor }]}>Meta: {timeGoal} min</Text>
                 </View>
             </View>
        )}

        {isEditing ? (
             <View style={styles.editActions}>
                 <Pressable onPress={() => moveSequenceItem(index, index - 1)} disabled={index === 0} style={styles.iconButton}>
                     <Ionicons name="arrow-up" size={20} color={index === 0 ? '#888' : themeTextColor} />
                 </Pressable>
                  <Pressable onPress={() => moveSequenceItem(index, index + 1)} disabled={index === editingSequence.length - 1} style={styles.iconButton}>
                     <Ionicons name="arrow-down" size={20} color={index === editingSequence.length - 1 ? '#888' : themeTextColor} />
                 </Pressable>
                  <Pressable onPress={() => handleDeleteSequenceItem(index)} style={styles.iconButton}>
                     <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                 </Pressable>
             </View>
        ) : (
             <View style={styles.actions}>
                  <Pressable
                    onPress={() => openLogForm(subject.id, index)}
                    style={[styles.actionButton, { borderColor: Colors[colorScheme ?? 'light'].tint }]}
                  >
                      <Ionicons name="add-circle-outline" size={16} color={Colors[colorScheme ?? 'light'].tint} />
                      <Text style={[styles.actionButtonText, { color: Colors[colorScheme ?? 'light'].tint }]}>Registrar</Text>
                  </Pressable>
             </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <View style={styles.header}>
         <Text style={[styles.title, { color: themeTextColor }]}>Plano de Estudos</Text>
         {studySequence && (
             <View style={{ flexDirection: 'row', gap: 12 }}>
                 {isEditing ? (
                     <>
                        <Pressable onPress={handleSaveSequence}>
                            <Ionicons name="save-outline" size={24} color={Colors[colorScheme ?? 'light'].tint} />
                        </Pressable>
                        <Pressable onPress={handleEditToggle}>
                            <Ionicons name="close-circle-outline" size={24} color={themeTextColor} />
                        </Pressable>
                     </>
                 ) : (
                     <>
                         <Pressable onPress={handleResetSequence}>
                            <Ionicons name="refresh-outline" size={24} color={themeTextColor} />
                        </Pressable>
                        <Pressable onPress={handleEditToggle}>
                            <Ionicons name="pencil-outline" size={24} color={themeTextColor} />
                        </Pressable>
                        <Pressable onPress={handleDeleteSequence}>
                            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                        </Pressable>
                     </>
                 )}
             </View>
         )}
      </View>

      {!studySequence ? (
        <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={subTextColor} />
            <Text style={[styles.emptyStateText, { color: themeTextColor }]}>Crie sua Sequência</Text>
            <Text style={[styles.emptyStateSubText, { color: subTextColor }]}>Você ainda não tem um plano de estudos.</Text>

            <Pressable style={[styles.createButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]} onPress={handleCreateEmptySequence}>
                <Text style={styles.createButtonText}>Criar Plano Básico (Todas Matérias)</Text>
            </Pressable>
            <Pressable style={[styles.createButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: themeTextColor }]} onPress={handleCreateEmptyManualSequence}>
                <Text style={[styles.createButtonText, { color: themeTextColor }]}>Criar Plano Manual Vazio</Text>
            </Pressable>
             <Pressable style={[styles.createButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: themeTextColor }]} onPress={handleImportFromSchedule}>
                <Text style={[styles.createButtonText, { color: themeTextColor }]}>Importar do Cronograma</Text>
            </Pressable>
        </View>
      ) : (
        <>
            <FlatList
                data={isEditing ? editingSequence : studySequence.sequence}
                keyExtractor={(item, index) => `${item.subjectId}-${index}`}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
            />
            {isEditing && (
                 <Pressable
                    style={[styles.fab, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                    onPress={() => setIsAddSubjectModalOpen(true)}
                 >
                     <Ionicons name="add" size={24} color="#FFF" />
                     <Text style={{ color: '#FFF', fontWeight: 'bold', marginLeft: 8 }}>Adicionar Matéria</Text>
                 </Pressable>
            )}
        </>
      )}

      <AddSubjectToSequenceModal
        visible={isAddSubjectModalOpen}
        onClose={() => setIsAddSubjectModalOpen(false)}
        onSelect={handleAddSubjectToSequence}
      />

      <StudyLogModal
        visible={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        initialData={logInitialData}
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
  emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
      gap: 16,
  },
  emptyStateText: {
      fontSize: 20,
      fontWeight: 'bold',
  },
  emptyStateSubText: {
      textAlign: 'center',
  },
  createButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
  },
  createButtonText: {
      color: '#FFF',
      fontWeight: 'bold',
  },
  listContent: {
      paddingHorizontal: 20,
      paddingBottom: 80,
  },
  itemCard: {
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 2,
  },
  currentItemCard: {
      borderWidth: 2,
  },
  itemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  indexBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
  },
  indexText: {
      fontWeight: 'bold',
      fontSize: 12,
  },
  colorDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 12,
  },
  itemName: {
      fontSize: 16,
      fontWeight: 'bold',
      flex: 1,
  },
  progressContainer: {
      marginTop: 12,
  },
  progressBarBase: {
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: 6,
  },
  progressBarFill: {
      height: '100%',
      borderRadius: 3,
  },
  progressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  progressText: {
      fontSize: 12,
  },
  actions: {
      marginTop: 12,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
  },
  actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      gap: 4,
  },
  actionButtonText: {
      fontWeight: '600',
      fontSize: 12,
  },
  editActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 12,
      gap: 8,
  },
  iconButton: {
      padding: 8,
  },
  fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 24,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
  }
});
