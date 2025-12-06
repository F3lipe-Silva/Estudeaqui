import React, { useState } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Modal, TextInput, Linking } from 'react-native';
import { ChevronDown, ChevronUp, CheckCircle, Circle, Plus, Trash2, Edit, X, Save, FolderOpen, RotateCcw, Play, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view'; // Use ThemedView for general non-safe-area-controlled containers
import { useStudy } from '../../contexts/study-context';
import { useAlert } from '../../contexts/alert-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SubjectForm from '@/components/subject-form'; // Assuming this component exists

export default function CycleScreen() {
  const { data, dispatch, startPomodoroForItem } = useStudy();
  const { showAlert } = useAlert();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets(); // Hook for safe area insets

  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [editingTopicName, setEditingTopicName] = useState('');
  const [newTopicName, setNewTopicName] = useState<Record<string, string>>({});

  const toggleExpand = (id: string) => {
    setExpandedSubjects(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleToggleTopic = (subjectId: string, topicId: string) => {
    dispatch({ type: 'TOGGLE_TOPIC_COMPLETED', payload: { subjectId, topicId } });
  };

  const handleDeleteSubject = (id: string, name: string) => {
      showAlert({
          title: "Remover Matéria",
          message: `Tem certeza que deseja remover "${name}"?`,
          variant: 'destructive',
          primaryButton: {
              text: "Remover",
              variant: 'destructive',
              action: () => dispatch({ type: 'DELETE_SUBJECT', payload: id })
          },
          secondaryButton: {
              text: "Cancelar",
              variant: 'secondary',
              action: () => {}
          }
      });
  };

  const handleEditTopic = (subjectId: string, topic: any) => {
    setEditingTopic({ subjectId, topic });
    setEditingTopicName(topic.name);
  };

  const handleSaveTopic = () => {
    if (editingTopicName.trim() && editingTopic) {
      dispatch({
        type: 'UPDATE_TOPIC',
        payload: {
          subjectId: editingTopic.subjectId,
          topicId: editingTopic.topic.id,
          data: { name: editingTopicName.trim() }
        }
      });
      setEditingTopic(null);
      setEditingTopicName('');
    }
  };

  const handleCancelEditTopic = () => {
    setEditingTopic(null);
    setEditingTopicName('');
  };

  const handleNewTopicChange = (subjectId: string, text: string) => {
    setNewTopicName(prev => ({
      ...prev,
      [subjectId]: text
    }));
  };

  const handleAddNewTopic = (subjectId: string) => {
    const topicName = newTopicName[subjectId];
    if (!topicName || !topicName.trim()) return;

    dispatch({
      type: 'ADD_TOPIC',
      payload: {
        subjectId,
        name: topicName.trim()
      }
    });

    setNewTopicName(prev => ({
      ...prev,
      [subjectId]: ''
    }));
  };

  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const openSaveTemplateDialog = () => {
    setSaveTemplateName('');
    setIsSaveDialogOpen(true);
  };

  const openLoadTemplateDialog = () => {
    setSelectedTemplate(null);
    setIsLoadDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (saveTemplateName.trim()) {
      dispatch({
        type: 'SAVE_TEMPLATE',
        payload: { name: saveTemplateName.trim() }
      });
      setIsSaveDialogOpen(false);
      setSaveTemplateName('');
    }
  };

  const handleLoadTemplate = () => {
    if (selectedTemplate) {
      dispatch({
        type: 'LOAD_TEMPLATE_SUCCESS',
        payload: { id: selectedTemplate }
      });
      setIsLoadDialogOpen(false);
      setSelectedTemplate(null);
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    showAlert({
      title: "Remover Template",
      message: "Tem certeza que deseja remover este template?",
      variant: 'destructive',
      primaryButton: {
        text: "Remover",
        variant: 'destructive',
        action: () => dispatch({ type: 'DELETE_TEMPLATE', payload: templateId })
      },
      secondaryButton: {
        text: "Cancelar",
        variant: 'secondary',
        action: () => {}
      }
    });
  };

  const openSubjectEditForm = (subject: any) => {
    setIsSubjectEditOpen(true);
    setSubjectToEdit(subject);
  };

  const [isSubjectEditOpen, setIsSubjectEditOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<any>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState('');

  const startEditDescription = (subjectId: string, currentDescription: string) => {
    setEditingSubjectId(subjectId);
    setEditingDescription(currentDescription || '');
  };

  const saveDescription = () => {
    if (editingSubjectId) {
      dispatch({
        type: 'UPDATE_SUBJECT',
        payload: {
          id: editingSubjectId,
          data: { description: editingDescription }
        }
      });
      setEditingSubjectId(null);
      setEditingDescription('');
    }
  };

  const cancelEditDescription = () => {
    setEditingSubjectId(null);
    setEditingDescription('');
  };

  const renderSubject = ({ item: subject }: { item: any }) => {
    const isExpanded = expandedSubjects.includes(subject.id);
    const completedTopics = subject.topics.filter((t: any) => t.isCompleted).length;
    const totalTopics = subject.topics.length;

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => toggleExpand(subject.id)}
            activeOpacity={0.7}
          >
            <View style={styles.headerLeft}>
              <View style={[styles.colorDot, { backgroundColor: subject.color }]} />
              <View>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                    <ThemedText style={styles.subjectName}>{subject.name}</ThemedText>
                    <View style={styles.metaBadge}>
                        <Clock size={10} color={theme.mutedForeground} />
                        <ThemedText style={styles.metaText}>{subject.studyDuration} min</ThemedText>
                    </View>
                </View>
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>{completedTopics}/{totalTopics} tópicos</ThemedText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
           <View style={styles.headerRight}>
             <TouchableOpacity onPress={() => openSubjectEditForm(subject)} style={{padding: 6}}>
               <Edit size={16} color={theme.icon} />
             </TouchableOpacity>
             <TouchableOpacity onPress={() => toggleExpand(subject.id)} style={{padding: 6}}>
                 {isExpanded ? <ChevronUp size={18} color={theme.icon} /> : <ChevronDown size={18} color={theme.icon} />}
             </TouchableOpacity>
           </View>
        </View>

        {isExpanded && (
          <View style={styles.topicsContainer}>
             {editingSubjectId === subject.id ? (
                 <View style={styles.editDescriptionContainer}>
                     <TextInput
                         value={editingDescription}
                         onChangeText={setEditingDescription}
                         style={[styles.editDescriptionInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                         placeholder="Descrição da matéria..."
                         placeholderTextColor={theme.mutedForeground}
                         multiline
                     />
                     <View style={styles.editDescriptionButtons}>
                          <Button variant="outline" size="sm" onPress={cancelEditDescription}>
                              <X size={12} color={theme.text} />
                          </Button>
                          <Button size="sm" onPress={saveDescription}>
                              <CheckCircle size={12} color="white" />
                          </Button>
                     </View>
                 </View>
             ) : (
                 <>
                     {subject.description ? (
                         <View style={styles.descriptionContainer}>
                             <ThemedText style={styles.description}>{subject.description}</ThemedText>
                             <TouchableOpacity
                                 style={styles.editDescriptionButton}
                                 onPress={() => startEditDescription(subject.id, subject.description)}
                             >
                                 <Edit size={14} color={theme.icon} />
                             </TouchableOpacity>
                         </View>
                     ) : (
                         <TouchableOpacity
                             style={styles.addDescriptionButton}
                             onPress={() => startEditDescription(subject.id, '')}
                         >
                              <Plus size={12} color={theme.icon} />
                             <ThemedText style={styles.addDescriptionText}>Adicionar descrição</ThemedText>
                         </TouchableOpacity>
                     )}
                 </>
             )}
             {subject.materialUrl ? (
                 <TouchableOpacity
                     style={styles.materialLink}
                     onPress={() => Linking.openURL(subject.materialUrl)}
                 >
                      <FolderOpen size={14} color={theme.icon} style={styles.materialLinkIcon} />
                     <ThemedText style={styles.materialLinkText}>Abrir Material</ThemedText>
                 </TouchableOpacity>
             ) : null}
             
             <View style={styles.topicsList}>
                {subject.topics.length === 0 ? (
                    <ThemedText style={styles.emptyText}>Nenhum tópico cadastrado.</ThemedText>
                ) : (
                    subject.topics.map((topic: any) => {
                        const isEditing = editingTopic &&
                                         editingTopic.subjectId === subject.id &&
                                         editingTopic.topic.id === topic.id;

                        return (
                            <View key={topic.id} style={styles.topicRow}>
                                {isEditing ? (
                                    <View style={styles.editTopicContainer}>
                                        <TextInput
                                            value={editingTopicName}
                                            onChangeText={setEditingTopicName}
                                            style={[styles.editTopicInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                                            placeholder="Nome do tópico"
                                            placeholderTextColor={theme.mutedForeground}
                                            autoFocus
                                            onSubmitEditing={handleSaveTopic}
                                            blurOnSubmit={false}
                                        />
                                        <View style={styles.editTopicButtons}>
                                             <Button variant="outline" size="sm" onPress={handleCancelEditTopic}>
                                                 <X size={12} color={theme.text} />
                                             </Button>
                                             <Button size="sm" onPress={handleSaveTopic}>
                                                 <CheckCircle size={12} color="white" />
                                             </Button>
                                        </View>
                                    </View>
                                ) : (
                                    <>
                                         <TouchableOpacity
                                             style={styles.topicCheck}
                                             onPress={() => handleToggleTopic(subject.id, topic.id)}
                                         >
                                             {topic.isCompleted ? (
                                                 <CheckCircle size={16} color={Colors.light.primary} />
                                             ) : (
                                                 <Circle size={16} color={theme.icon} />
                                             )}
                                         </TouchableOpacity>
                                        <View style={styles.topicInfo}>
                                            <ThemedText style={[styles.topicOrder, { backgroundColor: theme.muted }]}>
                                                {String(topic.order).padStart(2, '0')}
                                            </ThemedText>
                                            <ThemedText style={[
                                                styles.topicName,
                                                topic.isCompleted && styles.completedText
                                            ]}>
                                                {topic.name}
                                            </ThemedText>
                                        </View>
                                         <TouchableOpacity
                                             style={styles.editButton}
                                             onPress={() => handleEditTopic(subject.id, topic)}
                                             hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                         >
                              <Edit size={12} color={theme.icon} />
                                         </TouchableOpacity>
                                         <TouchableOpacity
                                             style={styles.deleteButton}
                                             onPress={() => {
                                                 showAlert({
                                                     title: "Remover Tópico",
                                                     message: `Tem certeza que deseja remover "${topic.name}"?`,
                                                     variant: 'destructive',
                                                     primaryButton: {
                                                         text: "Remover",
                                                         variant: 'destructive',
                                                         action: () => dispatch({
                                                             type: 'DELETE_TOPIC',
                                                             payload: { subjectId: subject.id, topicId: topic.id }
                                                         })
                                                     },
                                                     secondaryButton: {
                                                         text: "Cancelar",
                                                         variant: 'secondary',
                                                         action: () => {}
                                                     }
                                                 });
                                             }}
                                             hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                         >
                                             <Trash2 size={14} color={theme.destructive} />
                                         </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        );
                    })
                )}
             </View>

             <View style={styles.addTopicContainer}>
                 <TextInput
                     value={newTopicName[subject.id] || ''}
                     onChangeText={(text) => handleNewTopicChange(subject.id, text)}
                     style={[styles.addTopicInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                     placeholder="Adicionar novo tópico..."
                     placeholderTextColor={theme.mutedForeground}
                     onSubmitEditing={() => handleAddNewTopic(subject.id)}
                     blurOnSubmit={false}
                 />
                  <Button size="sm" onPress={() => handleAddNewTopic(subject.id)}>
                      <Plus size={14} color="white" />
                  </Button>
             </View>

             <View style={styles.advancedActions}>
                 <View style={styles.actionButtonRow}>
                     <Button
                         variant="outline"
                         size="sm"
                         style={styles.actionButton}
                         onPress={() => {
                             dispatch({
                                 type: 'SET_REVISION_PROGRESS',
                                 payload: { subjectId: subject.id, progress: 0 }
                             });
                             showAlert({
                                 title: "Revisão reiniciada",
                                 message: "O progresso de revisão desta matéria foi resetado.",
                                 variant: 'success',
                                 primaryButton: {
                                     text: "OK",
                                     action: () => {}
                                 }
                             });
                         }}
                     >
                          <RotateCcw size={12} color={theme.icon} style={styles.actionButtonIcon} />
                          <ThemedText style={styles.actionButtonText}>Reiniciar Revisão</ThemedText>
                     </Button>
                     {subject.studyDuration && (
                         <Button
                             variant="outline"
                             size="sm"
                             style={styles.actionButton}
                             onPress={() => {
                                 const firstTopic = subject.topics.find((t: any) => !t.isCompleted) || subject.topics[0];
                                 if (firstTopic) {
                                     startPomodoroForItem(firstTopic.id, 'topic', true);
                                 } else {
                                     showAlert({
                                         title: "Aviso",
                                         message: "Adicione tópicos para estudar.",
                                         variant: 'default',
                                         primaryButton: {
                                             text: "OK",
                                             action: () => {}
                                         }
                                     });
                                 }
                             }}
                         >
                              <Play size={12} color={theme.icon} style={styles.actionButtonIcon} />
                              <ThemedText style={styles.actionButtonText}>Iniciar Estudo</ThemedText>
                         </Button>
                     )}
                 </View>
                 <View style={styles.actionButtonRow}>
                     <Button
                         variant="outline"
                         size="sm"
                         style={styles.actionButton}
                         onPress={() => handleDeleteSubject(subject.id, subject.name)}
                     >
                          <Trash2 size={14} color={theme.destructive} style={styles.actionButtonIcon} />
                          <ThemedText style={[styles.actionButtonText, { color: theme.destructive }]}>Remover Matéria</ThemedText>
                     </Button>
                 </View>
             </View>
          </View>
        )}
      </Card>
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.header}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <ThemedText type="title" style={{fontSize: 20}}>Matérias</ThemedText>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Button variant="outline" size="sm" onPress={() => openSaveTemplateDialog()}>
                  <Save size={14} color={theme.primary} style={{marginRight: 3}} />
                  <ThemedText style={{fontSize: 11}}>Salvar</ThemedText>
              </Button>
              <Button variant="outline" size="sm" onPress={() => openLoadTemplateDialog()}>
                  <FolderOpen size={14} color={theme.icon} style={{marginRight: 3}} />
                  <ThemedText style={{fontSize: 11}}>Carregar</ThemedText>
              </Button>
              <Button size="sm" onPress={() => setIsFormOpen(true)}>
                  <Plus size={14} color="white" />
                  <ThemedText style={{color: 'white', marginLeft: 3}}>Nova</ThemedText>
              </Button>
            </View>
        </View>
      </ThemedView>
      
      <FlatList
        data={data.subjects || []}
        keyExtractor={item => item.id}
        renderItem={renderSubject}
        contentContainerStyle={styles.content}
         ListEmptyComponent={
             <View style={styles.emptyState}>
                 <ThemedText style={{ textAlign: 'center', opacity: 0.6, marginBottom: 12, fontSize: 14 }}>
                     Nenhuma matéria cadastrada.
                 </ThemedText>
                 <Button onPress={() => setIsFormOpen(true)}>
                     <Plus size={14} color="white" style={{marginRight: 6}} />
                     <ThemedText style={{color: 'white', fontSize: 13}}>Criar Primeira Matéria</ThemedText>
                 </Button>
             </View>
         }
      />

      <Modal visible={isFormOpen} animationType="slide" transparent>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <SubjectForm
                onSave={() => setIsFormOpen(false)}
                onCancel={() => setIsFormOpen(false)}
            />
        </View>
      </Modal>

      <Modal visible={isSaveDialogOpen} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <ThemedText style={styles.modalTitle}>Salvar Template</ThemedText>
            <TextInput
              value={saveTemplateName}
              onChangeText={setSaveTemplateName}
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
              placeholder="Nome do template"
              placeholderTextColor={theme.mutedForeground}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button variant="outline" onPress={() => setIsSaveDialogOpen(false)}>
                <ThemedText>Cancelar</ThemedText>
              </Button>
              <Button onPress={handleSaveTemplate}>
                <ThemedText style={{ color: 'white' }}>Salvar</ThemedText>
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isLoadDialogOpen} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <ThemedText style={styles.modalTitle}>Carregar Template</ThemedText>
            {(data.templates || []).length === 0 ? (
              <ThemedText style={styles.emptyText}>Nenhum template salvo ainda.</ThemedText>
            ) : (
              (data.templates || []).map(template => (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateItem,
                    selectedTemplate === template.id && { backgroundColor: `${theme.primary}20` }
                  ]}
                  onPress={() => setSelectedTemplate(template.id)}
                >
                  <ThemedText style={styles.templateName}>{template.name}</ThemedText>
                  <View style={styles.templateActions}>
                    <TouchableOpacity
                      onPress={() => handleDeleteTemplate(template.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                       <Trash2 size={14} color={theme.destructive} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
            <View style={styles.modalButtons}>
              <Button variant="outline" onPress={() => setIsLoadDialogOpen(false)}>
                <ThemedText>Cancelar</ThemedText>
              </Button>
              <Button
                onPress={handleLoadTemplate}
                disabled={!selectedTemplate}
                style={!selectedTemplate ? { opacity: 0.5 } : {}}
              >
                <ThemedText style={{ color: 'white' }}>Carregar</ThemedText>
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isSubjectEditOpen} animationType="slide" transparent>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <SubjectForm
                onSave={() => {
                  setIsSubjectEditOpen(false);
                  setSubjectToEdit(null);
                }}
                onCancel={() => {
                  setIsSubjectEditOpen(false);
                  setSubjectToEdit(null);
                }}
                existingSubject={subjectToEdit}
            />
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 8 }, // paddingTop handled by SafeAreaThemedView
  content: { padding: 16, paddingBottom: 80 },
  card: { marginBottom: 8, overflow: 'hidden', borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  subjectName: { fontSize: 15, fontWeight: '600' },
  badge: { backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3, alignSelf: 'flex-start', marginTop: 2 },
  badgeText: { fontSize: 9, fontWeight: 'bold', opacity: 0.6 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.03)', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  metaText: { fontSize: 9, opacity: 0.6 },
  topicsContainer: {
      backgroundColor: 'rgba(0,0,0,0.02)',
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.05)',
      padding: 12,
  },
  description: {
      fontSize: 13,
      fontStyle: 'italic',
      opacity: 0.6,
      marginBottom: 8,
  },
  topicsList: { gap: 8 },
  topicRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 2,
  },
  topicCheck: {
      width: 20,
      alignItems: 'center',
  },
  topicInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
  },
  topicOrder: {
      fontSize: 9,
      fontFamily: 'monospace',
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 3,
      overflow: 'hidden',
  },
  topicName: {
      fontSize: 13,
      flex: 1,
  },
  completedText: {
      textDecorationLine: 'line-through',
      opacity: 0.5,
  },
  editTopicContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 2,
      flex: 1,
  },
  editTopicInput: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 6,
      padding: 6,
      fontSize: 13,
  },
  editTopicButtons: {
      flexDirection: 'row',
      gap: 3,
  },
  editButton: {
      paddingHorizontal: 6,
      paddingVertical: 3,
  },
  deleteButton: {
      paddingHorizontal: 6,
      paddingVertical: 3,
  },
  addTopicContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
      padding: 6,
      backgroundColor: 'rgba(0,0,0,0.02)',
      borderRadius: 6,
  },
  addTopicInput: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 6,
      padding: 6,
      fontSize: 13,
  },
  materialLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.1)',
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginBottom: 8,
  },
  materialLinkIcon: {
      marginRight: 3,
  },
  materialLinkText: {
      fontSize: 12,
  },
  descriptionContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 6,
      padding: 8,
      backgroundColor: 'rgba(0,0,0,0.03)',
      borderRadius: 6,
      marginBottom: 8,
  },
  editDescriptionButton: {
      padding: 3,
      alignSelf: 'flex-start',
  },
  addDescriptionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      padding: 8,
      backgroundColor: 'rgba(0,0,0,0.03)',
      borderRadius: 6,
      marginBottom: 8,
  },
  addDescriptionText: {
      fontSize: 12,
      opacity: 0.7,
  },
  editDescriptionContainer: {
      marginBottom: 8,
      gap: 6,
  },
  editDescriptionInput: {
      borderWidth: 1,
      borderRadius: 6,
      padding: 8,
      fontSize: 13,
      height: 60,
      textAlignVertical: 'top',
  },
  editDescriptionButtons: {
      flexDirection: 'row',
      gap: 6,
      justifyContent: 'flex-end',
  },
  advancedActions: {
      marginTop: 12,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.05)',
      gap: 6,
  },
  actionButtonRow: {
      flexDirection: 'row',
      gap: 6,
      flexWrap: 'wrap',
  },
  actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 8,
      minWidth: 100,
  },
  actionButtonIcon: {
      marginRight: 3,
  },
  actionButtonText: {
      fontSize: 11,
      fontWeight: '500',
  },
  modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 16,
  },
  modalContent: {
      width: '100%',
      maxWidth: 360,
      borderRadius: 10,
      padding: 16,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
  },
  input: {
      borderWidth: 1,
      borderRadius: 6,
      padding: 10,
      fontSize: 15,
      marginBottom: 12,
  },
  modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
      marginTop: 12,
  },
  modalTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 12,
  },
  templateItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      marginVertical: 3,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.1)',
  },
  templateName: {
      fontSize: 14,
  },
  templateActions: {
      flexDirection: 'row',
      gap: 6,
  },
  emptyText: {
      opacity: 0.5,
      fontStyle: 'italic',
      fontSize: 13,
  },
  actionsFooter: {
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.05)',
  },
  emptyState: {
      padding: 30,
      alignItems: 'center',
  }
});