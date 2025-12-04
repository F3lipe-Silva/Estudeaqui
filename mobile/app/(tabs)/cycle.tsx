
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useStudy } from '../../context/study-context';

export default function CycleScreen() {
    const { data } = useStudy();
    // Implementation of Study Cycle
    // For now, listing the sequence if available
    const sequence = data.studySequence?.sequence || [];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
             <Text style={styles.title}>Ciclo de Estudos</Text>
             {sequence.length === 0 ? (
                 <Text style={styles.emptyText}>Ciclo não configurado.</Text>
             ) : (
                 sequence.map((item, index) => {
                     const subject = data.subjects.find(s => s.id === item.subjectId);
                     const isCurrent = index === data.sequenceIndex;
                     return (
                         <View key={index} style={[styles.card, isCurrent && styles.activeCard]}>
                             <Text style={[styles.cardTitle, isCurrent && styles.activeText]}>{subject?.name || 'Matéria desconhecida'}</Text>
                             <Text style={[styles.cardSubtitle, isCurrent && styles.activeText]}>
                                 {Math.floor(item.totalTimeStudied || 0)} min estudados
                             </Text>
                         </View>
                     );
                 })
             )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 20, paddingTop: 60 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#0f172a' },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    activeCard: {
        backgroundColor: '#0f172a',
        borderColor: '#0f172a',
    },
    cardTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
    cardSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
    activeText: { color: '#fff' },
    emptyText: { color: '#94a3b8', textAlign: 'center', marginTop: 20 },
});
