import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { BarChart, LineChart, PieChart, ProgressChart, AccuracyChart } from '@/components/ui/charts';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Subject, StudyLogEntry } from '@/types';

interface StudyChartsProps {
  subjects: Subject[];
  studyLogs: StudyLogEntry[];
  period?: 'week' | 'month' | 'year';
}

export const StudyCharts: React.FC<StudyChartsProps> = ({
  subjects,
  studyLogs,
  period = 'week'
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // Calculate study time by subject
  const getStudyTimeBySubject = () => {
    const subjectTime: { [key: string]: number } = {};
    
    studyLogs.forEach(log => {
      const subject = subjects.find(s => s.id === log.subjectId);
      if (subject) {
        subjectTime[subject.name] = (subjectTime[subject.name] || 0) + log.duration;
      }
    });

    return {
      labels: Object.keys(subjectTime),
      datasets: [{
        data: Object.values(subjectTime),
        colors: Object.keys(subjectTime).map((_, index) => (opacity: number) => 
          `hsla(${index * 360 / Object.keys(subjectTime).length}, 70%, 50%, ${opacity})`
        )
      }]
    };
  };

  // Calculate accuracy by subject
  const getAccuracyBySubject = () => {
    const subjectAccuracy: Array<{
      subject: string;
      accuracy: number;
      totalQuestions: number;
      correctQuestions: number;
    }> = [];

    subjects.forEach(subject => {
      const subjectLogs = studyLogs.filter(log => log.subjectId === subject.id);
      const totalQuestions = subjectLogs.reduce((sum, log) => sum + log.questionsTotal, 0);
      const correctQuestions = subjectLogs.reduce((sum, log) => sum + log.questionsCorrect, 0);
      
      if (totalQuestions > 0) {
        subjectAccuracy.push({
          subject: subject.name,
          accuracy: Math.round((correctQuestions / totalQuestions) * 100),
          totalQuestions,
          correctQuestions
        });
      }
    });

    return subjectAccuracy;
  };

  // Calculate study progress
  const getStudyProgress = () => {
    const completedTopics = subjects.reduce((sum, subject) => 
      sum + subject.topics.filter(topic => topic.isCompleted).length, 0
    );
    const totalTopics = subjects.reduce((sum, subject) => sum + subject.topics.length, 0);

    return {
      labels: ['Tópicos Concluídos', 'Tópicos Restantes'],
      data: totalTopics > 0 ? [completedTopics / totalTopics, (totalTopics - completedTopics) / totalTopics] : [0, 1]
    };
  };

  // Calculate daily study time (last 7 days)
  const getDailyStudyTime = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    const dailyTime = new Array(7).fill(0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];

      studyLogs.forEach(log => {
        if (log.date.startsWith(dateStr)) {
          dailyTime[i] += log.duration;
        }
      });
    }

    return {
      labels: days,
      datasets: [{
        data: dailyTime,
        color: (opacity: number) => theme.primary,
        strokeWidth: 2
      }]
    };
  };

  // Calculate subject distribution
  const getSubjectDistribution = () => {
    const distribution = subjects.map(subject => {
      const subjectLogs = studyLogs.filter(log => log.subjectId === subject.id);
      const totalTime = subjectLogs.reduce((sum, log) => sum + log.duration, 0);
      
      return {
        name: subject.name,
        population: totalTime,
        color: subject.color
      };
    }).filter(item => item.population > 0);

    return distribution;
  };

  const studyTimeData = getStudyTimeBySubject();
  const accuracyData = getAccuracyBySubject();
  const progressData = getStudyProgress();
  const dailyTimeData = getDailyStudyTime();
  const distributionData = getSubjectDistribution();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedText style={styles.sectionTitle}>Tempo de Estudo por Matéria</ThemedText>
      <BarChart
        data={studyTimeData}
        title="Minutos estudados"
        unit="min"
      />

      {accuracyData.length > 0 && (
        <>
          <ThemedText style={styles.sectionTitle}>Precisão por Matéria</ThemedText>
          <AccuracyChart data={accuracyData} />
        </>
      )}

      <ThemedText style={styles.sectionTitle}>Progresso Geral</ThemedText>
      <ProgressChart
        data={progressData}
        title="Progresso dos Tópicos"
      />

      <ThemedText style={styles.sectionTitle}>Tempo de Estudo Diário</ThemedText>
      <LineChart
        data={dailyTimeData}
        title="Últimos 7 dias"
        unit="min"
        bezier
      />

      {distributionData.length > 0 && (
        <>
          <ThemedText style={styles.sectionTitle}>Distribuição por Matéria</ThemedText>
          <PieChart
            data={distributionData}
            title="Distribuição de Tempo"
          />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 16,
    textAlign: 'center',
  },
});