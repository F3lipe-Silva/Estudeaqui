'use client';

import { useState, useEffect } from 'react';
import { useStudy } from '@/contexts/study-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Play, Clock, Target, BookOpen, Settings } from 'lucide-react';

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

  // Detectar finalização de sessão para mostrar popup
  useEffect(() => {
    if (pomodoroState.status === 'short_break' || pomodoroState.status === 'long_break') {
      // Verificar se veio de uma sessão de foco
      if (pomodoroState.previousStatus === 'focus' && pomodoroState.associatedItemId) {
        const topic = subjects.flatMap(s => s.topics).find(t => t.id === pomodoroState.associatedItemId);
        const subject = subjects.find(s => s.id === topic?.subjectId);

        if (topic && subject) {
          // Calcular tempo decorrido (when transitioning from focus to break)
          // Use originalDuration if available, otherwise calculate from task
          const timeElapsed = pomodoroState.originalDuration
            ? Math.round(pomodoroState.originalDuration / 60)
            : Math.round((pomodoroSettings?.tasks?.[pomodoroState.currentTaskIndex || 0]?.duration || 0) / 60);

          setCompletionData({
            subjectId: subject.id,
            topicId: topic.id,
            duration: timeElapsed,
            subjectName: subject.name,
            topicName: topic.name
          });
          setCompletionDialogOpen(true);
        }
      }
    }
  }, [pomodoroState.status, pomodoroState.previousStatus, pomodoroState.associatedItemId, subjects]);


  const getCurrentSessionInfo = () => {
    if (!pomodoroState.associatedItemId || pomodoroState.status === 'idle') {
      return null;
    }

    const topic = subjects.flatMap(s => s.topics).find(t => t.id === pomodoroState.associatedItemId);
    const subject = subjects.find(s => s.id === topic?.subjectId);
    
    if (!topic || !subject) return null;

    return {
      subject: subject.name,
      topic: topic.name,
      status: pomodoroState.status,
      color: subject.color
    };
  };

  const currentSession = getCurrentSessionInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Pomodoro</h2>
          <p className="text-muted-foreground">Gerencie suas sessões de estudo focadas</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSettingsDialogOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </Button>
      </div>

      <div className="space-y-6">
        {/* Temporizador Principal - Destaque */}
        <div className="max-w-2xl mx-auto">
          <ClockWidget />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Seletor de Sessão */}
          <div>
            <PomodoroSessionSelector
              onStartSession={(subjectId: string, topicId: string, customDuration?: number) => {
                startPomodoroForItem(topicId, 'topic', true, customDuration);
              }}
              disabled={pomodoroState.status !== 'idle'}
            />
          </div>

          {/* Widget Pomodoro e Status */}
          <div className="space-y-6">


          {/* Status da Sessão */}
          {currentSession && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Detalhes da Sessão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: currentSession.color }}
                  />
                  <div>
                    <p className="font-medium">{currentSession.subject}</p>
                    <p className="text-sm text-muted-foreground">{currentSession.topic}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Status: <span className={cn(
                      "font-medium",
                      currentSession.status === 'focus' && "text-green-600",
                      currentSession.status === 'paused' && "text-yellow-600",
                      currentSession.status === 'short_break' && "text-blue-600",
                      currentSession.status === 'long_break' && "text-purple-600"
                    )}>
                      {currentSession.status === 'focus' && 'Foco'}
                      {currentSession.status === 'paused' && 'Pausado'}
                      {currentSession.status === 'short_break' && 'Pausa Curta'}
                      {currentSession.status === 'long_break' && 'Pausa Longa'}
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações quando não há sessão */}
          {!currentSession && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto bg-muted/50 p-4 rounded-full w-fit">
                    <Timer className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Nenhuma sessão ativa</h3>
                    <p className="text-muted-foreground mb-4">
                      Selecione uma matéria e assunto para iniciar sua sessão Pomodoro
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog de Conclusão */}
      <PomodoroCompletionDialog
        open={completionDialogOpen}
        onOpenChange={setCompletionDialogOpen}
        sessionData={completionData}
      />

      {/* Dialog de Configurações */}
      <PomodoroSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
    </div>
  );
}