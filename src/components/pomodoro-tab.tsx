
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useStudy } from '@/contexts/study-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Play, Pause, RotateCcw, FastForward, Settings, BarChart2, PlusCircle, Trash2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { PomodoroSubTask, PomodoroSettings } from '@/lib/types';
import { Progress } from '@/components/ui/progress';


export default function PomodoroTab() {
  const { pomodoroState, setPomodoroState, data, dispatch } = useStudy();
  const { toast } = useToast();
  const { pomodoroSettings } = data;
  
  const { status, timeRemaining, currentCycle, pomodorosCompletedToday, associatedItemId, associatedItemType, key, currentTaskIndex } = pomodoroState;
  
  const getAssociatedItemDetails = () => {
    if (!associatedItemId) return null;

    if (associatedItemType === 'revision') {
        const topic = data.subjects.flatMap(s => s.topics).find(t => t.id === associatedItemId);
        if (topic) {
           const subject = data.subjects.find(s => s.id === topic.subjectId);
           return { topic, subject };
        }
    } else {
        const topic = data.subjects.flatMap(s => s.topics).find(t => t.id === associatedItemId);
        if (topic) {
           const subject = data.subjects.find(s => s.id === topic.subjectId);
           return { topic, subject };
        }
    }
    return null;
  };

  const itemDetails = getAssociatedItemDetails();
  
  const pomodoroHistoryChartData = useMemo(() => {
    const pomodoroLogs = data.studyLog.filter(log => log.source === 'pomodoro');
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, i)).reverse();

    return last7Days.map(day => {
        const count = pomodoroLogs.filter(log => isSameDay(parseISO(log.date), day)).length;
        return {
            date: format(day, "eee", { locale: ptBR }),
            pomodoros: count,
        };
    });
  }, [data.studyLog]);


  const handleStart = () => {
     if (!pomodoroSettings?.tasks || pomodoroSettings.tasks.length === 0) {
      toast({ title: "Nenhuma tarefa de foco", description: "Adicione pelo menos uma tarefa de foco nas configurações.", variant: "destructive" });
      return;
    }
    setPomodoroState(prev => ({ ...prev, status: 'focus', timeRemaining: pomodoroSettings.tasks[0].duration, currentTaskIndex: 0, key: prev.key + 1 }));
  }

  const handleTogglePause = () => {
    setPomodoroState(prev => {
      if (prev.status === 'paused') {
        const previousStatus = prev.previousStatus || 'focus';
        return { ...prev, status: previousStatus, pausedTime: undefined, previousStatus: undefined, };
      }
      return { ...prev, status: 'paused', pausedTime: Date.now(), previousStatus: prev.status };
    });
  };

  const handleReset = () => {
    setPomodoroState(prev => ({ 
      ...prev, 
      status: 'idle', 
      timeRemaining: pomodoroSettings?.tasks?.[0]?.duration || 0,
      currentTaskIndex: 0,
      currentCycle: 0 
    }));
  }
  
  const handleSkip = () => {
    setPomodoroState(prev => ({ ...prev, timeRemaining: 1 }));
  };

  const formatTime = (seconds: number) => {
    const roundedSeconds = Math.round(seconds);
    return `${Math.floor(roundedSeconds / 60).toString().padStart(2, '0')}:${(roundedSeconds % 60).toString().padStart(2, '0')}`;
  }
  
  const [tempSettings, setTempSettings] = useState<PomodoroSettings | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (pomodoroSettings) {
      // Create a deep copy to avoid direct mutation
      setTempSettings(JSON.parse(JSON.stringify(pomodoroSettings)));
    }
  }, [pomodoroSettings, isSettingsOpen]);


  const handleSettingsSave = () => {
    if (!tempSettings) return;
    dispatch({ type: 'UPDATE_POMODORO_SETTINGS', payload: tempSettings });
    toast({ title: "Configurações salvas!" });
    setIsSettingsOpen(false);
  }
  
  const handleTaskChange = (index: number, field: 'name' | 'duration', value: string | number) => {
    if (!tempSettings) return;
    const newTasks = [...(tempSettings.tasks || [])];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTempSettings(s => s ? ({ ...s, tasks: newTasks }) : null);
  }

  const handleAddTask = () => {
    if (!tempSettings) return;
    const newTask: PomodoroSubTask = { id: `task-${Date.now()}`, name: 'Nova Tarefa', duration: 25 * 60 };
    setTempSettings(s => s ? ({ ...s, tasks: [...(s.tasks || []), newTask] }) : null);
  }

  const handleDeleteTask = (id: string) => {
    if (!tempSettings) return;
    setTempSettings(s => s ? ({ ...s, tasks: (s.tasks || []).filter(t => t.id !== id) }) : null);
  }
  
  const currentTask = (status === 'focus' || (status === 'paused' && pomodoroState.previousStatus === 'focus')) && currentTaskIndex !== undefined && pomodoroSettings?.tasks
    ? pomodoroSettings.tasks[currentTaskIndex]
    : null;

  const totalFocusDuration = useMemo(() => {
    if (!pomodoroSettings?.tasks) return 0;
    return pomodoroSettings.tasks.reduce((acc, task) => acc + task.duration, 0);
  }, [pomodoroSettings?.tasks]);
  
  const completedFocusDuration = useMemo(() => {
    if (!currentTask || currentTaskIndex === undefined || !pomodoroSettings?.tasks) return 0;
    const completedTasksDuration = pomodoroSettings.tasks.slice(0, currentTaskIndex).reduce((acc, task) => acc + task.duration, 0);
    const currentTaskElapsedTime = currentTask.duration - timeRemaining;
    return completedTasksDuration + currentTaskElapsedTime;
  }, [currentTaskIndex, timeRemaining, pomodoroSettings?.tasks, currentTask]);
  
  const focusProgress = totalFocusDuration > 0 ? (completedFocusDuration / totalFocusDuration) * 100 : 0;

  const statusMap = {
      focus: { text: currentTask?.name || "Foco", color: "text-pomodoro-focus", bg: "bg-pomodoro-focus/10" },
      short_break: { text: "Pausa Curta", color: "text-destructive", bg: "bg-destructive/10" },
      long_break: { text: "Pausa Longa", color: "text-destructive", bg: "bg-destructive/10" },
      paused: { text: `Pausado (${currentTask?.name || 'Pausa'})`, color: "text-muted-foreground", bg: "bg-muted/30" },
      idle: { text: "Pronto?", color: "text-primary", bg: "bg-primary/10" }
  };

  const currentStatusInfo = statusMap[status] || statusMap.idle;


  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
        <Card className={cn("w-full max-w-md text-center shadow-2xl transition-colors duration-500", currentStatusInfo.bg)}>
            <CardHeader>
                <CardTitle className={cn("text-lg font-semibold uppercase tracking-wider", currentStatusInfo.color)}>
                    {currentStatusInfo.text}
                </CardTitle>
                {itemDetails?.subject && itemDetails?.topic ? (
                  <CardDescription>
                    {associatedItemType === 'revision' ? 'Revisando: ' : 'Estudando: '} 
                    {itemDetails.subject.name} - {itemDetails.topic.name}
                  </CardDescription>
                ) : (
                   status === 'idle' && <CardDescription>Pronto para focar?</CardDescription>
                )}
            </CardHeader>
            <CardContent>
                <div key={key} className="text-8xl font-bold font-mono tracking-tighter animate-in fade-in duration-700">
                  {formatTime(timeRemaining)}
                </div>
                {status === 'focus' && (
                  <div className="px-6 pt-2">
                    <Progress value={focusProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Progresso total do bloco: {formatTime(completedFocusDuration)} / {formatTime(totalFocusDuration)}
                    </p>
                  </div>
                )}
            </CardContent>
        </Card>
      
      <div className="flex space-x-4">
        {status === 'idle' ? (
          <Button onClick={handleStart} size="lg" className="w-32 h-16 rounded-full text-lg">
            <Play className="mr-2" /> Iniciar
          </Button>
        ) : (
          <>
            <Button onClick={handleTogglePause} size="lg" variant="secondary" className="w-32 h-16 rounded-full text-lg">
              {status === 'paused' ? <Play className="mr-2" /> : <Pause className="mr-2" />}
              {status === 'paused' ? 'Continuar' : 'Pausar'}
            </Button>
            <Button onClick={handleSkip} size="lg" variant="ghost" title="Pular tarefa/pausa">
              <FastForward />
            </Button>
            <Button onClick={handleReset} size="lg" variant="ghost" title="Resetar ciclo">
              <RotateCcw />
            </Button>
          </>
        )}
      </div>

      <div className="flex gap-4 items-center">
          <div className="text-center">
            <p className="font-bold text-xl">{currentCycle}</p>
            <p className="text-sm text-muted-foreground">Ciclos</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-xl">{pomodorosCompletedToday}</p>
            <p className="text-sm text-muted-foreground">Blocos (hoje)</p>
          </div>
          
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
             <DialogTrigger asChild>
                <Button variant="outline" size="icon"><Settings/></Button>
             </DialogTrigger>
             <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Personalizar Pomodoro</DialogTitle>
                    <DialogDescription>Ajuste os tempos e as tarefas da sua sessão de estudo focado.</DialogDescription>
                </DialogHeader>
                {tempSettings && (
                <div className="space-y-6 py-4">
                    <div>
                      <Label className="text-base font-semibold">Tarefas do Bloco de Foco</Label>
                      <CardDescription className="text-sm">Defina as etapas da sua sessão de estudo.</CardDescription>
                       <div className="space-y-2 mt-2">
                          {tempSettings.tasks?.map((task, index) => (
                              <div key={task.id} className="flex items-center gap-2 p-2 border rounded-lg">
                                 <Input 
                                  value={task.name} 
                                  onChange={(e) => handleTaskChange(index, 'name', e.target.value)} 
                                  className="h-9"
                                  placeholder="Nome da tarefa"
                                />
                                <Input 
                                  type="number"
                                  value={task.duration / 60} 
                                  onChange={(e) => handleTaskChange(index, 'duration', Number(e.target.value) * 60)} 
                                  className="w-24 h-9"
                                  placeholder="Min"
                                />
                                <Button variant="ghost" size="icon" className="text-destructive h-9 w-9" onClick={() => handleDeleteTask(task.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                          ))}
                       </div>
                       <Button variant="outline" size="sm" className="mt-2" onClick={handleAddTask}><PlusCircle className="mr-2 h-4 w-4" />Adicionar Tarefa</Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="short">Pausa Curta (min)</Label>
                          <Input id="short" type="number" value={tempSettings.shortBreakDuration / 60} onChange={(e) => setTempSettings(s => s ? ({...s, shortBreakDuration: Number(e.target.value) * 60}) : null)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="long">Pausa Longa (min)</Label>
                          <Input id="long" type="number" value={tempSettings.longBreakDuration / 60} onChange={(e) => setTempSettings(s => s ? ({...s, longBreakDuration: Number(e.target.value) * 60}) : null)} />
                      </div>
                    </div>
                    <div>
                        <Label htmlFor="cycles">Ciclos até a pausa longa</Label>
                        <Input id="cycles" type="number" value={tempSettings.cyclesUntilLongBreak} onChange={(e) => setTempSettings(s => s ? ({...s, cyclesUntilLongBreak: Number(e.target.value)}) : null)} />
                    </div>
                </div>
                )}
                <DialogFooter>
                    <Button onClick={handleSettingsSave}><Save className="mr-2 h-4 w-4" /> Salvar Alterações</Button>
                </DialogFooter>
             </DialogContent>
          </Dialog>
      </div>

       <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            Histórico da Semana
          </CardTitle>
           <CardDescription>
            Blocos de foco concluídos nos últimos 7 dias.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] p-2">
           <ChartContainer config={{}} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pomodoroHistoryChartData} accessibilityLayer>
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    formatter={(value) => `${value} blocos`}
                                    indicator="dot"
                                />
                            }
                        />
                        <Bar
                            dataKey="pomodoros"
                            fill="var(--color-primary)"
                            radius={4}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

    