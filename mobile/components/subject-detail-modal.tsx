import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, FlatList, Alert, TextInput, Linking, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useStudy } from '@/contexts/study-context';
import SubjectFormModal from './subject-form-modal';

interface SubjectDetailModalProps {
  visible: boolean;
  onClose: () => void;
  subject: any;
}

export default function SubjectDetailModal({ visible, onClose, subject }: SubjectDetailModalProps) {
  const { dispatch } = useStudy();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeTextColor = isDark ? '#FFF' : '#000';
  const themeCardColor = isDark ? '#1E1E1E' : '#FFF';
  const themeBorderColor = isDark ? '#333' : '#E5E5E5';
  const themeBackgroundColor = isDark ? '#121212' : '#F2F2F7';

  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [addingTopic, setAddingTopic] = useState(false);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [editingTopicName, setEditingTopicName] = useState('');

  if (!subject) return null;

  const handleDeleteSubject = () => {
    Alert.alert(
      "Remover Matéria",
      `Tem certeza que deseja remover "${subject.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => {
            dispatch({ type: 'DELETE_SUBJECT', payload: subject.id });
            onClose();
          }
        }
      ]
    );
  };

  const handleUpdateSubject = (data: any) => {
    dispatch({ type: 'UPDATE_SUBJECT', payload: { id: subject.id, data } });
    // Since subject prop is immutable from parent render, we rely on parent re-render or context update.
    // However, in this modal, 'subject' is a prop. We might need to close/re-open or handle state update if passed subject is not live.
    // Ideally, the parent passes the subject from the context, so when context updates, parent re-renders and passes new subject.
    setIsEditingSubject(false);
  };

  const handleAddTopic = () => {
    if (newTopicName.trim()) {
      const topicData = { subjectId: subject.id, name: newTopicName, id: crypto.randomUUID() };
      dispatch({ type: 'ADD_TOPIC', payload: topicData });
      setNewTopicName('');
      setAddingTopic(false);
    }
  };

  const handleToggleTopic = (topicId: string) => {
    dispatch({ type: 'TOGGLE_TOPIC_COMPLETED', payload: { subjectId: subject.id, topicId } });
  };

  const handleDeleteTopic = (topicId: string) => {
    dispatch({ type: 'DELETE_TOPIC', payload: { subjectId: subject.id, topicId } });
  };

  const handleSaveEditedTopic = () => {
      if (editingTopicName.trim() && editingTopic) {
        const updatedTopics = subject.topics.map((t: any) =>
          t.id === editingTopic.id ? { ...t, name: editingTopicName.trim() } : t
        );
        dispatch({
          type: 'UPDATE_SUBJECT',
          payload: { id: subject.id, data: { topics: updatedTopics } }
        });
        setEditingTopic(null);
        setEditingTopicName('');
      }
  };


  const renderTopicItem = ({ item }: { item: any }) => (
    <View style={[styles.topicItem, { borderColor: themeBorderColor, backgroundColor: themeCardColor }]}>
        <Pressable onPress={() => handleToggleTopic(item.id)}>
            <Ionicons
                name={item.isCompleted ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={item.isCompleted ? Colors[colorScheme ?? 'light'].tint : themeTextColor}
            />
        </Pressable>
        {editingTopic?.id === item.id ? (
             <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                <TextInput
                    value={editingTopicName}
                    onChangeText={setEditingTopicName}
                    style={[styles.input, { flex: 1, color: themeTextColor, borderColor: themeBorderColor, height: 36 }]}
                    autoFocus
                />
                 <Pressable onPress={handleSaveEditedTopic} style={{ marginLeft: 8 }}>
                    <Ionicons name="checkmark" size={24} color={Colors[colorScheme ?? 'light'].tint} />
                </Pressable>
                 <Pressable onPress={() => setEditingTopic(null)} style={{ marginLeft: 8 }}>
                    <Ionicons name="close" size={24} color={themeTextColor} />
                </Pressable>
             </View>
        ) : (
             <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 10 }}>
                <Text style={[
                    styles.topicName,
                    { color: themeTextColor },
                    item.isCompleted && { textDecorationLine: 'line-through', color: '#888' }
                ]}>
                    {item.order.toString().padStart(2, '0')} - {item.name}
                </Text>
                <View style={{ flexDirection: 'row' }}>
                    <Pressable onPress={() => { setEditingTopic(item); setEditingTopicName(item.name); }} style={{ marginRight: 8 }}>
                        <Ionicons name="pencil" size={20} color={themeTextColor} />
                    </Pressable>
                     <Pressable onPress={() => handleDeleteTopic(item.id)}>
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </Pressable>
                </View>
            </View>
        )}

    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={false} // Full screen modal
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: themeBackgroundColor }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: themeBorderColor, backgroundColor: themeCardColor }]}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={themeTextColor} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: themeTextColor }]}>{subject.name}</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={() => setIsEditingSubject(true)} style={{ marginRight: 16 }}>
                 <Ionicons name="pencil" size={24} color={themeTextColor} />
            </Pressable>
             <Pressable onPress={handleDeleteSubject}>
                 <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            </Pressable>
          </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
             {/* Subject Info */}
             <View style={[styles.infoCard, { backgroundColor: themeCardColor }]}>
                {subject.description ? (
                    <Text style={[styles.description, { color: '#888' }]}>{subject.description}</Text>
                ) : null}
                 <View style={styles.metaRow}>
                    <View style={[styles.badge, { backgroundColor: themeBackgroundColor }]}>
                        <Ionicons name="time-outline" size={14} color={themeTextColor} />
                        <Text style={[styles.badgeText, { color: themeTextColor }]}>{subject.studyDuration} min / sessão</Text>
                    </View>
                    {subject.materialUrl ? (
                         <Pressable onPress={() => Linking.openURL(subject.materialUrl)} style={[styles.badge, { backgroundColor: Colors[colorScheme ?? 'light'].tint + '20' }]}>
                            <Ionicons name="link" size={14} color={Colors[colorScheme ?? 'light'].tint} />
                            <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].tint }]}>Material</Text>
                        </Pressable>
                    ) : null}
                 </View>
             </View>

             {/* Topics List */}
             <View style={styles.topicsHeader}>
                 <Text style={[styles.sectionTitle, { color: themeTextColor }]}>Assuntos</Text>
                 <Text style={{ color: '#888' }}>
                     {subject.topics.filter((t: any) => t.isCompleted).length}/{subject.topics.length}
                 </Text>
             </View>

             {subject.topics.map((item: any) => (
                 <View key={item.id}>
                    {renderTopicItem({ item })}
                 </View>
             ))}

             {addingTopic ? (
                  <View style={[styles.addTopicContainer, { borderColor: themeBorderColor, backgroundColor: themeCardColor }]}>
                      <TextInput
                        value={newTopicName}
                        onChangeText={setNewTopicName}
                        placeholder="Nome do novo assunto"
                        placeholderTextColor={isDark ? '#666' : '#999'}
                        style={[styles.input, { color: themeTextColor, flex: 1, borderColor: themeBorderColor }]}
                        autoFocus
                      />
                      <Pressable onPress={handleAddTopic} style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
                          <Text style={{ color: 'white', fontWeight: 'bold' }}>Adicionar</Text>
                      </Pressable>
                      <Pressable onPress={() => { setAddingTopic(false); setNewTopicName(''); }} style={styles.cancelButton}>
                           <Ionicons name="close" size={24} color={themeTextColor} />
                      </Pressable>
                  </View>
             ) : (
                 <Pressable onPress={() => setAddingTopic(true)} style={[styles.addTopicButton, { borderColor: themeBorderColor }]}>
                     <Ionicons name="add" size={20} color={themeTextColor} />
                     <Text style={[styles.addTopicText, { color: themeTextColor }]}>Adicionar Assunto</Text>
                 </Pressable>
             )}

        </ScrollView>

        <SubjectFormModal
            visible={isEditingSubject}
            onClose={() => setIsEditingSubject(false)}
            onSave={handleUpdateSubject}
            subject={subject}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    paddingTop: 0, // Since it's a modal, we might need safe area handling if it was a stack, but default modal covers status bar differently.
  },
  closeButton: {
      padding: 8,
  },
  headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
  },
  headerActions: {
      flexDirection: 'row',
  },
  content: {
      flex: 1,
      padding: 16,
  },
  infoCard: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
  },
  description: {
      fontSize: 14,
      fontStyle: 'italic',
      marginBottom: 12,
  },
  metaRow: {
      flexDirection: 'row',
      gap: 8,
  },
  badge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
  },
  badgeText: {
      fontSize: 12,
      fontWeight: '600',
  },
  topicsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
  },
  topicItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
  },
  topicName: {
      fontSize: 16,
      flex: 1,
  },
  addTopicButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderRadius: 12,
      marginTop: 8,
  },
  addTopicText: {
      marginLeft: 8,
      fontWeight: '600',
  },
  addTopicContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      marginTop: 8,
      gap: 8,
  },
  input: {
      height: 40,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
  },
  addButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
  },
  cancelButton: {
      padding: 8,
  }
});
