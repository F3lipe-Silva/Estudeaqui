
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useStudy } from '../../context/study-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PomodoroScreen() {
    // Fixed: destructuring pomodoroSettings from data
    const { pomodoroState, setPomodoroState, data, pausePomodoroTimer } = useStudy();
    const pomodoroSettings = data.pomodoroSettings;

    // Format seconds to MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => {
        if (pomodoroState.status === 'focus' || pomodoroState.status === 'short_break' || pomodoroState.status === 'long_break') {
            pausePomodoroTimer();
        } else if (pomodoroState.status === 'paused') {
            setPomodoroState(prev => ({
                ...prev,
                status: prev.previousStatus || 'focus',
                previousStatus: undefined,
                key: prev.key + 1
            }));
        } else if (pomodoroState.status === 'idle') {
            // Start default
             setPomodoroState(prev => ({
                ...prev,
                status: 'focus',
                timeRemaining: pomodoroSettings.tasks[0]?.duration || 1500,
                key: prev.key + 1
             }));
        }
    };

    const getStatusText = () => {
        switch(pomodoroState.status) {
            case 'focus': return 'Foco';
            case 'short_break': return 'Pausa Curta';
            case 'long_break': return 'Pausa Longa';
            case 'paused': return 'Pausado';
            default: return 'Pronto';
        }
    };

    const getBgColor = () => {
         switch(pomodoroState.status) {
            case 'focus': return '#0f172a'; // Slate 900
            case 'short_break': return '#059669'; // Emerald 600
            case 'long_break': return '#2563eb'; // Blue 600
            case 'paused': return '#475569'; // Slate 600
            default: return '#0f172a';
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: getBgColor() }]}>
             <View style={styles.content}>
                 <Text style={styles.statusText}>{getStatusText()}</Text>
                 <Text style={styles.timerText}>{formatTime(pomodoroState.timeRemaining)}</Text>

                 <View style={styles.controls}>
                     <TouchableOpacity style={styles.button} onPress={toggleTimer}>
                         <MaterialCommunityIcons
                            name={pomodoroState.status === 'focus' || pomodoroState.status.includes('break') ? "pause" : "play"}
                            size={48}
                            color="#fff"
                         />
                     </TouchableOpacity>
                 </View>
             </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    content: { alignItems: 'center' },
    statusText: { fontSize: 24, color: '#fff', marginBottom: 20, opacity: 0.9 },
    timerText: { fontSize: 80, fontWeight: 'bold', color: '#fff', fontVariant: ['tabular-nums'] },
    controls: { marginTop: 40, flexDirection: 'row', gap: 20 },
    button: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }
});
