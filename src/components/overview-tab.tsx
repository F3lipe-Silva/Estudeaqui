
"use client";

import { useState, useMemo } from 'react';
import { useStudy } from '@/contexts/study-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Check, Clock, Zap, Target, Repeat, PlusCircle, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import StudyLogForm from '@/components/study-log-form';
import { isToday, isThisWeek, parseISO } from 'date-fns';
import { REVISION_SEQUENCE } from '@/components/revision-tab';
import type { Subject as SubjectType, Topic as TopicType } from '@/lib/types';


export default function OverviewTab() {
  const { data, dispatch, setActiveTab } = useStudy();
  const { subjects, studyLog, streak, studySequence, sequenceIndex } = data;
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [initialLogData, setInitialLogData] = useState<undefined | { subjectId: string, topicId: string }>();

  const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);
  const completedTopics = subjects.reduce((acc, s) => acc + s.topics.filter(t => t.isCompleted).length, 0);

  const timeToday = useMemo(() => studyLog
    .filter(log => isToday(parseISO(log.date)))
    .reduce((acc, log) => acc + log.duration, 0), [studyLog]);

  const timeThisWeek = useMemo(() => studyLog
    .filter(log => isThisWeek(parseISO(log.date), { weekStartsOn: 1 /* Monday */ }))
    .reduce((acc, log) => acc + log.duration, 0), [studyLog]);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };
  
  const getNextStudyInfo = () => {
    if (!studySequence || studySequence.sequence.length === 0) {
      return { nextSubject: null, sequenceItem: null, pendingRevisionTopic: null };
    }
    const sequenceItem = studySequence.sequence[sequenceIndex];
    if (!sequenceItem) return { nextSubject: null, sequenceItem: null, pendingRevisionTopic: null };

    const nextSubject = subjects.find(s => s.id === sequenceItem.subjectId);
    if (!nextSubject) return { nextSubject: null, sequenceItem: null, pendingRevisionTopic: null };

    const completedTopicsInSubject = nextSubject.topics.filter(t => t.isCompleted);
    let pendingRevisionTopic: TopicType | null = null;
    if (completedTopicsInSubject.length > 0) {
        const relevantSequence = REVISION_SEQUENCE.filter(topicOrder => completedTopicsInSubject.find(t => t.order === topicOrder));
        if (nextSubject.revisionProgress < relevantSequence.length) {
            const currentTopicOrder = relevantSequence[nextSubject.revisionProgress];
            pendingRevisionTopic = completedTopicsInSubject.find(t => t.order === currentTopicOrder) || null;
        }
    }

    return { nextSubject, sequenceItem, pendingRevisionTopic };
  };

  const { nextSubject, sequenceItem, pendingRevisionTopic } = getNextStudyInfo();
  
  const timeStudied = sequenceItem?.totalTimeStudied || 0;
  const timeGoal = nextSubject?.studyDuration || 0;
  const progress = timeGoal > 0 ? (timeStudied / timeGoal) * 100 : 0;
  
  const handleOpenLogForm = (subjectId?: string, topicId?: string) => {
    if (subjectId && topicId) {
      setInitialLogData({ subjectId, topicId });
    } else {
      setInitialLogData(undefined);
    }
    setIsLogFormOpen(true);
  };

  const chartData = subjects.map(subject => {
    const totalTime = studyLog
      .filter(log => log.subjectId === subject.id)
      .reduce((acc, log) => acc + log.duration, 0);
    return {
      name: subject.name,
      minutes: Math.round(totalTime),
      fill: subject.color,
    };
  });
  
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


  return (
    <Dialog open={isLogFormOpen} onOpenChange={setIsLogFormOpen}>
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo (Hoje)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(timeToday)}</div>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo (Semana)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(timeThisWeek)}</div>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streak} dias</div>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tópicos</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTopics}/{totalTopics}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card className="md:col-span-2">
              <CardHeader>
                  <CardTitle className="text-lg font-bold text-primary">Próximo Passo</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4 rounded-lg bg-card-foreground/5 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-4">
                              <BookOpen className="h-8 w-8 text-primary" />
                              <div>
                                  {nextSubject ? (
                                      <>
                                        <div className="text-xl font-bold">{nextSubject.name}</div>
                                        {pendingRevisionTopic && (
                                           <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                                <Repeat className="h-4 w-4" />
                                                Revisão: {pendingRevisionTopic.name}
                                           </div>
                                        )}
                                      </>
                                  ) : (
                                      <div className="text-lg font-semibold text-muted-foreground">Crie sua sequência no Planejamento!</div>
                                  )}
                              </div>
                          </div>
                          {nextSubject && (
                            <DialogTrigger asChild>
                              <Button 
                                onClick={() => handleOpenLogForm(nextSubject.id, pendingRevisionTopic?.id)}
                                className="w-full sm:w-auto" 
                                >
                                  <PlusCircle className="mr-2 h-4 w-4" /> Registrar
                              </Button>
                            </DialogTrigger>
                          )}
                      </div>
                      {nextSubject && timeGoal > 0 && (
                          <div className="mt-2">
                            <Progress value={progress} className="h-2" />
                            <div className="flex justify-between text-sm text-muted-foreground mt-2">
                              <span>{timeStudied} min</span>
                              <span>Meta: {timeGoal} min</span>
                            </div>
                          </div>
                      )}
                  </div>
              </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progresso por Matéria</CardTitle>
              <CardDescription>Visão geral do avanço em cada matéria do ciclo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjects.map(subject => {
                const completed = subject.topics.filter(t => t.isCompleted).length;
                const total = subject.topics.length;
                const progress = total > 0 ? (completed / total) * 100 : 0;
                return (
                  <div key={subject.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{subject.name}</span>
                      <span className="text-muted-foreground">{completed}/{total}</span>
                    </div>
                    <Progress value={progress} style={{'--subject-color': subject.color} as React.CSSProperties} className="h-2 [&>div]:bg-[var(--subject-color)]" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tempo por Matéria</CardTitle>
              <CardDescription>Distribuição do tempo de estudo focado.</CardDescription>
            </CardHeader>
            <CardContent>
               <ChartContainer config={{}} className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                      accessibilityLayer
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        width={120}
                        tick={{ fontSize: 12 }}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent
                          formatter={(value) => `${value} min`}
                          labelClassName="font-bold"
                          indicator="dot"
                        />}
                      />
                      <Bar dataKey="minutes" radius={5} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Percent className="h-5 w-5"/> Percentual de Acertos por Matéria</CardTitle>
              <CardDescription>Desempenho geral nas questões registradas.</CardDescription>
            </CardHeader>
            <CardContent>
               {accuracyChartData.length > 0 ? (
                 <ChartContainer config={{}} className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={accuracyChartData}
                        layout="vertical"
                        margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                        accessibilityLayer
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} unit="%" />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tickLine={false}
                          axisLine={false}
                          width={120}
                          tick={{ fontSize: 12 }}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent
                            formatter={(value) => `${value}%`}
                            labelClassName="font-bold"
                            indicator="dot"
                          />}
                        />
                        <Bar dataKey="accuracy" radius={5} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
               ) : (
                 <div className="flex items-center justify-center h-[250px] text-muted-foreground text-center">
                   <p>Nenhum registro de questões encontrado para exibir o desempenho.</p>
                 </div>
               )}
            </CardContent>
          </Card>

        </div>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>Registrar Nova Sessão de Estudo</DialogTitle>
            </DialogHeader>
            <StudyLogForm 
                onSave={() => setIsLogFormOpen(false)} 
                onCancel={() => setIsLogFormOpen(false)} 
                initialData={initialLogData}
             />
        </DialogContent>
      </div>
    </Dialog>
  );
}
