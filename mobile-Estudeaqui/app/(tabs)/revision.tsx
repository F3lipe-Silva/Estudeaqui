import React, { useState, useCallback, useMemo, useRef } from 'react';
import { memo } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions, FlatList, RefreshControl, Animated, TextInput } from 'react-native';
import { History, Check, Target, BookOpen, Play, ChevronRight, X, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useStudy } from '../../contexts/study-context';
import { useAlert } from '../../contexts/alert-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Sequência avançada de revisão (Web version)
export const REVISION_SEQUENCE = [0,1,0,2,1,3,2,4,3,0,5,4,1,6,5,2,7,6,3,8,7,4,0,9,8,5,1,10,9,6,2,11,10,7,3,12,11,8,4,13,12,9,5,14,13,10,6,15,14,11,7,16,15,12,8,17,16,13,9,18,17,15,11,19,18,15,11,20,19,16,12,21,20,17,13,21,20,17,13,22,21,18,14,22,21,18,14,23,22,19,15];

export default function RevisionScreen() {
  const { data, dispatch, startPomodoroForItem } = useStudy();
  const { showAlert } = useAlert();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const screenWidth = Dimensions.get('window').width;

  // Responsive grid columns based on screen width (mobile-optimized)
  const numColumns = useMemo(() => {
    if (screenWidth < 320) return 2;
    if (screenWidth < 375) return 2;
    if (screenWidth < 414) return 3;
    return 4;
  }, [screenWidth]);

  const handleToggleStep = useCallback((subjectId: string, newProgress: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch({ type: 'SET_REVISION_PROGRESS', payload: { subjectId, progress: newProgress } });
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const toggleSubjectExpansion = useCallback((subjectId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  }, []);

  // Filter subjects based on search
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return data.subjects;

    return data.subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.topics.some(topic =>
        topic.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data.subjects, searchQuery]);



  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6}}>
          <History size={18} color={theme.primary} />
          <View style={{flex: 1}}>
            <ThemedText type="title" style={{fontSize: 18}}>Revisões</ThemedText>
            <ThemedText style={styles.subtitle}>Sistema de revisão por ciclos</ThemedText>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={12} color={theme.mutedForeground} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, {
              borderColor: theme.border,
              color: theme.text,
              backgroundColor: theme.background
            }]}
            placeholder="Buscar matérias ou tópicos..."
            placeholderTextColor={theme.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <X size={10} color={theme.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </ThemedView>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >

        {filteredSubjects.length === 0 && (
             <View style={styles.emptyState}>
                <History size={48} color={theme.mutedForeground} style={{opacity: 0.5, marginBottom: 16}} />
                <ThemedText style={styles.emptyText}>
                  {searchQuery ? 'Nenhuma matéria encontrada.' : 'Nenhuma matéria para revisar.'}
                </ThemedText>
                {searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setSearchQuery('')}
                    style={{marginTop: 12}}
                  >
                    <X size={14} color={theme.primary} />
                    <ThemedText style={{fontSize: 12, marginLeft: 4}}>Limpar busca</ThemedText>
                  </Button>
                )}
            </View>
        )}

        {filteredSubjects.map(subject => {
            const completedTopics = subject.topics.filter(t => t.isCompleted);
            if (completedTopics.length === 0) return null;

            const revisionSequence = REVISION_SEQUENCE
                .map(topicOrder => completedTopics.find(t => t.order === topicOrder))
                .filter((topic): topic is NonNullable<typeof topic> => topic !== undefined);

            if (revisionSequence.length === 0) return null;

            return (
                <Card key={subject.id} style={styles.card}>
                    <TouchableOpacity
                        style={styles.cardHeader}
                        onPress={() => toggleSubjectExpansion(subject.id)}
                        activeOpacity={0.7}
                    >
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1}}>
                            <View style={[styles.colorDot, { backgroundColor: subject.color }]} />
                            <View style={{flex: 1}}>
                                <CardTitle style={{fontSize: 15}}>{subject.name}</CardTitle>
                                <ThemedText style={styles.subjectStats}>
                                    {completedTopics.length} tópicos concluídos
                                </ThemedText>
                            </View>
                        </View>
                        <View style={styles.headerRight}>
                            <View style={styles.badgeContainer}>
                                <ThemedText style={styles.badgeText}>
                                    {subject.revisionProgress} / {revisionSequence.length}
                                </ThemedText>
                            </View>
                            <ChevronRight
                                size={16}
                                color={theme.icon}
                                style={[
                                    styles.chevron,
                                    { transform: [{ rotate: expandedSubjects.includes(subject.id) ? '90deg' : '0deg' }] }
                                ]}
                            />
                        </View>
                    </TouchableOpacity>

                    {expandedSubjects.includes(subject.id) && (
                        <CardContent style={styles.grid}>
                        {revisionSequence.map((topic, index) => {
                            const isCompleted = index < subject.revisionProgress;
                            const isCurrent = index === subject.revisionProgress;

                            const handlePress = () => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                                if (isCurrent) {
                                    showAlert({
                                        title: "Revisão",
                                        message: `O que deseja fazer com "${topic.name}"?`,
                                        variant: 'default',
                                        primaryButton: {
                                            text: "Iniciar Pomodoro",
                                            action: () => {
                                                startPomodoroForItem(topic.id, 'revision', true);
                                                router.push('/pomodoro');
                                            }
                                        },
                                        secondaryButton: {
                                            text: "Marcar como Concluído",
                                            action: () => handleToggleStep(subject.id, subject.revisionProgress + 1)
                                        },
                                        onDismiss: () => {}
                                    });
                                }
                                else if (isCompleted && index === subject.revisionProgress - 1) {
                                    handleToggleStep(subject.id, subject.revisionProgress - 1);
                                }
                            };

                            return (
                                <TouchableOpacity
                                    key={`${topic.id}-${index}`}
                                    style={[
                                        styles.gridItem,
                                        { width: (screenWidth - 32 - (numColumns - 1) * 8) / numColumns },
                                        isCompleted && {
                                            backgroundColor: 'rgba(34, 197, 94, 0.15)',
                                            borderColor: '#22c55e',
                                            borderWidth: 1.5,
                                        },
                                        isCurrent && {
                                            borderColor: theme.primary,
                                            borderWidth: 2,
                                            backgroundColor: `${theme.primary}15`,
                                            shadowColor: theme.primary,
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 6,
                                            elevation: 4,
                                            transform: [{ scale: 1.02 }]
                                        },
                                        !isCurrent && !isCompleted && {
                                            opacity: 0.6,
                                            backgroundColor: 'rgba(0,0,0,0.02)',
                                        }
                                    ]}
                                    onPress={handlePress}
                                    disabled={!isCurrent && !(isCompleted && index === subject.revisionProgress - 1)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[
                                        styles.itemBadge,
                                        isCompleted ? { backgroundColor: '#22c55e' } :
                                        isCurrent ? { backgroundColor: theme.primary } : { backgroundColor: theme.muted }
                                    ]}>
                                        <ThemedText style={[
                                            styles.itemIndex,
                                            (isCurrent || isCompleted) && { color: 'white' }
                                        ]}>{topic.order}</ThemedText>
                                    </View>
                                    <ThemedText
                                        style={[styles.itemName, isCompleted && { color: '#15803d' }]}
                                        numberOfLines={2}
                                    >
                                        {topic.name}
                                    </ThemedText>
                                    <View style={styles.itemStatus}>
                                        {isCurrent && (
                                            <View style={styles.checkPrompt}>
                                                <Play size={6} color="white" />
                                                <ThemedText style={{color: 'white', fontSize: 5, fontWeight: 'bold'}}>REVISAR</ThemedText>
                                            </View>
                                        )}
                                        {isCompleted && (
                                            <View style={styles.completedPrompt}>
                                                <Check size={8} color="white" />
                                            </View>
                                        )}
                                        {!isCurrent && !isCompleted && (
                                            <ThemedText style={styles.waitingText}>AGUARDANDO</ThemedText>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                        {subject.revisionProgress >= revisionSequence.length && revisionSequence.length > 0 && (
                            <View style={styles.completionMessage}>
                                <Check size={14} color="#22c55e" style={{marginRight: 6}} />
                                <ThemedText style={styles.completionText}>Todas as revisões concluídas!</ThemedText>
                            </View>
                        )}
                        </CardContent>
                    )}
                </Card>
            );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.02)',
    width: '100%',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 8,
    marginLeft: 6,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4
  },
  content: {
    padding: 16,
    paddingBottom: 80
  },
  card: {
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chevron: {
    transitionDuration: 200,
  },
  subjectStats: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)'
  },
  badgeContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.7
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
  },
  gridItem: {
    aspectRatio: 1.2,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    margin: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  itemBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  itemIndex: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  itemName: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    flex: 1,
    marginTop: 4,
  },
  itemStatus: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 20,
    marginTop: 4,
  },
  waitingText: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.5,
    textAlign: 'center',
  },
  checkPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#2563EB',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completedPrompt: {
    backgroundColor: '#22c55e',
    borderRadius: 6,
    padding: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    opacity: 0.5,
    fontSize: 16,
    textAlign: 'center',
  },
  completionMessage: {
    width: '100%',
    padding: 12,
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
    borderWidth: 1.5,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  completionText: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '500',
    textAlign: 'center',
  },
});