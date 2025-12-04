import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, ScrollView } from 'react-native';
import { useStudy, REVISION_SEQUENCE } from '@/contexts/study-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';

export default function ReviewScreen() {
  const { data, dispatch } = useStudy();
  const { subjects } = data;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeTextColor = isDark ? '#FFF' : '#000';
  const subTextColor = isDark ? '#AAA' : '#666';

  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);

  const handleToggleStep = (subjectId: string, newProgress: number) => {
    dispatch({ type: 'SET_REVISION_PROGRESS', payload: { subjectId, progress: newProgress } });
  };

  const toggleExpand = (subjectId: string) => {
    setExpandedSubjectId(expandedSubjectId === subjectId ? null : subjectId);
  };

  const renderSubjectItem = ({ item: subject }: { item: any }) => {
    const completedTopics = subject.topics.filter((t: any) => t.isCompleted);

    if (completedTopics.length === 0) {
      return null;
    }

    const revisionSequence = REVISION_SEQUENCE
      .map(topicOrder => completedTopics.find((t: any) => t.order === topicOrder))
      .filter((topic): topic is NonNullable<typeof topic> => topic !== undefined);

    if (revisionSequence.length === 0) return null;

    const isExpanded = expandedSubjectId === subject.id;

    return (
      <View style={{ marginBottom: 12 }}>
        <Pressable onPress={() => toggleExpand(subject.id)}>
            <Card style={[styles.card, { borderLeftColor: subject.color }]}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.subjectName, { color: themeTextColor }]}>{subject.name}</Text>
                        <View style={[styles.badge, { backgroundColor: isDark ? '#333' : '#F2F2F7' }]}>
                             <Text style={[styles.badgeText, { color: subTextColor }]}>
                                {subject.revisionProgress} / {revisionSequence.length}
                            </Text>
                        </View>
                    </View>
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={subTextColor} />
                </View>
            </Card>
        </Pressable>

        {isExpanded && (
            <View style={[styles.contentContainer, { backgroundColor: isDark ? '#121212' : '#F9F9F9' }]}>
                <View style={styles.gridContainer}>
                    {revisionSequence.map((topic: any, index: number) => {
                        const isCompleted = index < subject.revisionProgress;
                        const isCurrent = index === subject.revisionProgress;
                        const topicDisplayNumber = `${topic.order}`;

                        const handleToggle = () => {
                              if (isCurrent) {
                                  handleToggleStep(subject.id, subject.revisionProgress + 1);
                              } else if (isCompleted && index === subject.revisionProgress - 1) {
                                  // Allow un-doing the last step
                                  handleToggleStep(subject.id, subject.revisionProgress - 1);
                              }
                        };

                        const canClick = isCurrent || isCompleted;

                        return (
                             <Pressable
                                key={`${topic.id}-${index}`}
                                onPress={canClick ? handleToggle : undefined}
                                style={[
                                    styles.revisionBox,
                                    {
                                        backgroundColor: isCompleted ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5') : (isDark ? '#1E1E1E' : '#FFF'),
                                        borderColor: isCurrent ? Colors[colorScheme ?? 'light'].tint : (isCompleted ? '#10B981' : (isDark ? '#333' : '#E5E5E5')),
                                        borderWidth: isCurrent ? 2 : 1,
                                        opacity: (!isCurrent && !isCompleted) ? 0.5 : 1
                                    }
                                ]}
                             >
                                <View style={[
                                    styles.topicNumber,
                                    {
                                        backgroundColor: isCompleted ? '#10B981' : (isCurrent ? Colors[colorScheme ?? 'light'].tint : (isDark ? '#333' : '#E5E5E5'))
                                    }
                                ]}>
                                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: (isCompleted || isCurrent) ? '#FFF' : '#888' }}>{topicDisplayNumber}</Text>
                                </View>
                                <Text style={[styles.topicName, { color: themeTextColor }]} numberOfLines={2}>{topic.name}</Text>

                                <View style={{ marginTop: 8 }}>
                                    {isCurrent ? (
                                        <View style={[styles.statusButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
                                            <Text style={styles.statusButtonText}>Concluir</Text>
                                        </View>
                                    ) : isCompleted ? (
                                        <View style={[styles.statusButton, { backgroundColor: 'transparent' }]}>
                                            <Text style={[styles.statusButtonText, { color: '#10B981', fontSize: 10 }]}>Concluído</Text>
                                        </View>
                                    ) : (
                                        <Text style={{ fontSize: 9, color: subTextColor, textAlign: 'center' }}>AGUARDANDO</Text>
                                    )}
                                </View>
                             </Pressable>
                        );
                    })}
                </View>

                 {subject.revisionProgress >= revisionSequence.length && revisionSequence.length > 0 && (
                    <View style={[styles.congratsBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5' }]}>
                        <Text style={{ color: '#10B981', fontWeight: 'bold', textAlign: 'center' }}>
                            Parabéns! Você concluiu todas as revisões para esta matéria!
                        </Text>
                    </View>
                 )}
            </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeTextColor }]}>Revisão</Text>
        <Text style={[styles.subtitle, { color: subTextColor }]}>Sistema de Revisão por Ciclos</Text>
      </View>

      <FlatList
        data={subjects}
        keyExtractor={item => item.id}
        renderItem={renderSubjectItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
             <View style={styles.emptyState}>
                <Ionicons name="repeat-outline" size={64} color={subTextColor} />
                <Text style={[styles.emptyStateText, { color: subTextColor }]}>Nenhuma revisão pendente</Text>
                <Text style={[styles.emptyStateSubText, { color: subTextColor }]}>Complete tópicos nas matérias para iniciar o ciclo de revisões.</Text>
            </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
      fontSize: 14,
  },
  listContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
  },
  card: {
      borderLeftWidth: 4,
      borderRadius: 12,
      padding: 16,
      marginBottom: 0, // Handled by container
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  subjectName: {
      fontSize: 16,
      fontWeight: 'bold',
      marginRight: 8,
  },
  badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
  },
  badgeText: {
      fontSize: 12,
      fontWeight: '600',
  },
  contentContainer: {
      padding: 16,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      marginTop: -4, // Overlap slightly to look connected
      marginBottom: 12,
      marginLeft: 4,
      marginRight: 4,
  },
  gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
  },
  revisionBox: {
      width: '31%', // approx 1/3
      padding: 8,
      borderRadius: 8,
      alignItems: 'center',
      minHeight: 100,
      justifyContent: 'space-between',
  },
  topicNumber: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
  },
  topicName: {
      fontSize: 10,
      textAlign: 'center',
      fontWeight: '500',
      marginBottom: 4,
  },
  statusButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
  },
  statusButtonText: {
      color: '#FFF',
      fontSize: 10,
      fontWeight: 'bold',
  },
  congratsBox: {
      padding: 12,
      borderRadius: 8,
      marginTop: 12,
  },
  emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
      paddingTop: 100,
  },
  emptyStateText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 16,
  },
  emptyStateSubText: {
      textAlign: 'center',
      marginTop: 8,
  }
});
