import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStudy } from '../../contexts/study-context';
import StudyLogForm from '../../components/study-log-form';
import { FileClock, Plus, Calendar, Clock, Book, Target, Percent, Edit, Trash2, Repeat, X } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { useColorScheme } from 'nativewind';

export default function HistoryScreen() {
  const { data, dispatch } = useStudy();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);

  const getSubjectName = (id: string) => data.subjects.find(s => s.id === id)?.name || 'N/A';
  const getTopicName = (subjectId: string, topicId: string) => data.subjects.find(s => s.id === subjectId)?.topics.find(t => t.id === topicId)?.name || 'N/A';

  const getSourceDisplayName = (source?: string) => {
      if (!source || source === 'site-questoes') return 'Questões';
      if (['A', 'B', 'C', 'D'].includes(source)) return `Rev. ${source}`;
      return source;
  }

  const handleEdit = (log: any) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingLog(null);
    setIsModalOpen(true);
  };

  const handleDelete = (logId: string) => {
    Alert.alert(
      'Remover Registro',
      'Tem certeza que deseja apagar este registro de estudo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Apagar', 
          style: 'destructive', 
          onPress: () => dispatch({ type: 'DELETE_STUDY_LOG', payload: logId }) 
        }
      ]
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="px-4 py-6">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <View className="flex-row items-center mb-1">
              <FileClock size={24} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <Text className={`text-2xl font-bold ml-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Histórico</Text>
            </View>
            <Text className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Seus registros de estudo.
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleAddNew}
            className="bg-blue-600 p-3 rounded-full shadow-sm"
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="gap-4">
          {data.studyLog.length === 0 ? (
            <View className="p-8 items-center justify-center bg-slate-100/50 rounded-xl border border-slate-200 border-dashed">
               <FileClock size={48} className="text-slate-300 mb-4" />
               <Text className="text-slate-500 text-center font-medium">Nenhum registro encontrado.</Text>
               <Text className="text-slate-400 text-center text-sm mt-1">Registre sua primeira sessão!</Text>
            </View>
          ) : (
            data.studyLog.map(log => {
              const pagesRead = log.endPage > 0 ? log.endPage - log.startPage + 1 : 0;
              const accuracy = log.questionsTotal > 0 ? (log.questionsCorrect / log.questionsTotal) * 100 : 0;
              
              return (
                <View key={log.id} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                   <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1 mr-2">
                          <Text className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`} numberOfLines={1}>
                            {getSubjectName(log.subjectId)}
                          </Text>
                          <Text className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`} numberOfLines={1}>
                            {getTopicName(log.subjectId, log.topicId)}
                          </Text>
                      </View>
                      <View className={`flex-row items-center px-2 py-1 rounded-md ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                          <Calendar size={12} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                          <Text className={`text-xs ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {format(parseISO(log.date), "dd/MM HH:mm")}
                          </Text>
                      </View>
                   </View>

                   <View className="flex-row flex-wrap gap-2 mb-3">
                      <View className={`flex-row items-center p-2 rounded-lg flex-1 min-w-[45%] ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                          <Repeat size={16} className="text-blue-500 mr-2" />
                          <View>
                              <Text className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{getSourceDisplayName(log.source)}</Text>
                              <Text className="text-[10px] text-slate-400 uppercase">Fonte</Text>
                          </View>
                      </View>
                      
                      <View className={`flex-row items-center p-2 rounded-lg flex-1 min-w-[45%] ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                          <Clock size={16} className="text-blue-500 mr-2" />
                          <View>
                              <Text className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{log.duration} min</Text>
                              <Text className="text-[10px] text-slate-400 uppercase">Duração</Text>
                          </View>
                      </View>

                      {pagesRead > 0 && (
                        <View className={`flex-row items-center p-2 rounded-lg flex-1 min-w-[45%] ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                            <Book size={16} className="text-blue-500 mr-2" />
                            <View>
                                <Text className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{pagesRead} pág.</Text>
                                <Text className="text-[10px] text-slate-400 uppercase">Leitura</Text>
                            </View>
                        </View>
                      )}
                      
                      {log.questionsTotal > 0 && (
                        <>
                            <View className={`flex-row items-center p-2 rounded-lg flex-1 min-w-[45%] ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                <Target size={16} className="text-blue-500 mr-2" />
                                <View>
                                    <Text className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{log.questionsCorrect}/{log.questionsTotal}</Text>
                                    <Text className="text-[10px] text-slate-400 uppercase">Questões</Text>
                                </View>
                            </View>
                            <View className={`flex-row items-center p-2 rounded-lg flex-1 min-w-[45%] ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                <Percent size={16} className="text-blue-500 mr-2" />
                                <View>
                                    <Text className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{accuracy.toFixed(0)}%</Text>
                                    <Text className="text-[10px] text-slate-400 uppercase">Acertos</Text>
                                </View>
                            </View>
                        </>
                      )}
                   </View>

                   <View className="flex-row justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                       <TouchableOpacity onPress={() => handleEdit(log)} className="flex-row items-center px-2 py-1">
                           <Edit size={16} className="text-slate-400 mr-1" />
                           <Text className="text-xs text-slate-500 font-medium">Editar</Text>
                       </TouchableOpacity>
                       <TouchableOpacity onPress={() => handleDelete(log.id)} className="flex-row items-center px-2 py-1">
                           <Trash2 size={16} className="text-red-400 mr-1" />
                           <Text className="text-xs text-red-500 font-medium">Remover</Text>
                       </TouchableOpacity>
                   </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
         <View className="flex-1 justify-end bg-black/50">
            <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-slate-900' : 'bg-white'} h-[85%]`}>
               <View className="flex-row justify-between items-center mb-4">
                  <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {editingLog ? 'Editar Registro' : 'Registrar Estudo'}
                  </Text>
                  <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                    <X size={24} className="text-slate-400" />
                  </TouchableOpacity>
               </View>
               <StudyLogForm 
                 onSave={() => setIsModalOpen(false)} 
                 onCancel={() => setIsModalOpen(false)} 
                 existingLog={editingLog} 
               />
            </View>
         </View>
      </Modal>
    </SafeAreaView>
  );
}
