'use client';

import { useState, useEffect } from 'react';
import { useStudy } from '@/contexts/study-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Play, Clock, Target, BookOpen, Settings, CheckCircle2 } from 'lucide-react';

import PomodoroSessionSelector from '@/components/pomodoro-session-selector';
import PomodoroCompletionDialog from '@/components/pomodoro-completion-dialog';
import PomodoroSettingsDialog from '@/components/pomodoro-settings-dialog';
import ClockWidget from '@/components/clock-widget';
import { cn } from '@/lib/utils';

export default function PomodoroTab() {
  const { pomodoroState, data, startPomodoroForItem } = useStudy();
  const { subjects, pomodoroSettings } = data;
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const currentTopic = subjects.flatMap(s => s.topics).find(t => t.id === pomodoroState.associatedItemId);
  const currentSubject = subjects.find(s => s.id === currentTopic?.subjectId);

  // Detectar finalização de sessão para mostrar popup
  useEffect(() => {
    if (pomodoroState.status === 'short_break' || pomodoroState.status === 'long_break') {
      if (pomodoroState.previousStatus === 'focus' && pomodoroState.associatedItemId) {
        const topic = subjects.flatMap(s => s.topics).find(t => t.id === pomodoroState.associatedItemId);
        const subject = subjects.find(s => s.id === topic?.subjectId);

        if (topic && subject) {
          const timeElapsed = pomodoroState.originalDuration
            ? Math.round(pomodoroState.originalDuration / 60)
            : Math.round((pomodoroSettings?.tasks?.[pomodoroState.currentTaskIndex || 0]?.duration || 0) / 60);

          setCompletionData({
            subjectId: subject.id,
            topicId: topic.id,
            duration: timeElapsed,
            subjectName: subject.name,
            topicName: topic.name,
            subjectColor: subject.color
          });
          setCompletionDialogOpen(true);
        }
      }
    }
  }, [pomodoroState.status, pomodoroState.previousStatus, pomodoroState.associatedItemId, subjects, pomodoroSettings]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-primary">Pomodoro</h2>
          <p className="text-muted-foreground font-medium">Foco total no que importa.</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSettingsDialogOpen(true)} className="rounded-full hover:bg-primary/10">
          <Settings className="h-6 w-6 text-primary" />
        </Button>
      </div>

      <div className="grid gap-8">
        {/* Main Timer Section */}
        <section className="space-y-6">
          <ClockWidget />
        </section>

        {/* Dynamic Content: Task List or Session Selector */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {pomodoroState.status !== 'idle' ? (
            <div className="grid md:grid-cols-5 gap-6">
              {/* Active Session Info */}
              <Card className="md:col-span-2 border-2 border-primary/10 bg-primary/[0.02]">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Target className="h-4 w-4" /> Sessão Atual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-4 h-4 mt-1.5 rounded-full ring-4 ring-offset-2 ring-offset-background" 
                      style={{ backgroundColor: currentSubject?.color, '--tw-ring-color': currentSubject?.color + '40' } as any}
                    />
                    <div className="space-y-1">
                      <p className="text-xl font-black leading-none">{currentSubject?.name || 'Foco Livre'}</p>
                      <p className="text-muted-foreground font-medium">{currentTopic?.name || 'Sem tópico definido'}</p>
                    </div>
                  </div>
                  
                  {currentSubject?.studyDuration && (
                    <div className="pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <Clock className="h-4 w-4" />
                      Meta sugerida: {currentSubject.studyDuration} minutos
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Task List (Mirroring Mobile Logic) */}
              <Card className="md:col-span-3 border-2">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Roteiro da Sessão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pomodoroSettings.tasks.map((task, index) => {
                      const isCurrent = index === pomodoroState.currentTaskIndex;
                      const isCompleted = index < (pomodoroState.currentTaskIndex || 0);
                      
                      return (
                        <div 
                          key={task.id}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border transition-all",
                            isCurrent ? "border-primary bg-primary/5 shadow-sm scale-[1.02]" : "border-transparent opacity-60",
                            isCompleted && "bg-muted/30"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs",
                            isCurrent ? "bg-primary text-primary-foreground" : 
                            isCompleted ? "bg-green-500 text-white" : "bg-muted"
                          )}>
                            {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                          </div>
                          <div className="flex-grow">
                            <p className={cn("font-bold", isCompleted && "line-through opacity-50")}>{task.name}</p>
                            <p className="text-[10px] uppercase font-black tracking-widest opacity-50">{Math.floor(task.duration / 60)} min</p>
                          </div>
                          {isCurrent && (
                            <div className="flex gap-1">
                              <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                              <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                              <span className="w-1 h-1 rounded-full bg-primary animate-bounce" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Idle State: Big Session Selector */
            <div className="max-w-xl mx-auto">
              <PomodoroSessionSelector
                onStartSession={(subjectId: string, topicId: string, customDuration?: number) => {
                  startPomodoroForItem(topicId, 'topic', true, customDuration);
                }}
                disabled={pomodoroState.status !== 'idle'}
              />
            </div>
          )}
        </section>
      </div>

      <PomodoroCompletionDialog
        open={completionDialogOpen}
        onOpenChange={setCompletionDialogOpen}
        sessionData={completionData}
      />

      <PomodoroSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
    </div>
  );
}