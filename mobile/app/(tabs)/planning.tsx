import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStudy } from '../../contexts/study-context';
import { Calendar, PlusCircle, Trash2, RotateCcw, Save, X, Pencil, ArrowUp, ArrowDown, Upload } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Picker } from '@react-native-picker/picker';
import { StudySequenceItem } from '../../lib/types';
import { v4 as uuidv4 } from 'uuid';
import StudyLogForm from '../../components/study-log-form';

export default function PlanningScreen() {
  const { data, dispatch } = useStudy();
  const { subjects, studySequence, sequenceIndex } = data;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [isEditing, setIsEditing] = useState(false);
  const [editingSequence, setEditingSequence] = useState<StudySequenceItem[]>([]);
  const [selectedSubjectToAdd, setSelectedSubjectToAdd] = useState<string>('');

  // Custom popup states
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Study log form state
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [logInitialData, setLogInitialData] = useState<{ subjectId: string, sequenceItemIndex: number } | undefined>(undefined);

  useEffect(() => {
    if (studySequence) {
      setEditingSequence(studySequence.sequence);
    }
  }, [studySequence]);

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

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
    if (!selectedSubjectToAdd) {
      Alert.alert('Erro', 'Selecione uma matéria para adicionar.');
      return;
    }
    // In Web version we check for duplicates, but allowing duplicates might be desired for some flows.
    // Web version check:
    // const existingItem = editingSequence.find(item => item.subjectId === selectedSubjectToAdd);
    // if (existingItem) ...
    
    setEditingSequence(prev => [...prev, { subjectId: selectedSubjectToAdd, totalTimeStudied: 0 }]);
    setSelectedSubjectToAdd('');
  };

  const handleCreateEmptySequence = () => {
    const newSequence = {
      id: uuidv4(),
      name: "Plano de Estudos Manual",
      sequence: subjects.map(s => ({ subjectId: s.id, totalTimeStudied: 0 })),
    };
    dispatch({ type: 'SAVE_STUDY_SEQUENCE', payload: newSequence });
  };

  const handleResetSequence = () => {
    setShowResetDialog(true);
  };

  const confirmResetSequence = () => {
    dispatch({ type: 'RESET_STUDY_SEQUENCE' });
    setShowResetDialog(false);
  };

  const handleDeleteSequence = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteSequence = () => {
    dispatch({ type: 'SAVE_STUDY_SEQUENCE', payload: null });
    setIsEditing(false);
    setShowDeleteDialog(false);
  };

  const openLogForm = (subjectId: string, sequenceItemIndex: number) => {
    setLogInitialData({ subjectId, sequenceItemIndex });
    setIsLogFormOpen(true);
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="px-4 py-6">
        <View className="mb-6">
          <View className="flex-row items-center mb-1">
            <Calendar size={24} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
            <Text className={`text-2xl font-bold ml-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Plano de Estudos</Text>
          </View>
          <Text className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            Organize sua sequência de matérias.
          </Text>
        </View>

        {!studySequence ? (
          <View className={`p-8 items-center justify-center rounded-xl border border-dashed ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
             <Calendar size={48} className="text-slate-300 mb-4" />
             <Text className="text-slate-500 text-center font-medium mb-4">Você ainda não tem um plano ativo.</Text>
             <TouchableOpacity 
                onPress={handleCreateEmptySequence}
                className="bg-blue-600 px-6 py-3 rounded-full shadow-sm"
             >
                 <Text className="text-white font-bold">Criar Plano Básico</Text>
             </TouchableOpacity>
          </View>
        ) : (
          <View>
             <View className={`p-4 rounded-xl border mb-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1 mr-4">
                        <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{studySequence.name}</Text>
                        <Text className="text-slate-500 text-xs mt-1">
                            {isEditing ? 'Editando sequência...' : 'Conclua cada sessão para avançar.'}
                        </Text>
                    </View>
                    {isEditing ? (
                        <View className="flex-row gap-2">
                             <TouchableOpacity onPress={handleSaveSequence} className="p-2 bg-blue-100 rounded-lg">
                                 <Save size={20} className="text-blue-600" />
                             </TouchableOpacity>
                             <TouchableOpacity onPress={handleEditToggle} className="p-2 bg-slate-100 rounded-lg">
                                 <X size={20} className="text-slate-600" />
                             </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="flex-row gap-2">
                             <TouchableOpacity onPress={handleResetSequence} className="p-2 bg-slate-100 rounded-lg">
                                 <RotateCcw size={20} className="text-slate-600" />
                             </TouchableOpacity>
                             <TouchableOpacity onPress={handleEditToggle} className="p-2 bg-slate-100 rounded-lg">
                                 <Pencil size={20} className="text-slate-600" />
                             </TouchableOpacity>
                             <TouchableOpacity onPress={handleDeleteSequence} className="p-2 bg-red-50 rounded-lg">
                                 <Trash2 size={20} className="text-red-600" />
                             </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View className="space-y-3">
                    {(isEditing ? editingSequence : studySequence.sequence).map((item, index) => {
                        const subject = getSubjectById(item.subjectId);
                        if (!subject) return null;

                        const isCurrent = index === sequenceIndex && !isEditing;
                        const timeStudied = item.totalTimeStudied || 0;
                        const timeGoal = subject.studyDuration || 60;
                        const isCompleted = timeStudied >= timeGoal;

                        return (
                            <View 
                                key={`${item.subjectId}-${index}`} 
                                className={`flex-row items-center p-3 rounded-xl border ${
                                    isCurrent 
                                        ? 'border-blue-500 bg-blue-50/50' 
                                        : (isCompleted && !isEditing 
                                            ? (isDark ? 'bg-green-900/20 border-green-900/50' : 'bg-green-50 border-green-200')
                                            : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100')
                                        )
                                }`}
                            >
                                <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${isCurrent ? 'bg-blue-600' : (isCompleted ? 'bg-green-500' : 'bg-slate-200')}`}>
                                    <Text className={`text-xs font-bold ${isCurrent || isCompleted ? 'text-white' : 'text-slate-600'}`}>{index + 1}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{subject.name}</Text>
                                    <View className="mt-1">
                                        <View className="flex-row justify-between mb-1">
                                            <Text className="text-xs text-slate-500">{timeStudied} / {timeGoal} min</Text>
                                        </View>
                                        <View className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                            <View
                                                className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                                style={{ width: `${Math.min(100, (timeStudied / timeGoal) * 100)}%` }}
                                            />
                                        </View>
                                    </View>
                                </View>

                                {isEditing && (
                                    <View className="flex-row gap-1">
                                        <TouchableOpacity onPress={() => moveSequenceItem(index, index - 1)} disabled={index === 0} className="p-1.5 bg-slate-100 rounded">
                                            <ArrowUp size={16} className="text-slate-600" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => moveSequenceItem(index, index + 1)} disabled={index === editingSequence.length - 1} className="p-1.5 bg-slate-100 rounded">
                                            <ArrowDown size={16} className="text-slate-600" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteSequenceItem(index)} className="p-1.5 bg-red-50 rounded">
                                            <Trash2 size={16} className="text-red-500" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {!isEditing && (
                                    <TouchableOpacity
                                      onPress={() => openLogForm(subject.id, index)}
                                      className="ml-2 px-3 py-1.5 bg-blue-600 rounded-lg"
                                    >
                                      <Text className="text-white text-xs font-medium">Registrar</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
                </View>
                
                {isEditing && (
                    <View className={`mt-4 p-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <Text className="text-sm font-medium text-slate-500 mb-2">Adicionar Matéria</Text>
                        <View className={`rounded-lg border overflow-hidden mb-2 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}>
                             <Picker
                                selectedValue={selectedSubjectToAdd}
                                onValueChange={setSelectedSubjectToAdd}
                                style={{ color: isDark ? 'white' : 'black' }}
                                dropdownIconColor={isDark ? 'white' : 'black'}
                            >
                                <Picker.Item label="Selecione..." value="" />
                                {subjects.map(s => (
                                    <Picker.Item key={s.id} label={s.name} value={s.id} />
                                ))}
                            </Picker>
                        </View>
                        <TouchableOpacity 
                            onPress={handleAddSubjectToSequence}
                            disabled={!selectedSubjectToAdd}
                            className={`flex-row items-center justify-center py-3 rounded-lg ${!selectedSubjectToAdd ? 'bg-slate-200' : 'bg-blue-600'}`}
                        >
                            <PlusCircle size={18} color={!selectedSubjectToAdd ? '#94a3b8' : 'white'} className="mr-2" />
                            <Text className={`font-bold ${!selectedSubjectToAdd ? 'text-slate-400' : 'text-white'}`}>Adicionar à Sequência</Text>
                        </TouchableOpacity>
                    </View>
                )}

             </View>
          </View>
        )}

        {/* Reset Sequence Confirmation Modal */}
        <Modal
          visible={showResetDialog}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowResetDialog(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-slate-900' : 'bg-white'} max-h-[40%]`}>
              <View className="flex-row justify-between items-center mb-6">
                <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Reiniciar Ciclo
                </Text>
                <TouchableOpacity onPress={() => setShowResetDialog(false)}>
                  <X size={24} className="text-slate-400" />
                </TouchableOpacity>
              </View>

              <View className="space-y-4">
                <Text className={`text-base ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Isto irá zerar o progresso de tempo estudado de todas as sessões e voltar ao início da sequência.
                </Text>
                <Text className={`text-base ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  A ordem das matérias será mantida.
                </Text>

                <View className="flex-row gap-3 mt-6">
                  <TouchableOpacity
                    onPress={() => setShowResetDialog(false)}
                    className={`flex-1 p-4 rounded-xl items-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                  >
                    <Text className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmResetSequence}
                    className="flex-1 bg-blue-600 p-4 rounded-xl items-center"
                  >
                    <Text className="text-white font-bold">Reiniciar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Sequence Confirmation Modal */}
        <Modal
          visible={showDeleteDialog}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDeleteDialog(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-slate-900' : 'bg-white'} max-h-[40%]`}>
              <View className="flex-row justify-between items-center mb-6">
                <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Apagar Plano
                </Text>
                <TouchableOpacity onPress={() => setShowDeleteDialog(false)}>
                  <X size={24} className="text-slate-400" />
                </TouchableOpacity>
              </View>

              <View className="space-y-4">
                <Text className={`text-base ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Tem certeza que deseja apagar sua sequência de estudos atual?
                </Text>
                <Text className={`text-base ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Você precisará gerar uma nova sequência.
                </Text>

                <View className="flex-row gap-3 mt-6">
                  <TouchableOpacity
                    onPress={() => setShowDeleteDialog(false)}
                    className={`flex-1 p-4 rounded-xl items-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                  >
                    <Text className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmDeleteSequence}
                    className="flex-1 bg-red-600 p-4 rounded-xl items-center"
                  >
                    <Text className="text-white font-bold">Apagar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Study Log Form Modal */}
        <Modal
          visible={isLogFormOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsLogFormOpen(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-slate-900' : 'bg-white'} max-h-[90%]`}>
              <View className="flex-row justify-between items-center mb-6">
                <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Registrar Sessão de Estudo
                </Text>
                <TouchableOpacity onPress={() => setIsLogFormOpen(false)}>
                  <X size={24} className="text-slate-400" />
                </TouchableOpacity>
              </View>

              <View className="flex-1">
                <StudyLogForm
                  onSave={() => setIsLogFormOpen(false)}
                  onCancel={() => setIsLogFormOpen(false)}
                  initialData={logInitialData}
                />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
