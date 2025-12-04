
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RevisionScreen() {
    return (
        <View style={styles.container}>
             <Text style={styles.text}>Revisão</Text>
             <Text style={styles.subtext}>Em breve</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
    text: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
    subtext: { color: '#64748b', marginTop: 10 }
});
