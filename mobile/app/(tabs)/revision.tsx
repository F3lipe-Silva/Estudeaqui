import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStudy } from '../../contexts/study-context';
import { REVISION_SEQUENCE } from '../../constants/revision-sequence';
import { History, ChevronDown, ChevronUp, Check } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

export default function RevisionScreen() {
  const { data, dispatch } = useStudy();
  const { subjects } = data;
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleToggleStep = (subjectId: string, newProgress: number) => {
    dispatch({ type: 'SET_REVISION_PROGRESS', payload: { subjectId, progress: newProgress } });
  };

  const toggleAccordion = (id: string) => {
    setExpandedSubjectId(prev => prev === id ? null : id);
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="px-4 py-6">
        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <History size={24} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
            <Text className={`text-2xl font-bold ml-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Revisão</Text>
          </View>
          <Text className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            Siga a sequência para consolidar seu aprendizado.
          </Text>
        </View>

        <View className="gap-3">
          {subjects.map(subject => {
            const completedTopics = subject.topics.filter(t => t.isCompleted);
            if (completedTopics.length === 0) return null;

            const revisionSequence = REVISION_SEQUENCE
              .map(topicOrder => completedTopics.find(t => t.order === topicOrder))
              .filter((topic): topic is NonNullable<typeof topic> => topic !== undefined);

            if (revisionSequence.length === 0) return null;

            const isExpanded = expandedSubjectId === subject.id;
            const progress = subject.revisionProgress;
            const total = revisionSequence.length;

            return (
              <View key={subject.id} className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <TouchableOpacity 
                  onPress={() => toggleAccordion(subject.id)}
                  className={`p-4 flex-row items-center justify-between ${isExpanded && (isDark ? 'bg-slate-800' : 'bg-slate-50')}`}
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: subject.color }} />
                    <Text className={`font-semibold text-base flex-1 ${isDark ? 'text-slate-100' : 'text-slate-800'}`} numberOfLines={1}>{subject.name}</Text>
                    <View className={`px-2 py-1 rounded-md ml-2 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <Text className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{progress} / {total}</Text>
                    </View>
                  </View>
                  {isExpanded ? (
                    <ChevronUp size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                  ) : (
                    <ChevronDown size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View className={`p-3 flex-row flex-wrap gap-2 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                    {revisionSequence.map((topic, index) => {
                      const isCompleted = index < progress;
                      const isCurrent = index === progress;
                      
                      const handleToggle = () => {
                        if (isCurrent) {
                          handleToggleStep(subject.id, progress + 1);
                        } else if (isCompleted && index === progress - 1) {
                          handleToggleStep(subject.id, progress - 1);
                        }
                      };

                      return (
                        <RevisionBox
                          key={`${topic.id}-${index}`}
                          topicOrder={topic.order}
                          topicName={topic.name}
                          isCompleted={isCompleted}
                          isCurrent={isCurrent}
                          onToggle={handleToggle}
                          isDark={isDark}
                        />
                      );
                    })}
                    
                    {progress >= total && (
                      <View className="w-full p-3 bg-green-100 rounded-lg mt-2 items-center">
                        <Text className="text-green-800 font-medium text-center">Ciclo concluído! 🎉</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
          
          {subjects.every(s => s.topics.filter(t => t.isCompleted).length === 0) && (
             <View className="p-8 items-center justify-center">
               <Text className="text-slate-400 text-center">Complete tópicos nos seus estudos para iniciar o ciclo de revisões.</Text>
             </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RevisionBox({ topicOrder, topicName, isCompleted, isCurrent, onToggle, isDark }: any) {
  const canClick = isCurrent || isCompleted;
  
  return (
    <View className={`
      w-[31%] p-2 rounded-lg border h-24 justify-between items-center mb-1
      ${isCompleted 
        ? (isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200') 
        : (isCurrent 
            ? (isDark ? 'bg-slate-800 border-blue-500 shadow-sm shadow-blue-500/20' : 'bg-white border-blue-500 shadow-sm') 
            : (isDark ? 'bg-slate-800/50 border-slate-700 opacity-50' : 'bg-slate-50 border-slate-100 opacity-60')
          )
      }
    `}>
      <View className="items-center w-full">
        <View className={`
          w-5 h-5 rounded-full items-center justify-center mb-1
          ${isCompleted 
            ? (isDark ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-700')
            : (isCurrent 
                ? 'bg-blue-600' 
                : (isDark ? 'bg-slate-700' : 'bg-slate-200')
              )
          }
        `}>
          <Text className={`text-[10px] font-bold ${isCurrent ? 'text-white' : (isCompleted ? (isDark ? 'text-green-100' : 'text-green-700') : (isDark ? 'text-slate-400' : 'text-slate-600'))}`}>
            {topicOrder}
          </Text>
        </View>
        <Text 
          numberOfLines={2} 
          className={`text-[9px] text-center leading-tight ${isCompleted ? (isDark ? 'text-green-200' : 'text-green-800') : (isDark ? 'text-slate-300' : 'text-slate-700')}`}
        >
          {topicName}
        </Text>
      </View>

      {isCurrent ? (
        <TouchableOpacity 
          onPress={onToggle}
          className="w-full bg-blue-600 py-1 rounded flex-row items-center justify-center"
        >
          <Check size={10} color="white" className="mr-1" />
          <Text className="text-white text-[9px] font-bold uppercase">OK</Text>
        </TouchableOpacity>
      ) : isCompleted ? (
        <TouchableOpacity onPress={canClick ? onToggle : undefined} className={`w-full py-1 rounded items-center justify-center ${isDark ? 'bg-green-900/40' : 'bg-green-100'}`}>
           <View className="flex-row items-center">
             <Check size={10} className={isDark ? 'text-green-400' : 'text-green-700'} />
             <Text className={`text-[9px] font-bold uppercase ml-1 ${isDark ? 'text-green-400' : 'text-green-700'}`}>Feito</Text>
           </View>
        </TouchableOpacity>
      ) : (
        <View className="w-full py-1 items-center">
           <Text className={`text-[8px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>Aguardando</Text>
        </View>
      )}
    </View>
  );
}
