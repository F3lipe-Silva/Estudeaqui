import 'react-native-get-random-values';
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStudy } from '../../contexts/study-context';
import { Plus, Trash2, Edit, BookCopy, ChevronDown, ChevronUp, CheckCircle, Circle, PlayCircle, ExternalLink, Folder, X, Clock } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280'];

export default function SubjectsScreen() {
  const { data, dispatch, startPomodoroForItem } = useStudy();
  const { subjects } = data;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  
  // Form States
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [description, setDescription] = useState('');
  const [studyDuration, setStudyDuration] = useState('60');
  const [materialUrl, setMaterialUrl] = useState('');
  
  // Topic Input
  const [newTopicName, setNewTopicName] = useState('');
  const [addingTopicTo, setAddingTopicTo] = useState<string | null>(null);

  // Topic Editing
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicName, setEditingTopicName] = useState('');

  // Topic Deletion
  const [deletingTopic, setDeletingTopic] = useState<{id: string, name: string, subjectId: string} | null>(null);

  // Subject Deletion
  const [deletingSubject, setDeletingSubject] = useState<{id: string, name: string, topicCount: number} | null>(null);

  const resetForm = () => {
    setName('');
    setColor(COLORS[0]);
    setDescription('');
    setStudyDuration('60');
    setMaterialUrl('');
    setEditingSubject(null);
  };

  const openModal = (subject?: any) => {
    if (subject) {
      setEditingSubject(subject);
      setName(subject.name);
      setColor(subject.color);
      setDescription(subject.description || '');
      setStudyDuration(subject.studyDuration?.toString() || '60');
      setMaterialUrl(subject.materialUrl || '');
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSaveSubject = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome da matéria é obrigatório.');
      return;
    }

    const subjectData = {
      name,
      color,
      description,
      studyDuration: Number(studyDuration) || 0,
      materialUrl,
    };

    if (editingSubject) {
      dispatch({ type: 'UPDATE_SUBJECT', payload: { id: editingSubject.id, data: subjectData } });
    } else {
      dispatch({ type: 'ADD_SUBJECT', payload: { ...subjectData, id: uuidv4() } });
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteSubject = (id: string, subjectName: string, topicCount: number) => {
    setDeletingSubject({ id, name: subjectName, topicCount });
  };

  const confirmDeleteSubject = () => {
    if (deletingSubject) {
      dispatch({ type: 'DELETE_SUBJECT', payload: deletingSubject.id });
      setDeletingSubject(null);
    }
  };

  const handleAddTopic = (subjectId: string) => {
    if (newTopicName.trim()) {
      dispatch({ type: 'ADD_TOPIC', payload: { subjectId, name: newTopicName, id: uuidv4() } });
      setNewTopicName('');
      setAddingTopicTo(null);
    }
  };

  const handleDeleteTopic = (subjectId: string, topicId: string, topicName: string) => {
    Alert.alert(
        'Remover Assunto',
        `Tem certeza que deseja remover "${topicName}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Remover', 
            style: 'destructive', 
            onPress: () => dispatch({ type: 'DELETE_TOPIC', payload: { subjectId, topicId } }) 
          }
        ]
      );
  };

  const toggleAccordion = (id: string) => {
    setExpandedSubjectId(prev => prev === id ? null : id);
  };

  const [selectedSubjectForLog, setSelectedSubjectForLog] = useState('');
  const [selectedTopicForLog, setSelectedTopicForLog] = useState('');
  const [durationForLog, setDurationForLog] = useState('');
  const [sourceForLog, setSourceForLog] = useState('site-questoes');
  const [startPageForLog, setStartPageForLog] = useState('');
  const [endPageForLog, setEndPageForLog] = useState('');
  const [questionsTotalForLog, setQuestionsTotalForLog] = useState('');
  const [questionsCorrectForLog, setQuestionsCorrectForLog] = useState('');

  const handleSaveStudyLog = () => {
    if (!selectedSubjectForLog || !selectedTopicForLog || !durationForLog) {
      Alert.alert('Erro', 'Preencha a matéria, o assunto e a duração corretamente.');
      return;
    }

    const logData = {
      subjectId: selectedSubjectForLog,
      topicId: selectedTopicForLog,
      duration: parseInt(durationForLog) || 0,
      startPage: parseInt(startPageForLog) || 0,
      endPage: parseInt(endPageForLog) || 0,
      questionsTotal: parseInt(questionsTotalForLog) || 0,
      questionsCorrect: parseInt(questionsCorrectForLog) || 0,
      source: sourceForLog,
    };

    dispatch({ type: 'ADD_STUDY_LOG', payload: logData });
    setIsStudyLogModalOpen(false);
    resetStudyLogForm();
  };

  const resetStudyLogForm = () => {
    setSelectedSubjectForLog('');
    setSelectedTopicForLog('');
    setDurationForLog('');
    setSourceForLog('site-questoes');
    setStartPageForLog('');
    setEndPageForLog('');
    setQuestionsTotalForLog('');
    setQuestionsCorrectForLog('');
  };

  const availableTopicsForLog = subjects.find(s => s.id === selectedSubjectForLog)?.topics || [];

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="px-4 py-6">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <View className="flex-row items-center mb-1">
              <BookCopy size={24} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <Text className={`text-2xl font-bold ml-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Matéria</Text>
            </View>
            <Text className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Gerencie seus estudos.
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => openModal()}
              className="bg-blue-600 p-3 rounded-full shadow-sm"
            >
              <Plus size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsStudyLogModalOpen(true)}
              className="bg-emerald-600 p-3 rounded-full shadow-sm flex-row items-center"
            >
              <Plus size={18} color="white" />
              <Text className="text-white text-xs ml-1">Sessão</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="gap-3">
          {subjects.length === 0 ? (
            <View className="p-8 items-center justify-center bg-slate-100/50 rounded-xl border border-slate-200 border-dashed">
              <Folder size={48} className="text-slate-300 mb-4" />
              <Text className="text-slate-500 text-center font-medium">Nenhuma matéria cadastrada.</Text>
              <Text className="text-slate-400 text-center text-sm mt-1">Toque no + para começar.</Text>
            </View>
          ) : (
            subjects.map(subject => {
              const isExpanded = expandedSubjectId === subject.id;
              const completedCount = subject.topics.filter(t => t.isCompleted).length;
              const totalCount = subject.topics.length;

              return (
                <View key={subject.id} className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                  <TouchableOpacity 
                    onPress={() => toggleAccordion(subject.id)}
                    className={`p-4 flex-row items-center justify-between ${isExpanded && (isDark ? 'bg-slate-800' : 'bg-slate-50/80')}`}
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="w-3 h-3 rounded-full mr-3 ring-2 ring-offset-1 ring-offset-white" style={{ backgroundColor: subject.color }} />
                      <Text className={`font-semibold text-lg flex-1 ${isDark ? 'text-slate-100' : 'text-slate-800'}`} numberOfLines={1}>{subject.name}</Text>
                      <View className={`px-2 py-1 rounded-md ml-2 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <Text className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{completedCount}/{totalCount}</Text>
                      </View>
                    </View>
                    {isExpanded ? (
                      <ChevronUp size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                    ) : (
                      <ChevronDown size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                    )}
                  </TouchableOpacity>

                  {isExpanded && (
                    <View className={`px-4 pb-4 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                      {subject.description ? (
                        <Text className="text-sm text-slate-500 mb-4 italic bg-slate-50 p-2 rounded">{subject.description}</Text>
                      ) : null}
                      
                      <View className="flex-row flex-wrap gap-2 mb-4 pb-4 border-b border-slate-100">
                        {subject.materialUrl ? (
                          <TouchableOpacity 
                            onPress={() => Linking.openURL(subject.materialUrl || '')}
                            className="flex-row items-center bg-slate-100 px-3 py-2 rounded-lg"
                          >
                            <ExternalLink size={14} className="text-slate-600 mr-2" />
                            <Text className="text-xs font-medium text-slate-700">Material</Text>
                          </TouchableOpacity>
                        ) : null}
                         <TouchableOpacity 
                            onPress={() => openModal(subject)}
                            className="flex-row items-center bg-slate-100 px-3 py-2 rounded-lg"
                          >
                            <Edit size={14} className="text-slate-600 mr-2" />
                            <Text className="text-xs font-medium text-slate-700">Editar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteSubject(subject.id, subject.name, subject.topics.length)}
                            className="flex-row items-center bg-red-50 px-3 py-2 rounded-lg"
                          >
                            <Trash2 size={14} className="text-red-600 mr-2" />
                            <Text className="text-xs font-medium text-red-700">Remover</Text>
                          </TouchableOpacity>
                      </View>

                      <View className="space-y-2">
                         {subject.topics.map(topic => (
                             <View key={topic.id} className="flex-row items-center bg-slate-50 p-2 rounded-lg border border-slate-100 justify-between">
                                 <View className="flex-row items-center flex-1 mr-2">
                                     <TouchableOpacity
                                        onPress={() => dispatch({ type: 'TOGGLE_TOPIC_COMPLETED', payload: { subjectId: subject.id, topicId: topic.id } })}
                                        className="mr-3"
                                     >
                                         {topic.isCompleted ? (
                                             <CheckCircle size={20} className="text-green-600" />
                                         ) : (
                                             <Circle size={20} className="text-slate-300" />
                                         )}
                                     </TouchableOpacity>
                                     <Text
                                        className={`text-sm font-medium flex-1 ${topic.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                                        numberOfLines={2}
                                     >
                                         {topic.name}
                                     </Text>
                                 </View>
                                 <View className="flex-row items-center gap-1">
                                     <TouchableOpacity
                                         onPress={() => {
                                           setEditingTopicId(topic.id);
                                           setEditingTopicName(topic.name);
                                         }}
                                         className="p-1.5 bg-blue-50 rounded-full"
                                     >
                                         <Edit size={18} className="text-blue-600" />
                                     </TouchableOpacity>
                                     <TouchableOpacity
                                         onPress={() => setDeletingTopic({id: topic.id, name: topic.name, subjectId: subject.id})}
                                         className="p-1.5"
                                     >
                                         <Trash2 size={16} className="text-red-400" />
                                     </TouchableOpacity>
                                 </View>
                             </View>
                         ))}

                         {addingTopicTo === subject.id ? (
                             <View className="flex-row items-center mt-2 gap-2">
                                 <TextInput 
                                     value={newTopicName}
                                     onChangeText={setNewTopicName}
                                     placeholder="Nome do assunto..."
                                     className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                     autoFocus
                                 />
                                 <TouchableOpacity 
                                     onPress={() => handleAddTopic(subject.id)}
                                     className="bg-blue-600 p-2 rounded-lg"
                                 >
                                     <Plus size={20} color="white" />
                                 </TouchableOpacity>
                                 <TouchableOpacity 
                                     onPress={() => setAddingTopicTo(null)}
                                     className="bg-slate-200 p-2 rounded-lg"
                                 >
                                     <X size={20} className="text-slate-600" />
                                 </TouchableOpacity>
                             </View>
                         ) : (
                             <TouchableOpacity 
                                 onPress={() => setAddingTopicTo(subject.id)}
                                 className="flex-row items-center justify-center p-3 mt-2 border border-dashed border-slate-300 rounded-lg bg-slate-50/50"
                             >
                                 <Plus size={16} className="text-slate-500 mr-2" />
                                 <Text className="text-slate-500 text-sm font-medium">Adicionar Assunto</Text>
                             </TouchableOpacity>
                         )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-slate-900' : 'bg-white'} max-h-[90%]`}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {editingSubject ? 'Editar Matéria' : 'Nova Matéria'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={24} className="text-slate-400" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-slate-500 mb-1">Nome</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    placeholder="Ex: Direito Constitucional"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-slate-500 mb-1">Descrição (Opcional)</Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    placeholder="Breve descrição..."
                    placeholderTextColor="#94a3b8"
                    multiline
                  />
                </View>

                 <View>
                  <Text className="text-sm font-medium text-slate-500 mb-1">URL do Material (Opcional)</Text>
                  <TextInput
                    value={materialUrl}
                    onChangeText={setMaterialUrl}
                    className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    placeholder="https://..."
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>

                <View>
                   <Text className="text-sm font-medium text-slate-500 mb-1">Duração da Sessão (min)</Text>
                   <View className="flex-row items-center">
                       <Clock size={18} className="text-slate-400 absolute left-3 z-10" />
                       <TextInput
                        value={studyDuration}
                        onChangeText={setStudyDuration}
                        className={`flex-1 p-3 pl-10 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        keyboardType="numeric"
                      />
                   </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-slate-500 mb-2">Cor</Text>
                  <View className="flex-row flex-wrap gap-3">
                    {COLORS.map(c => (
                      <TouchableOpacity
                        key={c}
                        onPress={() => setColor(c)}
                        className={`w-10 h-10 rounded-full border-4 ${color === c ? 'border-slate-300' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSaveSubject}
                  className="bg-blue-600 p-4 rounded-xl items-center mt-4 mb-6"
                >
                  <Text className="text-white font-bold text-lg">Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Topic Modal */}
      <Modal
        visible={editingTopicId !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingTopicId(null)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-slate-900' : 'bg-white'} max-h-[50%]`}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Editar Assunto
              </Text>
              <TouchableOpacity onPress={() => setEditingTopicId(null)}>
                <X size={24} className="text-slate-400" />
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-slate-500 mb-1">Nome do Assunto</Text>
                <TextInput
                  value={editingTopicName}
                  onChangeText={setEditingTopicName}
                  className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  placeholder="Nome do assunto..."
                  placeholderTextColor="#94a3b8"
                  autoFocus
                />
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (editingTopicName.trim()) {
                    const topicToEdit = subjects.flatMap(s => s.topics).find(t => t.id === editingTopicId);
                    if (topicToEdit) {
                      const subject = subjects.find(s => s.id === topicToEdit.subjectId);
                      if (subject) {
                        const updatedTopic = { ...topicToEdit, name: editingTopicName.trim() };
                        const updatedSubject = {
                          ...subject,
                          topics: subject.topics.map(t => t.id === editingTopicId ? updatedTopic : t)
                        };
                        dispatch({
                          type: 'UPDATE_SUBJECT',
                          payload: { id: subject.id, data: { topics: updatedSubject.topics } }
                        });
                      }
                    }
                    setEditingTopicId(null);
                  }
                }}
                className="bg-blue-600 p-4 rounded-xl items-center mt-4"
              >
                <Text className="text-white font-bold text-lg">Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Topic Modal */}
      <Modal
        visible={deletingTopic !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDeletingTopic(null)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-slate-900' : 'bg-white'} max-h-[40%]`}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Remover Assunto
              </Text>
              <TouchableOpacity onPress={() => setDeletingTopic(null)}>
                <X size={24} className="text-slate-400" />
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <Text className={`text-base ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                Tem certeza que deseja remover "{deletingTopic?.name}"?
              </Text>

              <View className="flex-row gap-3 mt-6">
                <TouchableOpacity
                  onPress={() => setDeletingTopic(null)}
                  className={`flex-1 p-4 rounded-xl items-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                >
                  <Text className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (deletingTopic) {
                      dispatch({ type: 'DELETE_TOPIC', payload: { subjectId: deletingTopic.subjectId, topicId: deletingTopic.id } });
                      setDeletingTopic(null);
                    }
                  }}
                  className="flex-1 bg-red-600 p-4 rounded-xl items-center"
                >
                  <Text className="text-white font-bold">Remover</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      {/* Delete Subject Modal */}
      <Modal
        visible={deletingSubject !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDeletingSubject(null)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-slate-900' : 'bg-white'} max-h-[45%]`}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Remover Matéria
              </Text>
              <TouchableOpacity onPress={() => setDeletingSubject(null)}>
                <X size={24} className="text-slate-400" />
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <Text className={`text-base ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                Tem certeza que deseja remover "{deletingSubject?.name}" e todos os seus {deletingSubject?.topicCount} assuntos?
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Esta ação não pode ser desfeita.
              </Text>

              <View className="flex-row gap-3 mt-6">
                <TouchableOpacity
                  onPress={() => setDeletingSubject(null)}
                  className={`flex-1 p-4 rounded-xl items-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                >
                  <Text className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmDeleteSubject}
                  className="flex-1 bg-red-600 p-4 rounded-xl items-center"
                >
                  <Text className="text-white font-bold">Remover</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
