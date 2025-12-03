import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStudy } from '../../contexts/study-context';
import { Clock, Zap, Target, BookOpen, Repeat, PlusCircle, Percent, ChevronRight, LogOut, Sun, Moon } from 'lucide-react-native';
import { isToday, isThisWeek, parseISO } from 'date-fns';
import { REVISION_SEQUENCE } from '../../constants/revision-sequence';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useAuth } from '../../contexts/auth-context';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { data, setActiveTab, dispatch } = useStudy();
  const { subjects, studyLog, streak, studySequence, sequenceIndex } = data;
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { logOut } = useAuth();

  const handleStartSession = () => {
    if (nextSubject) {
      // Navigate to planning tab to continue studying
      setActiveTab('planning'); // This will navigate to the planning screen
    } else {
      // Navigate to planning tab if no specific subject
      setActiveTab('planning');
    }
  };
  
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const secondaryTextColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardBg = isDark ? 'bg-slate-800' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';

  const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);
  const completedTopics = subjects.reduce((acc, s) => acc + s.topics.filter(t => t.isCompleted).length, 0);

  const timeToday = useMemo(() => studyLog
    .filter(log => isToday(parseISO(log.date)))
    .reduce((acc, log) => acc + log.duration, 0), [studyLog]);

  const timeThisWeek = useMemo(() => studyLog
    .filter(log => isThisWeek(parseISO(log.date), { weekStartsOn: 1 }))
    .reduce((acc, log) => acc + log.duration, 0), [studyLog]);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const getNextStudyInfo = () => {
    if (!studySequence || studySequence.sequence.length === 0) {
      return { nextSubject: null, sequenceItem: null, pendingRevisionTopic: null };
    }
    const sequenceItem = studySequence.sequence[sequenceIndex];
    if (!sequenceItem) return { nextSubject: null, sequenceItem: null, pendingRevisionTopic: null };

    const nextSubject = subjects.find(s => s.id === sequenceItem.subjectId);
    if (!nextSubject) return { nextSubject: null, sequenceItem: null, pendingRevisionTopic: null };

    const completedTopicsInSubject = nextSubject.topics.filter(t => t.isCompleted);
    let pendingRevisionTopic = null;
    if (completedTopicsInSubject.length > 0) {
      const relevantSequence = REVISION_SEQUENCE.filter(topicOrder => completedTopicsInSubject.find(t => t.order === topicOrder));
      if (nextSubject.revisionProgress < relevantSequence.length) {
        const currentTopicOrder = relevantSequence[nextSubject.revisionProgress];
        pendingRevisionTopic = completedTopicsInSubject.find(t => t.order === currentTopicOrder) || null;
      }
    }

    return { nextSubject, sequenceItem, pendingRevisionTopic };
  };

  const { nextSubject, sequenceItem, pendingRevisionTopic } = getNextStudyInfo();

  const timeStudied = sequenceItem?.totalTimeStudied || 0;
  const timeGoal = nextSubject?.studyDuration || 0;
  const progress = timeGoal > 0 ? (timeStudied / timeGoal) * 100 : 0;

  const chartData = subjects.map(subject => {
    const totalTime = studyLog
      .filter(log => log.subjectId === subject.id)
      .reduce((acc, log) => acc + log.duration, 0);
    return {
      name: subject.name,
      minutes: Math.round(totalTime),
      color: subject.color,
    };
  });

  const accuracyChartData = useMemo(() => {
    return subjects.map(subject => {
      const relevantLogs = studyLog.filter(log => log.subjectId === subject.id && log.questionsTotal > 0);
      if (relevantLogs.length === 0) {
        return { name: subject.name, accuracy: 0, color: subject.color };
      }
      const totalCorrect = relevantLogs.reduce((acc, log) => acc + log.questionsCorrect, 0);
      const totalQuestions = relevantLogs.reduce((acc, log) => acc + log.questionsTotal, 0);
      const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
      return { name: subject.name, accuracy: Math.round(accuracy), color: subject.color };
    }).filter(d => d.accuracy > 0);
  }, [studyLog, subjects]);

  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const formattedDate = today.toLocaleDateString('pt-BR', dateOptions);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-5 py-6">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className={`text-2xl font-bold ${textColor}`}>Olá, Estudante! 👋</Text>
              <Text className={`text-base capitalize ${secondaryTextColor}`}>{formattedDate}</Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={toggleColorScheme}
                className={`p-2 rounded-full ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}
              >
                {isDark ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} color="#64748b" />}
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={logOut}
                className={`p-2 rounded-full ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}
              >
                <LogOut size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Métricas */}
          <View className="flex-row flex-wrap justify-between gap-3 mb-6">
            <MetricCard 
              title="Hoje" 
              value={formatTime(timeToday)} 
              icon={Clock} 
              color="text-blue-500" 
              borderColor="border-l-blue-500"
              isDark={isDark}
            />
            <MetricCard 
              title="Semana" 
              value={formatTime(timeThisWeek)} 
              icon={Clock} 
              color="text-indigo-500" 
              borderColor="border-l-indigo-500"
              isDark={isDark}
            />
            <MetricCard 
              title="Streak" 
              value={`${streak} dias`} 
              icon={Zap} 
              color="text-yellow-500" 
              borderColor="border-l-yellow-500"
              isDark={isDark}
            />
            <MetricCard 
              title="Tópicos" 
              value={`${completedTopics}/${totalTopics}`} 
              icon={Target} 
              color="text-green-500" 
              borderColor="border-l-green-500"
              isDark={isDark}
            />
          </View>

          {/* Próximo Passo */}
          <TouchableOpacity
            className="mb-6"
            onPress={handleStartSession}
          >
            <Text className={`text-lg font-semibold mb-3 ${textColor}`}>Continuar Estudando</Text>
            <View className={`rounded-xl p-5 shadow-sm border ${cardBg} ${borderColor} ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
                  <BookOpen size={24} color="#2563eb" />
                </View>
                <View className="flex-1">
                  {nextSubject ? (
                    <>
                      <Text className={`text-lg font-bold ${textColor}`}>{nextSubject.name}</Text>
                      {pendingRevisionTopic ? (
                        <View className="flex-row items-center mt-1">
                          <Repeat size={14} color="#64748b" />
                          <Text className="text-slate-500 text-sm ml-1">Revisão: {pendingRevisionTopic.name}</Text>
                        </View>
                      ) : (
                        <Text className="text-slate-500 text-sm mt-1">Sequência de Estudo</Text>
                      )}
                    </>
                  ) : (
                    <Text className="text-lg font-semibold text-slate-500">Crie seu plano de estudos!</Text>
                  )}
                </View>
              </View>

              {nextSubject && timeGoal > 0 && (
                <View className="mb-4">
                   <View className="flex-row justify-between mb-2">
                    <Text className="text-slate-500 text-xs">Progresso</Text>
                    <Text className={`text-xs font-medium ${textColor}`}>{Math.round(progress)}%</Text>
                  </View>
                  <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </View>
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-slate-400 text-xs">{timeStudied} min</Text>
                    <Text className="text-slate-400 text-xs">Meta: {timeGoal} min</Text>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Progresso por Matéria */}
          <View className="mb-6">
            <Text className={`text-lg font-semibold mb-3 ${textColor}`}>Progresso por Matéria</Text>
            <View className={`rounded-xl p-4 shadow-sm border ${cardBg} ${borderColor}`}>
              {subjects.slice(0, 5).map(subject => {
                const completed = subject.topics.filter(t => t.isCompleted).length;
                const total = subject.topics.length;
                const p = total > 0 ? (completed / total) * 100 : 0;
                
                return (
                  <View key={subject.id} className="mb-4 last:mb-0">
                    <View className="flex-row justify-between mb-1">
                      <Text className={`font-medium text-sm ${textColor}`}>{subject.name}</Text>
                      <Text className="text-slate-500 text-xs">{Math.round(p)}%</Text>
                    </View>
                    <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <View 
                        className="h-full rounded-full" 
                        style={{ width: `${p}%`, backgroundColor: subject.color }} 
                      />
                    </View>
                  </View>
                );
              })}
              {subjects.length === 0 && (
                <Text className="text-slate-500 text-center py-4">Nenhuma matéria cadastrada.</Text>
              )}
            </View>
          </View>
          
          {/* Tempo Dedicado (Simples) */}
          <View className="mb-6">
            <Text className={`text-lg font-semibold mb-3 ${textColor}`}>Tempo Dedicado (Minutos)</Text>
             <View className={`rounded-xl p-4 shadow-sm border ${cardBg} ${borderColor}`}>
               {chartData.map((data, idx) => (
                 <View key={idx} className="flex-row items-center mb-3 last:mb-0">
                    <View style={{ width: 80 }}>
                      <Text className="text-xs text-slate-500 truncate" numberOfLines={1}>{data.name}</Text>
                    </View>
                    <View className="flex-1 mx-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                       <View 
                        className="h-full rounded-full" 
                        style={{ width: `${Math.min((data.minutes / 120) * 100, 100)}%`, backgroundColor: data.color }} 
                       />
                    </View>
                    <Text className={`text-xs font-medium w-10 text-right ${textColor}`}>{data.minutes}</Text>
                 </View>
               ))}
                {chartData.length === 0 && (
                  <Text className="text-slate-500 text-center py-4">Sem dados de estudo ainda.</Text>
                )}
             </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ title, value, icon: Icon, color, borderColor, isDark }: any) {
  return (
    <View className={`w-[48%] p-4 rounded-xl border-l-4 shadow-sm ${borderColor} ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-slate-500 text-xs font-medium">{title}</Text>
        <Icon size={16} className="text-slate-400" color="#94a3b8" />
      </View>
      <Text className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{value}</Text>
    </View>
  );
}