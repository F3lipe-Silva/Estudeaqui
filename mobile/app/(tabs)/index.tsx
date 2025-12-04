
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useStudy } from '../../context/study-context';
import { useAuth } from '../../context/auth-context';

export default function OverviewScreen() {
  const { data } = useStudy();
  const { user } = useAuth();

  // Simple welcome and stats
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.email?.split('@')[0]}</Text>
        <Text style={styles.subtitle}>Bons estudos hoje!</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
           <Text style={styles.statValue}>{data.streak}</Text>
           <Text style={styles.statLabel}>Dias Seguidos</Text>
        </View>
        <View style={styles.statCard}>
           <Text style={styles.statValue}>{data.studyLog.length}</Text>
           <Text style={styles.statLabel}>Sessões</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Matérias</Text>
      {data.subjects.length === 0 ? (
          <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhuma matéria cadastrada.</Text>
          </View>
      ) : (
          data.subjects.map(subject => (
              <View key={subject.id} style={[styles.card, { borderLeftColor: subject.color, borderLeftWidth: 4 }]}>
                  <Text style={styles.cardTitle}>{subject.name}</Text>
                  <Text style={styles.cardSubtitle}>{subject.topics.length} tópicos</Text>
              </View>
          ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#0f172a',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
  }
});
