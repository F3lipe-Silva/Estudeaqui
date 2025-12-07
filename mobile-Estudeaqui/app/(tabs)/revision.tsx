import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions, TextInput, RefreshControl } from 'react-native';
import { History, Check, Play, ChevronRight, X, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useStudy } from '../../contexts/study-context';
import { useAlert } from '../../contexts/alert-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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



   // Calculate overall revision stats
   const overallStats = React.useMemo(() => {
     const subjectsWithTopics = data.subjects.filter(s => s.topics.some(t => t.isCompleted));
     const totalReviewed = subjectsWithTopics.reduce((sum, subject) => {
       const sequence = REVISION_SEQUENCE
         .map(order => subject.topics.find(t => t.order === order))
         .filter((topic): topic is NonNullable<typeof topic> => topic !== undefined);
       return sum + Math.min(subject.revisionProgress, sequence.length);
     }, 0);

     const totalAvailable = subjectsWithTopics.reduce((sum, subject) => {
       const sequence = REVISION_SEQUENCE
         .map(order => subject.topics.find(t => t.order === order))
         .filter((topic): topic is NonNullable<typeof topic> => topic !== undefined);
       return sum + sequence.length;
     }, 0);

     return { reviewed: totalReviewed, available: totalAvailable };
   }, [data.subjects]);

   return (
     <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
       <ThemedView style={styles.header}>
         {/* Header Principal */}
         <View style={styles.headerMain}>
           <View style={styles.titleSection}>
             <History size={20} color={theme.primary} />
             <View style={styles.titleContainer}>
               <ThemedText style={styles.mainTitle}>Revisões</ThemedText>
               <ThemedText style={styles.subtitle}>Sistema espaçado de revisão</ThemedText>
             </View>
           </View>

           {/* Estatísticas Gerais */}
           <View style={styles.statsOverview}>
              <View style={[styles.statBadge, { backgroundColor: theme.secondary }]}>
               <Check size={14} color={theme.text} />
               <ThemedText style={[styles.statText, { color: theme.text }]}>
                 {overallStats.reviewed}/{overallStats.available}
               </ThemedText>
             </View>
             <ThemedText style={styles.statsLabel}>Revisões hoje</ThemedText>
           </View>
         </View>

         {/* Barra de Busca */}
         <View style={[styles.searchContainer, { backgroundColor: theme.secondary }]}>
           <Search size={14} color={theme.mutedForeground} style={styles.searchIcon} />
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
               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
             >
               <X size={12} color={theme.mutedForeground} />
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
                 <View style={[styles.emptyIconContainer, { backgroundColor: theme.primary + '10' }]}>
                   <History size={56} color={theme.primary} />
                 </View>
                 <ThemedText style={styles.emptyTitle}>
                   {searchQuery ? 'Nenhuma matéria encontrada' : 'Pronto para revisar!'}
                 </ThemedText>
                 <ThemedText style={styles.emptyText}>
                   {searchQuery
                     ? 'Tente buscar por outros termos ou limpe a busca para ver todas as matérias.'
                     : 'Quando você concluir tópicos de estudo, eles aparecerão aqui para revisão espaçada. Continue estudando!'
                   }
                 </ThemedText>
                 {searchQuery && (
                   <Button
                     variant="outline"
                     size="sm"
                     onPress={() => setSearchQuery('')}
                     style={{marginTop: 16}}
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
                 <Card key={subject.id} style={[styles.card, { backgroundColor: theme.card }]}>
                     <TouchableOpacity
                        style={[styles.cardHeader, { backgroundColor: theme.card }]}
                        onPress={() => toggleSubjectExpansion(subject.id)}
                        activeOpacity={0.7}
                        accessibilityLabel={`Expandir tópicos de ${subject.name}`}
                        accessibilityHint={expandedSubjects.includes(subject.id) ? "Recolher lista de tópicos" : "Mostrar lista de tópicos"}
                        accessible={true}
                     >
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1}}>
                            <View style={[styles.colorDot, { backgroundColor: subject.color, borderColor: theme.border }]} />
                            <View style={{flex: 1}}>
                                <CardTitle style={{fontSize: 16, fontWeight: '500'}}>{subject.name}</CardTitle>
                                <ThemedText style={styles.subjectStats}>
                                    {completedTopics.length} tópicos concluídos
                                </ThemedText>
                            </View>
                        </View>
                        <View style={styles.headerRight}>
                            <View style={[styles.badgeContainer, { backgroundColor: theme.secondary }]}>
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
                                          {
                                            width: Math.max(70, (screenWidth - 32 - (numColumns - 1) * 6) / numColumns),
                                            minHeight: 80,
                                            borderColor: theme.border
                                          },
                                         isCompleted && {
                                             backgroundColor: '#dcfce7',
                                             borderColor: '#3b82f640',
                                             borderWidth: 1,
                                         },
                                         isCurrent && {
                                             backgroundColor: '#eff6ff',
                                             borderColor: '#3b82f6',
                                             borderWidth: 1,
                                             shadowColor: theme.primary,
                                             shadowOffset: { width: 0, height: 3 },
                                             shadowOpacity: 0.4,
                                             shadowRadius: 8,
                                             elevation: 6,
                                             transform: [{ scale: 1.03 }]
                                         },
                                         !isCurrent && !isCompleted && {
                                             opacity: 0.5,
                                             backgroundColor: theme.muted,
                                             borderColor: theme.border,
                                         }
                                    ]}
                                    onPress={handlePress}
                                    disabled={!isCurrent && !(isCompleted && index === subject.revisionProgress - 1)}
                                    activeOpacity={0.8}
                                    accessibilityLabel={`${isCompleted ? 'Revisão concluída' : isCurrent ? 'Revisão atual' : 'Revisão pendente'}: ${topic.name}`}
                                    accessibilityHint={isCurrent ? 'Toque para iniciar revisão ou marcar como concluída' : isCompleted ? 'Toque para desmarcar como concluída' : 'Esta revisão ainda não está disponível'}
                                    accessible={true}
                                >
                                    <View style={[
                                        styles.itemBadge,
                                        { borderColor: theme.border },
                                        isCompleted ? { backgroundColor: theme.primary } :
                                        isCurrent ? { backgroundColor: theme.primary } : { backgroundColor: theme.surfaceContainerHigh }
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
                                             <View style={[styles.checkPrompt, { backgroundColor: theme.primary }]}>
                                                 <Play size={7} color="white" />
                                                 <ThemedText style={{color: 'white', fontSize: 6, fontWeight: 'bold'}}>REVISAR</ThemedText>
                                             </View>
                                         )}
                                         {isCompleted && (
                                             <View style={[styles.completedPrompt, { backgroundColor: '#22c55e' }]}>
                                                 <Check size={9} color="white" />
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
                              <View style={[styles.completionMessage, {
                                  backgroundColor: theme.secondary,
                                  borderColor: theme.primary
                              }]}>
                                  <Check size={16} color={theme.text} style={{marginRight: 8}} />
                                  <ThemedText style={[styles.completionText, { color: theme.text }]}>Todas as revisões concluídas!</ThemedText>
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
     paddingBottom: 16,
     gap: 16
   },
   headerMain: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'flex-start',
   },
   titleSection: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 8,
     flex: 1,
   },
   titleContainer: {
     flex: 1,
   },
   mainTitle: {
     fontSize: 22,
     fontWeight: '600',
     marginBottom: 2,
   },
   subtitle: {
     fontSize: 14,
     opacity: 0.7,
     fontWeight: '400'
   },
   statsOverview: {
     alignItems: 'center',
     gap: 4,
   },
   statBadge: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 4,
     paddingHorizontal: 8,
     paddingVertical: 4,
     borderRadius: 12,
   },
   statText: {
     fontSize: 12,
     fontWeight: '600',
   },
   statsLabel: {
     fontSize: 11,
     opacity: 0.6,
     fontWeight: '400',
   },
   searchContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     borderWidth: 1,
     borderRadius: 16,
     paddingHorizontal: 16,
     paddingVertical: 12,
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
     padding: 6,
     marginLeft: 6,
   },
  content: {
    padding: 16,
    paddingBottom: 80
  },
  card: {
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chevron: {
    transitionDuration: 200,
  },
  subjectStats: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
    fontWeight: '400'
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8
  },
   grid: {
     flexDirection: 'row',
     flexWrap: 'wrap',
     gap: 6,
     padding: 12,
   },
   gridItem: {
     aspectRatio: 1.2,
     borderWidth: 1,
     borderRadius: 12,
     padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  itemBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  itemIndex: {
    fontSize: 12,
    fontWeight: '500'
  },
  itemName: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    flex: 1,
    marginTop: 4,
    fontWeight: '400'
  },
  itemStatus: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 20,
    marginTop: 4,
  },
  waitingText: {
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.5,
    textAlign: 'center',
  },
  checkPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedPrompt: {
    borderRadius: 12,
    padding: 4,
  },
   emptyState: {
     alignItems: 'center',
     justifyContent: 'center',
     padding: 40,
     gap: 16,
   },
   emptyIconContainer: {
     padding: 20,
     borderRadius: 32,
   },
   emptyTitle: {
     fontSize: 18,
     fontWeight: '600',
     textAlign: 'center',
     marginBottom: 4,
   },
   emptyText: {
     opacity: 0.7,
     fontSize: 14,
     textAlign: 'center',
     fontWeight: '400',
     lineHeight: 20,
     maxWidth: 300,
   },
  completionMessage: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  completionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});