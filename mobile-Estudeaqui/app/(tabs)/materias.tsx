import React, { useState, useMemo } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Modal, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Plus, BookOpen, MoreVertical, Search, X, FileText, CheckCircle, Circle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useStudy } from '../../contexts/study-context';
import { useAlert } from '../../contexts/alert-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SubjectForm from '@/components/subject-form';









export default function SubjectsScreen() {
  const { data, dispatch } = useStudy();
  const { showAlert } = useAlert();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [selectedSubjectForTopic, setSelectedSubjectForTopic] = useState<any>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  const { subjects } = data;

  // Filter subjects based on search query
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects;
    return subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subjects, searchQuery]);

  const openForm = (subject?: any) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSubject(null);
  };

  const handleDelete = (subjectId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    showAlert({
      title: "Remover Matéria",
      message: "Tem certeza que deseja remover esta matéria e todos os seus tópicos?",
      variant: 'destructive',
      primaryButton: {
        text: "Remover",
        variant: 'destructive',
        action: () => dispatch({ type: 'DELETE_SUBJECT', payload: subjectId })
      },
      secondaryButton: {
        text: "Cancelar",
        variant: 'secondary',
        action: () => {}
      }
    });
  };

  const showContextMenu = (subject: any) => {
    Alert.alert(
      subject.name,
      'Escolha uma ação',
      [
        {
          text: 'Adicionar Tópico',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openTopicModal(subject);
          },
        },
        {
          text: 'Editar',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openForm(subject);
          },
        },
        {
          text: 'Excluir',
          onPress: () => handleDelete(subject.id),
          style: 'destructive',
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const openTopicModal = (subject: any) => {
    setSelectedSubjectForTopic(subject);
    setNewTopicName('');
    setIsTopicModalOpen(true);
  };

  const closeTopicModal = () => {
    setIsTopicModalOpen(false);
    setSelectedSubjectForTopic(null);
    setNewTopicName('');
  };

  const handleAddTopic = () => {
    if (!newTopicName.trim() || !selectedSubjectForTopic) return;

    const newTopic = {
      id: Date.now().toString(),
      name: newTopicName.trim(),
      order: selectedSubjectForTopic.topics?.length || 0,
      isCompleted: false,
      subjectId: selectedSubjectForTopic.id,
    };

    const updatedSubject = {
      ...selectedSubjectForTopic,
      topics: [...(selectedSubjectForTopic.topics || []), newTopic],
    };

    dispatch({ type: 'UPDATE_SUBJECT', payload: { id: selectedSubjectForTopic.id, data: updatedSubject } });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    closeTopicModal();

    showAlert({
      title: "Sucesso",
      message: `Tópico "${newTopicName}" adicionado à matéria "${selectedSubjectForTopic.name}"`,
      variant: 'success',
      primaryButton: {
        text: "OK",
        action: () => {}
      }
    });
  };

  const toggleSubjectExpansion = (subjectId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSubjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId);
      } else {
        newSet.add(subjectId);
      }
      return newSet;
    });
  };

  const renderSubject = ({ item }: { item: any }) => {
    const completedTopics = item.topics?.filter((t: any) => t.isCompleted).length || 0;
    const totalTopics = item.topics?.length || 0;
    const progressPercent = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
    const isExpanded = expandedSubjects.has(item.id);

    const getStatusInfo = () => {
      if (totalTopics === 0) return { label: 'Sem tópicos', color: theme.mutedForeground };
      if (progressPercent === 100) return { label: 'Concluída', color: '#22c55e' };
      if (progressPercent > 0) return { label: 'Em andamento', color: theme.primary };
      return { label: 'Não iniciada', color: theme.mutedForeground };
    };

    const statusInfo = getStatusInfo();

    const cardContent = (
      <Card style={[styles.card, isExpanded && styles.expandedCard]}>
        <CardContent style={styles.cardContent}>
          <View style={styles.subjectRow}>
            <View style={styles.subjectMain}>
              <View style={styles.subjectHeader}>
                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                <ThemedText style={[styles.subjectTitle, { color: theme.text }]}>
                  {item.name}
                </ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15' }]}>
                  <ThemedText style={[styles.statusText, { color: statusInfo.color }]}>
                    {statusInfo.label}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.subjectMeta}>
                <View style={styles.statItem}>
                  <BookOpen size={14} color={theme.mutedForeground} />
                  <ThemedText style={styles.statText}>
                    {totalTopics} tópicos
                  </ThemedText>
                </View>
                {item.studyDuration && (
                  <ThemedText style={styles.durationText}>
                    {item.studyDuration}min
                  </ThemedText>
                )}
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  showContextMenu(item);
                }}
                style={styles.contextButton}
                accessibilityLabel={`Menu de opções para ${item.name}`}
                accessibilityHint="Abre menu com ações para esta matéria"
                accessible={true}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <MoreVertical size={20} color={theme.icon} />
              </TouchableOpacity>
            </View>
          </View>

          {totalTopics > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressInfo}>
                <ThemedText style={styles.progressText}>
                  {completedTopics}/{totalTopics} concluídos
                </ThemedText>
                <ThemedText style={styles.progressPercent}>
                  {Math.round(progressPercent)}%
                </ThemedText>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: progressPercent === 100 ? '#22c55e' : theme.primary
                    }
                  ]}
                />
              </View>
            </View>
          )}
        </CardContent>
      </Card>
    );

    return (
      <View>
        <TouchableOpacity
          onPress={() => toggleSubjectExpansion(item.id)}
          activeOpacity={0.7}
          accessibilityLabel={`Expandir/contrair matéria ${item.name}`}
          accessibilityHint="Mostra ou oculta os tópicos desta matéria"
        >
          {cardContent}
        </TouchableOpacity>

        {isExpanded && item.topics && item.topics.length > 0 && (
          <View style={[styles.expandedContent, { backgroundColor: theme.card }]}>
            <View style={styles.topicsHeader}>
              <ThemedText style={[styles.topicsHeaderText, { color: theme.text }]}>
                Tópicos ({item.topics.length})
              </ThemedText>
              <TouchableOpacity
                onPress={() => openTopicModal(item)}
                style={[styles.addTopicButton, { backgroundColor: theme.primary }]}
                activeOpacity={0.7}
              >
                <Plus size={14} color="white" />
                <ThemedText style={styles.addTopicButtonText}>Adicionar</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.topicsList}>
              {item.topics.map((topic: any, index: number) => (
                <View key={topic.id} style={styles.topicItem}>
                  <TouchableOpacity
                    style={styles.topicContent}
                    activeOpacity={0.7}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      // Toggle completion status
                      const updatedTopic = { ...topic, isCompleted: !topic.isCompleted };
                      const updatedTopics = item.topics.map((t: any) =>
                        t.id === topic.id ? updatedTopic : t
                      );
                      const updatedSubject = { ...item, topics: updatedTopics };
                      dispatch({ type: 'UPDATE_SUBJECT', payload: { id: item.id, data: updatedSubject } });
                    }}
                  >
                    <ThemedText style={[styles.topicIndex, { color: theme.mutedForeground }]}>
                      {index}.
                    </ThemedText>
                    <View style={[styles.topicStatus, {
                      backgroundColor: topic.isCompleted ? '#22c55e' : theme.muted
                    }]}>
                      {topic.isCompleted ? (
                        <CheckCircle size={12} color="white" />
                      ) : (
                        <Circle size={12} color={theme.mutedForeground} />
                      )}
                    </View>
                    <ThemedText style={[
                      styles.topicName,
                      {
                        color: theme.text,
                        textDecorationLine: topic.isCompleted ? 'line-through' : 'none',
                        opacity: topic.isCompleted ? 0.6 : 1
                      }
                    ]}>
                      {topic.name}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
       <ThemedView style={styles.header}>
         <View style={styles.headerContent}>
           <ThemedText style={styles.title}>Matérias</ThemedText>
           <View style={styles.headerActions}>
             <TouchableOpacity
               onPress={() => {
                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                 setIsSearchVisible(!isSearchVisible);
                 if (isSearchVisible) {
                   setSearchQuery('');
                 }
               }}
               style={[styles.headerButton, { backgroundColor: theme.card }]}
               accessibilityLabel="Buscar matérias"
               accessibilityHint="Abre barra de busca"
               accessible={true}
               activeOpacity={0.7}
             >
               <Search size={20} color={theme.icon} />
             </TouchableOpacity>
             <TouchableOpacity
               onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openForm(); }}
               style={[styles.addButton, { backgroundColor: theme.primary }]}
               accessibilityLabel="Adicionar nova matéria"
               accessibilityHint="Abre formulário para criar uma nova matéria"
               accessible={true}
               activeOpacity={0.8}
             >
               <Plus size={24} color="white" />
             </TouchableOpacity>
           </View>
         </View>

         {isSearchVisible && (
           <View style={styles.searchContainer}>
             <View style={[styles.searchInputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
               <Search size={16} color={theme.mutedForeground} />
               <TextInput
                 style={[styles.searchInput, { color: theme.text }]}
                 placeholder="Buscar matérias..."
                 placeholderTextColor={theme.mutedForeground}
                 value={searchQuery}
                 onChangeText={setSearchQuery}
                 autoFocus={true}
               />
               {searchQuery.length > 0 && (
                 <TouchableOpacity
                   onPress={() => setSearchQuery('')}
                   hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                 >
                   <X size={16} color={theme.mutedForeground} />
                 </TouchableOpacity>
               )}
             </View>
           </View>
         )}

         <ThemedText style={styles.subtitle}>
           Organize suas matérias e tópicos de estudo
         </ThemedText>
       </ThemedView>

       <FlatList
         data={filteredSubjects}
         keyExtractor={(item) => item.id}
         contentContainerStyle={styles.listContent}
         renderItem={renderSubject}
         showsVerticalScrollIndicator={false}
         ListEmptyComponent={
           <View style={styles.emptyState}>
             <View style={styles.emptyIconContainer}>
               <BookOpen size={72} color={theme.primary} style={{ opacity: 0.8 }} />
             </View>
             <ThemedText style={styles.emptyTitle}>Suas matérias aparecerão aqui</ThemedText>
             <ThemedText style={styles.emptyText}>
               Organize seu estudo criando matérias e tópicos. Cada matéria pode ter sua própria cor e tempo de estudo sugerido.
             </ThemedText>
             <View style={styles.emptyActions}>
               <Button
                 onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openForm(); }}
                 style={styles.emptyButton}
                 activeOpacity={0.8}
               >
                 <Plus size={18} color="white" />
                 <ThemedText style={styles.emptyButtonText}>Criar Primeira Matéria</ThemedText>
               </Button>
             </View>
           </View>
         }
       />

       {/* Modal para adicionar tópico */}
       <Modal
         visible={isTopicModalOpen}
         animationType="fade"
         transparent={true}
         onRequestClose={closeTopicModal}
       >
         <KeyboardAvoidingView
           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
           style={styles.modalOverlay}
         >
           <View style={[styles.topicModalContent, { backgroundColor: theme.card }]}>
             <View style={styles.topicModalHeader}>
               <View style={styles.topicModalTitleContainer}>
                 <FileText size={20} color={theme.primary} />
                 <ThemedText style={[styles.topicModalTitle, { color: theme.text }]}>
                   Adicionar Tópico
                 </ThemedText>
               </View>
               <TouchableOpacity
                 onPress={closeTopicModal}
                 style={styles.closeButton}
                 hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
               >
                 <X size={20} color={theme.icon} />
               </TouchableOpacity>
             </View>

             {selectedSubjectForTopic && (
               <View style={styles.selectedSubjectInfo}>
                 <View style={[styles.colorDot, { backgroundColor: selectedSubjectForTopic.color }]} />
                 <ThemedText style={[styles.selectedSubjectName, { color: theme.text }]}>
                   {selectedSubjectForTopic.name}
                 </ThemedText>
               </View>
             )}

             <View style={styles.topicInputContainer}>
               <ThemedText style={[styles.topicInputLabel, { color: theme.text }]}>
                 Nome do tópico
               </ThemedText>
               <TextInput
                 style={[styles.topicInput, {
                   backgroundColor: theme.background,
                   borderColor: theme.border,
                   color: theme.text
                 }]}
                 placeholder="Digite o nome do tópico..."
                 placeholderTextColor={theme.mutedForeground}
                 value={newTopicName}
                 onChangeText={setNewTopicName}
                 autoFocus={true}
                 maxLength={100}
               />
             </View>

             <View style={styles.topicModalActions}>
               <TouchableOpacity
                 onPress={closeTopicModal}
                 style={[styles.topicModalButton, styles.cancelButton, { borderColor: theme.border }]}
                 activeOpacity={0.7}
               >
                 <ThemedText style={[styles.cancelButtonText, { color: theme.text }]}>
                   Cancelar
                 </ThemedText>
               </TouchableOpacity>
               <TouchableOpacity
                 onPress={handleAddTopic}
                 disabled={!newTopicName.trim()}
                 style={[
                   styles.topicModalButton,
                   styles.topicAddButton,
                   { backgroundColor: theme.primary },
                   (!newTopicName.trim()) && { opacity: 0.5 }
                 ]}
                 activeOpacity={0.7}
               >
                 <Plus size={16} color="white" />
                 <ThemedText style={styles.addButtonText}>
                   Adicionar
                 </ThemedText>
               </TouchableOpacity>
             </View>
           </View>
         </KeyboardAvoidingView>
       </Modal>

       <Modal
         visible={isFormOpen}
         animationType="slide"
         transparent={false}
         presentationStyle="pageSheet"
       >
         <SubjectForm
           onSave={closeForm}
           onCancel={closeForm}
           existingSubject={editingSubject}
         />
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
   },
   headerContent: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     marginBottom: 8,
   },
   headerActions: {
     flexDirection: 'row',
     gap: 8,
   },
   headerButton: {
     width: 44,
     height: 44,
     borderRadius: 22,
     alignItems: 'center',
     justifyContent: 'center',
     borderWidth: 1,
   },
   title: {
     fontSize: 24,
     fontWeight: 'bold',
   },
   addButton: {
     width: 48,
     height: 48,
     borderRadius: 24,
     alignItems: 'center',
     justifyContent: 'center',
   },
   subtitle: {
     fontSize: 14,
     opacity: 0.7,
   },
   searchContainer: {
     marginTop: 8,
     marginBottom: 4,
   },
   searchInputContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     paddingHorizontal: 12,
     paddingVertical: 8,
     borderRadius: 20,
     borderWidth: 1,
     gap: 8,
   },
   searchInput: {
     flex: 1,
     fontSize: 16,
     paddingVertical: 0,
   },
   listContent: {
     padding: 16,
     paddingBottom: 100,
   },
   card: {
     marginBottom: 12,
     borderRadius: 16,
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 3,
   },
   expandedCard: {
     marginBottom: 0,
     borderBottomLeftRadius: 0,
     borderBottomRightRadius: 0,
   },
   cardContent: {
     padding: 16,
   },
   subjectRow: {
     flexDirection: 'row',
     alignItems: 'center',
   },
   subjectMain: {
     flex: 1,
   },
   subjectHeader: {
     flexDirection: 'row',
     alignItems: 'center',
     marginBottom: 4,
   },
   colorDot: {
     width: 14,
     height: 14,
     borderRadius: 7,
     marginRight: 12,
   },
   subjectTitle: {
     fontSize: 17,
     fontWeight: '600',
     flex: 1,
   },
   statusBadge: {
     paddingHorizontal: 8,
     paddingVertical: 2,
     borderRadius: 10,
     marginLeft: 8,
   },
   statusText: {
     fontSize: 11,
     fontWeight: '500',
   },
   subjectMeta: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'space-between',
   },
   statItem: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 6,
   },
   statText: {
     fontSize: 13,
     opacity: 0.8,
   },
   durationText: {
     fontSize: 13,
     opacity: 0.6,
   },
   contextButton: {
     width: 48,
     height: 48,
     borderRadius: 24,
     alignItems: 'center',
     justifyContent: 'center',
     marginLeft: 8,
   },
   expandedContent: {
     marginHorizontal: 16,
     marginBottom: 12,
     borderBottomLeftRadius: 16,
     borderBottomRightRadius: 16,
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 2,
     overflow: 'hidden',
   },
   topicsHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     padding: 16,
     borderBottomWidth: 1,
     borderBottomColor: 'rgba(0,0,0,0.1)',
   },
   topicsHeaderText: {
     fontSize: 16,
     fontWeight: '600',
   },
   addTopicButton: {
     flexDirection: 'row',
     alignItems: 'center',
     paddingHorizontal: 12,
     paddingVertical: 6,
     borderRadius: 16,
     gap: 4,
   },
   addTopicButtonText: {
     color: 'white',
     fontSize: 12,
     fontWeight: '600',
   },
   topicsList: {
     padding: 8,
   },
   topicItem: {
     marginBottom: 4,
   },
   topicContent: {
     flexDirection: 'row',
     alignItems: 'center',
     padding: 12,
     borderRadius: 8,
     gap: 12,
   },
   topicStatus: {
     width: 24,
     height: 24,
     borderRadius: 12,
     alignItems: 'center',
     justifyContent: 'center',
   },
   topicIndex: {
     fontSize: 14,
     fontWeight: '500',
     width: 20,
     textAlign: 'center',
     marginRight: 8,
   },
   topicName: {
     fontSize: 14,
     flex: 1,
   },
   progressSection: {
     marginTop: 12,
     gap: 6,
   },
   progressInfo: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
   },
   progressText: {
     fontSize: 12,
     opacity: 0.7,
   },
   progressPercent: {
     fontSize: 12,
     fontWeight: '600',
     opacity: 0.8,
   },
   progressBar: {
     height: 6,
     backgroundColor: 'rgba(0,0,0,0.1)',
     borderRadius: 3,
     overflow: 'hidden',
   },
   progressFill: {
     height: '100%',
     borderRadius: 3,
   },
   emptyState: {
     flex: 1,
     alignItems: 'center',
     justifyContent: 'center',
     padding: 40,
     gap: 24,
   },
   emptyIconContainer: {
     padding: 20,
     borderRadius: 40,
     backgroundColor: 'rgba(0,0,0,0.05)',
   },
   emptyTitle: {
     fontSize: 20,
     fontWeight: 'bold',
     textAlign: 'center',
   },
   emptyText: {
     fontSize: 15,
     opacity: 0.7,
     textAlign: 'center',
     maxWidth: 300,
     lineHeight: 22,
   },
   emptyButton: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 8,
     paddingHorizontal: 24,
     paddingVertical: 16,
     borderRadius: 12,
   },
   emptyButtonText: {
     color: 'white',
     fontSize: 15,
     fontWeight: '600',
   },
   emptyActions: {
     width: '100%',
     maxWidth: 280,
   },



   // Topic Modal Styles
   modalOverlay: {
     flex: 1,
     backgroundColor: 'rgba(0,0,0,0.5)',
     justifyContent: 'center',
     alignItems: 'center',
     padding: 20,
   },
   topicModalContent: {
     width: '100%',
     maxWidth: 400,
     borderRadius: 16,
     padding: 20,
     shadowOffset: { width: 0, height: 10 },
     shadowOpacity: 0.25,
     shadowRadius: 20,
     elevation: 10,
   },
   topicModalHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     marginBottom: 20,
   },
   topicModalTitleContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 8,
   },
   topicModalTitle: {
     fontSize: 18,
     fontWeight: '600',
   },
   closeButton: {
     padding: 4,
   },
   selectedSubjectInfo: {
     flexDirection: 'row',
     alignItems: 'center',
     padding: 12,
     backgroundColor: 'rgba(0,0,0,0.05)',
     borderRadius: 8,
     marginBottom: 20,
     gap: 8,
   },
   selectedSubjectName: {
     fontSize: 14,
     fontWeight: '500',
   },
   topicInputContainer: {
     marginBottom: 24,
   },
   topicInputLabel: {
     fontSize: 14,
     fontWeight: '500',
     marginBottom: 8,
   },
   topicInput: {
     borderWidth: 1,
     borderRadius: 8,
     paddingHorizontal: 12,
     paddingVertical: 12,
     fontSize: 16,
   },
   topicModalActions: {
     flexDirection: 'row',
     gap: 12,
   },
   topicModalButton: {
     flex: 1,
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     paddingVertical: 12,
     paddingHorizontal: 16,
     borderRadius: 8,
     gap: 6,
   },
   cancelButton: {
     backgroundColor: 'transparent',
     borderWidth: 1,
   },
   cancelButtonText: {
     fontSize: 14,
     fontWeight: '500',
   },
   topicAddButton: {
     backgroundColor: '#3b82f6',
   },
   addButtonText: {
     color: 'white',
     fontSize: 14,
     fontWeight: '600',
   },
 });