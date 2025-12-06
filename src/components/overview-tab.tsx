
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

  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const formattedDate = today.toLocaleDateString('pt-BR', dateOptions);

  return (
    <Dialog open={isLogFormOpen} onOpenChange={setIsLogFormOpen}>
      <div className="space-y-6 pb-20 md:pb-0">
        {/* Header com Saudação */}
        <div className="flex flex-col space-y-1 px-1">
          <h2 className="text-2xl font-bold tracking-tight">Olá, Estudante! 👋</h2>
          <p className="text-muted-foreground capitalize">{formattedDate}</p>
        </div>

        {/* Métricas - Grid responsivo otimizado para desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-sm font-medium">Hoje</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{formatTime(timeToday)}</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-sm font-medium">Semana</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{formatTime(timeThisWeek)}</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{streak} dias</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-sm font-medium">Tópicos</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{completedTopics}/{totalTopics}</div>
            </CardContent>
          </Card>
        </div>

        {/* Próximo Passo - Destaque */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold px-1">Continuar Estudando</h3>
          <Card className="hover:shadow-lg transition-all border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <BookOpen className="h-8 w-8" />
                    </div>
                    <div>
                      {nextSubject ? (
                        <>
                          <div className="text-xl font-bold">{nextSubject.name}</div>
                          {pendingRevisionTopic ? (
                            <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                              <Repeat className="h-3 w-3" />
                              Revisão: {pendingRevisionTopic.name}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground mt-1">
                              Sequência de Estudo
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-lg font-semibold text-muted-foreground">Crie sua sequência no Planejamento!</div>
                      )}
                    </div>
                  </div>
                </div>

                {nextSubject && timeGoal > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso da Sessão</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{timeStudied} min estudados</span>
                      <span>Meta: {timeGoal} min</span>
                    </div>
                  </div>
                )}

                {nextSubject && (
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => handleOpenLogForm(nextSubject.id, pendingRevisionTopic?.id)}
                      className="w-full h-12 text-base font-semibold shadow-sm"
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      {progress > 0 ? 'Continuar Sessão' : 'Iniciar Sessão'}
                    </Button>
                  </DialogTrigger>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards de análise - Layout otimizado para desktop */}
        <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {/* Progresso por Matéria */}
          <Card className="hover:shadow-md transition-shadow lg:col-span-1 xl:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Progresso por Matéria</CardTitle>
              <CardDescription>Avanço geral nos conteúdos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjects.slice(0, 5).map(subject => {
                const completed = subject.topics.filter(t => t.isCompleted).length;
                const total = subject.topics.length;
                const progress = total > 0 ? (completed / total) * 10 : 0;
                return (
                  <div key={subject.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate max-w-[70%]">{subject.name}</span>
                      <span className="text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} style={{ '--subject-color': subject.color } as React.CSSProperties} className="h-2 [&>div]:bg-[var(--subject-color)]" />
                  </div>
                );
              })}
              {subjects.length > 5 && (
                <Button variant="link" className="w-full text-xs text-muted-foreground h-auto p-0 pt-2">
                  Ver mais {subjects.length - 5} matérias
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Tempo por Matéria */}
          <Card className="hover:shadow-md transition-shadow lg:col-span-1 xl:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Tempo Dedicado</CardTitle>
              <CardDescription>Distribuição por matéria</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                    onClick={(data) => {
                      if (data && data.activePayload) {
                        const subjectName = data.activePayload[0].payload.name;
                        // Navegar para a aba de matérias
                        setActiveTab('cycle');
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number" 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `${value}min`}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      width={100}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <ChartTooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      content={<ChartTooltipContent
                        formatter={(value) => [`${value} min`, 'Tempo']}
                        labelFormatter={(label) => `Matéria: ${label}`}
                      />}
                    />
                    <Bar 
                      dataKey="minutes" 
                      radius={[0, 4, 4, 0]} 
                      barSize={24}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Percentual de Acertos */}
          {accuracyChartData.length > 0 && (
            <Card className="lg:col-span-1 xl:col-span-2 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Percent className="h-5 w-5" /> Desempenho
                </CardTitle>
                <CardDescription>Taxa de acertos por matéria</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={accuracyChartData}
                      layout="vertical"
                      margin={{ left: 0, right: 30, top: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        width={80}
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <ChartTooltip
                        cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                        content={<ChartTooltipContent
                          formatter={(value) => `${value}%`}
                        />}
                      />
                      <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

        </div>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Sessão</DialogTitle>
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
