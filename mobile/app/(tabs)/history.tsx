
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useStudy } from '../../context/study-context';
import { format, parseISO } from 'date-fns';

export default function HistoryScreen() {
    const { data } = useStudy();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
             <Text style={styles.title}>Histórico</Text>
             {data.studyLog.length === 0 ? (
                 <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
             ) : (
                 data.studyLog.map(log => {
                     const subject = data.subjects.find(s => s.id === log.subjectId);
                     return (
                         <View key={log.id} style={styles.card}>
                             <View style={styles.row}>
                                 <Text style={styles.cardTitle}>{subject?.name || 'Matéria excluída'}</Text>
                                 <Text style={styles.date}>{format(parseISO(log.date), 'dd/MM/yyyy HH:mm')}</Text>
                             </View>
                             <Text style={styles.duration}>{log.duration} min</Text>
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
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0'
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 16, fontWeight: '500', color: '#0f172a' },
    date: { fontSize: 12, color: '#94a3b8' },
    duration: { fontSize: 14, color: '#64748b', marginTop: 4 },
    emptyText: { color: '#94a3b8', textAlign: 'center', marginTop: 20 },
});
