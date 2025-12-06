import React, { useState, useMemo } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions, Modal, RefreshControl } from 'react-native';
import { Clock, BookOpen, Target, Repeat, PlusCircle, Zap } from 'lucide-react-native';
import { format, parseISO, isToday, isThisWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BarChart } from 'react-native-chart-kit';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useStudy } from '../../contexts/study-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StudyLogForm from '@/components/study-log-form';
import { REVISION_SEQUENCE } from './revision';

const screenWidth = Dimensions.get('window').width;

// Helper function for responsive styles
const getResponsiveStyles = (theme) => {
  const isSmall = screenWidth <= 400;
  const isMedium = screenWidth <= 600;

  return {
    // Container and layout
    content: {
      padding: isSmall ? 16 : 20,
      gap: isSmall ? 20 : 24
    },

    // Header
    greeting: { fontSize: isSmall ? 20 : 24, fontWeight: 'bold' },
    date: { fontSize: isSmall ? 12 : 14, opacity: 0.6, textTransform: 'capitalize' },

    // Stats cards
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    statsCard: isSmall
      ? { width: '100%', marginBottom: 8 }
      : isMedium
      ? { width: '48%', marginBottom: 8 }
      : { flex: 1 },
    statsCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: isSmall ? 6 : 8,
      paddingHorizontal: isSmall ? 12 : 16,
      paddingTop: isSmall ? 12 : 16
    },
    statsCardTitle: {
      fontSize: isSmall ? 11 : 12,
      fontWeight: '500',
      opacity: 0.6,
      marginRight: 8
    },
    statsCardContent: {
      paddingHorizontal: isSmall ? 12 : 16,
      paddingBottom: isSmall ? 12 : 16,
      paddingTop: 0
    },
    statsCardValue: {
      fontSize: isSmall ? 18 : 20,
      fontWeight: 'bold'
    },

    // Sections
    section: { gap: isSmall ? 8 : 12 },
    sectionTitle: { fontSize: isSmall ? 16 : 18, fontWeight: '600', marginLeft: 4 },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isSmall ? 8 : 12
    },
    expandButton: {
      fontSize: isSmall ? 13 : 14,
      color: theme.primary,
      fontWeight: '500'
    },

    // Continue studying
    continueStudyingContent: {
      padding: isSmall ? 12 : 16,
      paddingTop: isSmall ? 16 : 20,
      gap: isSmall ? 12 : 16
    },
    continueStudyingHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: isSmall ? 12 : 16
    },
    subjectIcon: {
      width: isSmall ? 36 : 48,
      height: isSmall ? 36 : 48,
      borderRadius: isSmall ? 18 : 24,
      alignItems: 'center',
      justifyContent: 'center'
    },
    continueStudyingSubject: {
      fontSize: isSmall ? 16 : 20,
      fontWeight: 'bold'
    },
    revisionTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: isSmall ? 2 : 4
    },
    revisionTagText: {
      fontSize: isSmall ? 11 : 12,
      opacity: 0.6
    },
    continueStudyingSubtext: {
      fontSize: isSmall ? 12 : 14,
      opacity: 0.6,
      marginTop: isSmall ? 2 : 4
    },
    progressSection: {
      gap: isSmall ? 8 : 12
    },
    progressLabel: {
      fontSize: isSmall ? 12 : 14,
      opacity: 0.6
    },
    progressValue: {
      fontSize: isSmall ? 12 : 14,
      fontWeight: '500'
    },
    progressBarContainer: {
      height: isSmall ? 10 : 12,
      backgroundColor: 'rgba(0,0,0,0.1)',
      borderRadius: 4,
      overflow: 'hidden'
    },
    progressText: {
      fontSize: isSmall ? 10 : 12,
      opacity: 0.6
    },
    continueButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isSmall ? 10 : 12,
      borderRadius: 12,
      backgroundColor: '#2563eb',
      gap: isSmall ? 6 : 8
    },
    continueButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: isSmall ? 13 : 14
    },

    // Subject progress
    subjectProgressContent: {
      padding: isSmall ? 12 : 16,
      gap: isSmall ? 12 : 16
    },
    subjectProgressItem: {
      gap: isSmall ? 6 : 8
    },
    subjectName: {
      fontSize: isSmall ? 13 : 14,
      fontWeight: '500'
    },
    subjectTime: {
      fontSize: isSmall ? 11 : 12,
      opacity: 0.6,
      marginLeft: 4
    },
    subjectProgressPercent: {
      fontSize: isSmall ? 11 : 12,
      fontWeight: '600'
    },
    subjectProgressText: {
      fontSize: isSmall ? 10 : 11,
      opacity: 0.6
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: isSmall ? 16 : 20
    },
  };
};

export default function HomeScreen() {
   const { data } = useStudy();
   const colorScheme = useColorScheme();
   const theme = Colors[colorScheme ?? 'light'];
   const insets = useSafeAreaInsets();
   const responsiveStyles = getResponsiveStyles(theme);

   const [refreshing, setRefreshing] = useState(false);
   const [isLogFormOpen, setIsLogFormOpen] = useState(false);
   const [initialLogData, setInitialLogData] = useState<{ subjectId?: string, topicId?: string } | undefined>();
   const [subjectsExpanded, setSubjectsExpanded] = useState(false);

   const { subjects, studyLog, streak, studySequence, sequenceIndex } = data;

   const handleRefresh = () => {
     setRefreshing(true);
     // Simulate refresh (data is typically updated via context/firebase automatically)
     setTimeout(() => {
       setRefreshing(false);
     }, 1000);
   };

   const handleOpenLogForm = (subjectId?: string, topicId?: string) => {
     if (subjectId && topicId) {
       setInitialLogData({ subjectId, topicId });
     } else {
       setInitialLogData(undefined);
     }
     setIsLogFormOpen(true);
   };

   const formatTime = (minutes: number) => {
     const hours = Math.floor(minutes / 60);
     const mins = minutes % 60;
     if (hours > 0) {
       return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
     }
     return `${mins}min`;
   };


   // --- Statistics Calculation ---
   const today = new Date();

  const todayLogs = useMemo(() =>
    studyLog.filter(log => isToday(parseISO(log.date))),
  [studyLog]);

  const timeStudiedToday = useMemo(() =>
    todayLogs.reduce((acc, curr) => acc + curr.duration, 0),
  [todayLogs]);

  const timeThisWeek = useMemo(() => studyLog
    .filter(log => isThisWeek(parseISO(log.date), { weekStartsOn: 1 /* Monday */ }))
    .reduce((acc, log) => acc + log.duration, 0), [studyLog]);

  // Calculate total topics and completed topics
  const totalTopics = useMemo(() => subjects.reduce((acc, s) => acc + s.topics.length, 0), [subjects]);
  const completedTopics = useMemo(() => subjects.reduce((acc, s) => acc + s.topics.filter(t => t.isCompleted).length, 0), [subjects]);

  // Get next study info
  const getNextStudyInfo = useMemo(() => {
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
      const relevantSequence = REVISION_SEQUENCE.filter(topicOrder =>
        completedTopicsInSubject.find(t => t.order === topicOrder)
      );
      if (nextSubject.revisionProgress !== undefined && nextSubject.revisionProgress < relevantSequence.length) {
        const currentTopicOrder = relevantSequence[nextSubject.revisionProgress];
        pendingRevisionTopic = completedTopicsInSubject.find(t => t.order === currentTopicOrder) || null;
      }
    }

    return { nextSubject, sequenceItem, pendingRevisionTopic };
  }, [studySequence, sequenceIndex, subjects]);

  const { nextSubject, sequenceItem, pendingRevisionTopic } = getNextStudyInfo;

  const timeStudied = sequenceItem?.totalTimeStudied || 0;
  const timeGoal = nextSubject?.studyDuration || 0;
  const progress = timeGoal > 0 ? (timeStudied / timeGoal) * 100 : 0;

  // Subject progress data for chart - sorted by study time
  const subjectProgressData = useMemo(() => {
    return subjects.map(subject => {
      const totalTime = studyLog
        .filter(log => log.subjectId === subject.id)
        .reduce((acc, log) => acc + log.duration, 0);

      const completed = subject.topics.filter(t => t.isCompleted).length;
      const total = subject.topics.length;
      const progress = total > 0 ? (completed / total) * 100 : 0;

      return {
        id: subject.id,
        name: subject.name,
        progress,
        color: subject.color,
        completed,
        total,
        totalTime
      };
    }).sort((a, b) => b.totalTime - a.totalTime); // Sort by study time (most studied first)
  }, [subjects, studyLog]);

   // Chart data for Tempo Dedicado
   const tempoDedicadoData = useMemo(() => {
     return subjects.map(subject => {
       const totalTime = studyLog
         .filter(log => log.subjectId === subject.id)
         .reduce((acc, log) => acc + log.duration, 0);
       return {
         name: subject.name,
         minutes: Math.round(totalTime),
         fill: subject.color,
       };
     });
   }, [studyLog, subjects]);

   // Accuracy chart data for Desempenho
   const accuracyChartData = useMemo(() => {
     return subjects.map(subject => {
       const relevantLogs = studyLog.filter(log => log.subjectId === subject.id && log.questionsTotal > 0);
       if (relevantLogs.length === 0) {
         return { name: subject.name, accuracy: 0, fill: subject.color };
       }
       const totalCorrect = relevantLogs.reduce((acc, log) => acc + log.questionsCorrect, 0);
       const totalQuestions = relevantLogs.reduce((acc, log) => acc + log.questionsTotal, 0);
       const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
       return { name: subject.name, accuracy: Math.round(accuracy), fill: subject.color };
     }).filter(d => d.accuracy > 0);
   }, [studyLog, subjects]);





  // Chart Config
  const chartConfig = {
    backgroundGradientFrom: theme.background,
    backgroundGradientTo: theme.background,
    color: (opacity = 1) => colorScheme === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(37, 99, 235, ${opacity})`, // Blue or White
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 1,
    labelColor: (opacity = 1) => theme.text,
    style: { borderRadius: 16 },
    propsForBackgroundLines: {
        strokeDasharray: '', // solid lines
        stroke: theme.border
    }
  };

  return (
    <ThemedView style={[{ flex: 1, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={responsiveStyles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
           <View>
             <ThemedText style={responsiveStyles.greeting}>Olá, Estudante!</ThemedText>
             <ThemedText style={responsiveStyles.date}>{format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}</ThemedText>
           </View>
        </View>

        {/* Overview Stats Cards - Updated to match web version */}
        <View style={responsiveStyles.statsGrid}>
            <Card style={[responsiveStyles.statsCard, { borderLeftWidth: 4, borderLeftColor: theme.primary }]}>
                <CardHeader style={responsiveStyles.statsCardHeader}>
                    <CardTitle style={responsiveStyles.statsCardTitle}>Hoje</CardTitle>
                    <Clock size={16} color={theme.mutedForeground} />
                </CardHeader>
                <CardContent style={responsiveStyles.statsCardContent}>
                    <ThemedText style={responsiveStyles.statsCardValue}>{timeStudiedToday} min</ThemedText>
                </CardContent>
            </Card>

            <Card style={[responsiveStyles.statsCard, { borderLeftWidth: 4, borderLeftColor: '#3b82f6' }]}>
                <CardHeader style={responsiveStyles.statsCardHeader}>
                    <CardTitle style={responsiveStyles.statsCardTitle}>Semana</CardTitle>
                    <Clock size={16} color={theme.mutedForeground} />
                </CardHeader>
                <CardContent style={responsiveStyles.statsCardContent}>
                    <ThemedText style={responsiveStyles.statsCardValue}>{Math.floor(timeThisWeek / 60)}h {timeThisWeek % 60}m</ThemedText>
                </CardContent>
            </Card>

            <Card style={[responsiveStyles.statsCard, { borderLeftWidth: 4, borderLeftColor: '#eab308' }]}>
                <CardHeader style={responsiveStyles.statsCardHeader}>
                    <CardTitle style={responsiveStyles.statsCardTitle}>Sequência</CardTitle>
                    <Zap size={16} color={theme.mutedForeground} />
                </CardHeader>
                <CardContent style={responsiveStyles.statsCardContent}>
                    <ThemedText style={responsiveStyles.statsCardValue}>{streak} dias</ThemedText>
                </CardContent>
            </Card>

            <Card style={[responsiveStyles.statsCard, { borderLeftWidth: 4, borderLeftColor: '#22c55e' }]}>
                <CardHeader style={responsiveStyles.statsCardHeader}>
                    <CardTitle style={responsiveStyles.statsCardTitle}>Tópicos</CardTitle>
                    <Target size={16} color={theme.mutedForeground} />
                </CardHeader>
                <CardContent style={responsiveStyles.statsCardContent}>
                    <ThemedText style={responsiveStyles.statsCardValue}>{completedTopics}/{totalTopics}</ThemedText>
                </CardContent>
            </Card>
        </View>

        {/* Continue Studying Section - Added from web version */}
        {nextSubject && (
          <View style={responsiveStyles.section}>
            <ThemedText type="subtitle" style={responsiveStyles.sectionTitle}>Continuar Estudando</ThemedText>
            <Card style={[{
              borderRadius: 16,
              backgroundColor: theme.card,
              overflow: 'hidden',
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
              borderColor: theme.primary + '33',
              borderWidth: 1
            }]}>
              <CardContent style={responsiveStyles.continueStudyingContent}>
                <View style={responsiveStyles.continueStudyingHeader}>
                  <View style={[responsiveStyles.subjectIcon, { backgroundColor: theme.primary + '1A' }]}>
                    <BookOpen size={screenWidth <= 400 ? 20 : 24} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={responsiveStyles.continueStudyingSubject}>{nextSubject.name}</ThemedText>
                    {pendingRevisionTopic ? (
                      <View style={responsiveStyles.revisionTag}>
                        <Repeat size={screenWidth <= 400 ? 10 : 12} color={theme.mutedForeground} />
                        <ThemedText style={responsiveStyles.revisionTagText}> Revisão: {pendingRevisionTopic.name}</ThemedText>
                      </View>
                    ) : (
                      <ThemedText style={responsiveStyles.continueStudyingSubtext}>Sequência de Estudo</ThemedText>
                    )}
                  </View>
                </View>

                {timeGoal > 0 && (
                  <View style={responsiveStyles.progressSection}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <ThemedText style={responsiveStyles.progressLabel}>Progresso da Sessão</ThemedText>
                      <ThemedText style={responsiveStyles.progressValue}>{Math.round(progress)}%</ThemedText>
                    </View>
                    <View style={responsiveStyles.progressBarContainer}>
                      <View style={[{ height: '100%', borderRadius: 4, backgroundColor: theme.primary }, { width: `${progress}%` }]} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <ThemedText style={responsiveStyles.progressText}>{timeStudied} min estudados</ThemedText>
                      <ThemedText style={responsiveStyles.progressText}>Meta: {timeGoal} min</ThemedText>
                    </View>
                  </View>
                )}

                 <Button
                   style={responsiveStyles.continueButton}
                   onPress={() => handleOpenLogForm(nextSubject.id, pendingRevisionTopic?.id)}
                 >
                   <PlusCircle size={16} color="white" />
                   <ThemedText style={responsiveStyles.continueButtonText}>
                     {progress > 0 ? 'Continuar Sessão' : 'Iniciar Sessão'}
                   </ThemedText>
                 </Button>
              </CardContent>
            </Card>
          </View>
        )}



        {/* Progress by Subject */}
        <View style={responsiveStyles.section}>
            <View style={responsiveStyles.sectionHeader}>
                <ThemedText type="subtitle" style={responsiveStyles.sectionTitle}>Progresso por Matéria</ThemedText>
                {subjectProgressData.length > 3 && (
                    <TouchableOpacity onPress={() => setSubjectsExpanded(!subjectsExpanded)}>
                        <ThemedText style={responsiveStyles.expandButton}>
                            {subjectsExpanded ? 'Mostrar menos' : `Ver todas (${subjectProgressData.length})`}
                        </ThemedText>
                    </TouchableOpacity>
                )}
            </View>
            <Card style={{ borderRadius: 16, overflow: 'hidden' }}>
                <CardContent style={responsiveStyles.subjectProgressContent}>
                    {(subjectsExpanded ? subjectProgressData : subjectProgressData.slice(0, 3)).map((subject, index) => (
                        <View key={subject.id} style={responsiveStyles.subjectProgressItem}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <ThemedText style={responsiveStyles.subjectName} numberOfLines={1}>
                                        {subject.name}
                                    </ThemedText>
                                    {subject.totalTime > 0 && (
                                        <ThemedText style={responsiveStyles.subjectTime}>
                                          ({formatTime(subject.totalTime)})
                                        </ThemedText>
                                    )}
                                </View>
                                <ThemedText style={responsiveStyles.subjectProgressPercent}>
                                    {Math.round(subject.progress)}%
                                </ThemedText>
                            </View>
                            <View style={{ height: 8, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                                <View style={[{ height: '100%', borderRadius: 4, backgroundColor: subject.color }, { width: `${subject.progress}%` }]} />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <ThemedText style={responsiveStyles.subjectProgressText}>{subject.completed} concluídos</ThemedText>
                                <ThemedText style={responsiveStyles.subjectProgressText}>{subject.total} total</ThemedText>
                            </View>
                        </View>
                    ))}
                </CardContent>
            </Card>
        </View>


        {/* Tempo Dedicado */}
        <View style={responsiveStyles.section}>
            <ThemedText type="subtitle" style={responsiveStyles.sectionTitle}>Tempo Dedicado</ThemedText>
            <Card style={{ overflow: 'hidden', alignItems: 'center', borderRadius: 16 }}>
                <CardContent style={{ padding: screenWidth <= 400 ? 12 : 16 }}>
                    <BarChart
                        data={{
                          labels: tempoDedicadoData.map(d => d.name.length > 8 ? d.name.substring(0, 8) + '...' : d.name),
                          datasets: [{ data: tempoDedicadoData.map(d => d.minutes) }]
                        }}
                        width={screenWidth - (screenWidth <= 400 ? 32 : 60)}
                        height={screenWidth <= 400 ? 180 : 220}
                        yAxisLabel=""
                        yAxisSuffix="min"
                        chartConfig={{
                          ...chartConfig,
                          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                        }}
                        verticalLabelRotation={0}
                        showBarTops={false}
                        fromZero
                        withInnerLines={true}
                    />
                </CardContent>
            </Card>
        </View>

        {/* Desempenho */}
        {accuracyChartData.length > 0 && (
          <View style={responsiveStyles.section}>
              <ThemedText type="subtitle" style={responsiveStyles.sectionTitle}>Desempenho</ThemedText>
              <Card style={{ overflow: 'hidden', alignItems: 'center', borderRadius: 16 }}>
                  <CardContent style={{ padding: screenWidth <= 400 ? 12 : 16 }}>
                      <BarChart
                          data={{
                            labels: accuracyChartData.map(d => d.name.length > 8 ? d.name.substring(0, 8) + '...' : d.name),
                            datasets: [{ data: accuracyChartData.map(d => d.accuracy) }]
                          }}
                          width={screenWidth - (screenWidth <= 400 ? 32 : 60)}
                          height={screenWidth <= 400 ? 180 : 220}
                          yAxisLabel=""
                          yAxisSuffix="%"
                          chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                          }}
                          verticalLabelRotation={0}
                          showBarTops={false}
                          fromZero
                          withInnerLines={true}
                      />
                  </CardContent>
              </Card>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Study Log Modal */}
      <Modal visible={isLogFormOpen} animationType="slide" transparent>
        <View style={responsiveStyles.modalOverlay}>
          <StudyLogForm
            onSave={() => setIsLogFormOpen(false)}
            onCancel={() => setIsLogFormOpen(false)}
            initialData={initialLogData}
          />
        </View>
      </Modal>

    </ThemedView>
  );
}

// Static styles that don't need to be responsive
const staticStyles = StyleSheet.create({
  container: { flex: 1 },
  progressBar: {
    height: '100%',
    borderRadius: 4
  },
});