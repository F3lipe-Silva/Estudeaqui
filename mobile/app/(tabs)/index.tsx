import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, Pressable } from 'react-native';
import { useStudy, REVISION_SEQUENCE } from '@/contexts/study-context';
import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { isToday, isThisWeek, parseISO } from 'date-fns';
import { BarChart } from 'react-native-chart-kit';
import StudyLogModal from '@/components/study-log-modal';

export default function OverviewScreen() {
  const { data, setActiveTab } = useStudy();
  const { subjects, studyLog, streak, studySequence, sequenceIndex } = data;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const textColor = isDark ? '#FFF' : '#000';
  const subTextColor = isDark ? '#AAA' : '#666';

  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [initialLogData, setInitialLogData] = useState<undefined | { subjectId: string, topicId: string }>();


  const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);
  const completedTopics = subjects.reduce((acc, s) => acc + s.topics.filter(t => t.isCompleted).length, 0);

  const timeToday = useMemo(() => studyLog
    .filter(log => isToday(parseISO(log.date)))
    .reduce((acc, log) => acc + log.duration, 0), [studyLog]);

  const timeThisWeek = useMemo(() => studyLog
    .filter(log => isThisWeek(parseISO(log.date), { weekStartsOn: 1 /* Monday */ }))
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
      // Logic for revision sequence matching web.
      // Assuming simple logic for now or import exact logic if complex.
      // Using a simplified check here.
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

  const handleOpenLogForm = (subjectId?: string, topicId?: string) => {
    if (subjectId && topicId) {
      setInitialLogData({ subjectId, topicId });
    } else {
      setInitialLogData(undefined);
    }
    setIsLogFormOpen(true);
  };

  const chartData = {
    labels: subjects.map(s => s.name.substring(0, 3)), // Truncate for mobile
    datasets: [
      {
        data: subjects.map(subject => {
            const totalTime = studyLog
            .filter(log => log.subjectId === subject.id)
            .reduce((acc, log) => acc + log.duration, 0);
            return Math.round(totalTime);
        })
      }
    ]
  };

  const screenWidth = Dimensions.get("window").width;

  const today = new Date();
  const formattedDate = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: textColor }]}>Olá, Estudante! 👋</Text>
        <Text style={[styles.date, { color: subTextColor }]}>{formattedDate}</Text>
      </View>

      {/* Métricas */}
      <View style={styles.metricsGrid}>
        <Card style={[styles.metricCard, { borderLeftColor: tintColor }]}>
          <View style={styles.metricHeader}>
             <Text style={[styles.metricTitle, { color: subTextColor }]}>Hoje</Text>
             <Ionicons name="time-outline" size={16} color={subTextColor} />
          </View>
          <Text style={[styles.metricValue, { color: textColor }]}>{formatTime(timeToday)}</Text>
        </Card>
         <Card style={[styles.metricCard, { borderLeftColor: '#3B82F6' }]}>
          <View style={styles.metricHeader}>
             <Text style={[styles.metricTitle, { color: subTextColor }]}>Semana</Text>
             <Ionicons name="calendar-outline" size={16} color={subTextColor} />
          </View>
          <Text style={[styles.metricValue, { color: textColor }]}>{formatTime(timeThisWeek)}</Text>
        </Card>
      </View>
       <View style={styles.metricsGrid}>
        <Card style={[styles.metricCard, { borderLeftColor: '#EAB308' }]}>
          <View style={styles.metricHeader}>
             <Text style={[styles.metricTitle, { color: subTextColor }]}>Streak</Text>
             <Ionicons name="flash-outline" size={16} color={subTextColor} />
          </View>
          <Text style={[styles.metricValue, { color: textColor }]}>{streak} dias</Text>
        </Card>
         <Card style={[styles.metricCard, { borderLeftColor: '#22C55E' }]}>
          <View style={styles.metricHeader}>
             <Text style={[styles.metricTitle, { color: subTextColor }]}>Tópicos</Text>
             <Ionicons name="checkbox-outline" size={16} color={subTextColor} />
          </View>
          <Text style={[styles.metricValue, { color: textColor }]}>{completedTopics}/{totalTopics}</Text>
        </Card>
      </View>

      {/* Próximo Estudo */}
      <View style={styles.section}>
         <Text style={[styles.sectionTitle, { color: textColor }]}>Continuar Estudando</Text>
         <Card style={styles.nextStudyCard}>
            <View style={styles.nextStudyHeader}>
                <View style={[styles.iconContainer, { backgroundColor: tintColor + '20' }]}>
                    <Ionicons name="book" size={24} color={tintColor} />
                </View>
                 <View style={{ flex: 1 }}>
                     {nextSubject ? (
                        <>
                           <Text style={[styles.subjectName, { color: textColor }]}>{nextSubject.name}</Text>
                           {pendingRevisionTopic ? (
                               <Text style={[styles.subText, { color: subTextColor }]}>
                                   <Ionicons name="repeat" size={12} /> Revisão: {pendingRevisionTopic.name}
                               </Text>
                           ) : (
                               <Text style={[styles.subText, { color: subTextColor }]}>Sequência de Estudo</Text>
                           )}
                        </>
                     ) : (
                         <Text style={[styles.subjectName, { color: subTextColor, fontSize: 16 }]}>Crie sua sequência no Planejamento!</Text>
                     )}
                </View>
            </View>

            {nextSubject && timeGoal > 0 && (
                <View style={styles.progressContainer}>
                     <View style={styles.progressRow}>
                         <Text style={[styles.progressLabel, { color: subTextColor }]}>Progresso da Sessão</Text>
                         <Text style={[styles.progressValue, { color: textColor }]}>{Math.round(progress)}%</Text>
                     </View>
                     <View style={[styles.progressBarBase, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]}>
                        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: tintColor }]} />
                     </View>
                      <View style={styles.progressRow}>
                         <Text style={[styles.progressLabel, { color: subTextColor }]}>{timeStudied} min estudados</Text>
                         <Text style={[styles.progressLabel, { color: subTextColor }]}>Meta: {timeGoal} min</Text>
                     </View>
                </View>
            )}

            {nextSubject && (
                <Pressable
                    style={[styles.actionButton, { backgroundColor: tintColor }]}
                    onPress={() => handleOpenLogForm(nextSubject.id, pendingRevisionTopic?.id)}
                >
                    <Ionicons name="add-circle-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.actionButtonText}>
                        {progress > 0 ? 'Continuar Sessão' : 'Iniciar Sessão'}
                    </Text>
                </Pressable>
            )}
         </Card>
      </View>

      {/* Gráfico Tempo */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Tempo Dedicado (min)</Text>
        <Card style={{ alignItems: 'center' }}>
            <BarChart
                data={chartData}
                width={screenWidth - 64}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                    backgroundColor: isDark ? '#1E1E1E' : '#FFF',
                    backgroundGradientFrom: isDark ? '#1E1E1E' : '#FFF',
                    backgroundGradientTo: isDark ? '#1E1E1E' : '#FFF',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(${isDark ? '200, 200, 200' : '100, 100, 100'}, ${opacity})`,
                    style: {
                        borderRadius: 16
                    },
                    barPercentage: 0.5,
                }}
                style={{
                    marginVertical: 8,
                    borderRadius: 16
                }}
            />
        </Card>
      </View>

      <StudyLogModal
        visible={isLogFormOpen}
        onClose={() => setIsLogFormOpen(false)}
        initialData={initialLogData}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 16,
    textTransform: 'capitalize',
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderLeftWidth: 4,
    padding: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  nextStudyCard: {
      padding: 20,
  },
  nextStudyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
  },
  iconContainer: {
      padding: 12,
      borderRadius: 999,
      marginRight: 16,
  },
  subjectName: {
      fontSize: 20,
      fontWeight: 'bold',
  },
  subText: {
      fontSize: 14,
      marginTop: 4,
  },
  progressContainer: {
      marginVertical: 12,
  },
  progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
  },
  progressLabel: {
      fontSize: 12,
  },
  progressValue: {
      fontSize: 12,
      fontWeight: 'bold',
  },
  progressBarBase: {
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
  },
  progressBarFill: {
      height: '100%',
      borderRadius: 4,
  },
  actionButton: {
      flexDirection: 'row',
      height: 48,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
  },
  actionButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  },
});
