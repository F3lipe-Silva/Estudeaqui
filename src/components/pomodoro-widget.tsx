
"use client";

import { useStudy } from '@/contexts/study-context';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Play, Pause, Timer, Square, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import PomodoroEndSessionDialog from '@/components/pomodoro-end-session-dialog';
import PomodoroTransitionDialog from '@/components/pomodoro-transition-dialog';

export default function PomodoroWidget() {
  const { pomodoroState, setPomodoroState, setActiveTab, data, pausePomodoroTimer, advancePomodoroCycle, skipToBreak, continueToBreak, showTransitionDialog, setShowTransitionDialog } = useStudy();
  const { status, timeRemaining, associatedItemId, associatedItemType, currentTaskIndex } = pomodoroState;
  const { pomodoroSettings, subjects } = data;
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [endingSessionWithoutRegister, setEndingSessionWithoutRegister] = useState(false);
  
  const getAssociatedItemDetails = () => {
    if (!associatedItemId) return null;

    if (associatedItemType === 'revision') {
      const topic = data.subjects.flatMap(s => s.topics).find(t => t.id === associatedItemId);
      if (topic) {
        const subject = data.subjects.find(s => s.id === topic.subjectId);
        return { name: `Revisão: ${topic.name}`, subjectName: subject?.name };
      }
    } else {
        const topic = data.subjects.flatMap(s => s.topics).find(t => t.id === associatedItemId);
        if (topic) {
           const subject = data.subjects.find(s => s.id === topic.subjectId);
           return { name: `Estudo: ${topic.name}`, subjectName: subject?.name };
        }
    }
    return null;
  };

  const itemDetails = getAssociatedItemDetails();
  const currentTask = (status === 'focus' || (status === 'paused' && pomodoroState.previousStatus === 'focus')) && currentTaskIndex !== undefined && pomodoroSettings?.tasks
    ? pomodoroSettings.tasks[currentTaskIndex]
    : null;

  const totalDuration = currentTask
    ? currentTask.duration
    : status === 'short_break' || (status === 'paused' && pomodoroState.previousStatus === 'short_break')
    ? pomodoroSettings?.shortBreakDuration || 1
    : status === 'long_break' || (status === 'paused' && pomodoroState.previousStatus === 'long_break')
    ? pomodoroSettings?.longBreakDuration || 1
    : 1;


  const handleTogglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    pausePomodoroTimer();
  };

  const handleEndSession = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Pause the timer when showing the end session dialog
    // Only set previousStatus if it's not already paused (to preserve original state)
    setPomodoroState(prev => ({
      ...prev,
      status: 'paused',
      previousStatus: prev.previousStatus || prev.status  // Keep existing previousStatus if it exists
    }));
    setShowEndDialog(true);
  };

  const handleConfirmEndSession = () => {
    setPomodoroState(prev => ({ ...prev, status: 'idle' }));
    setShowEndDialog(false);
  };

  const handleEndWithoutRegister = () => {
    // Set flag to indicate we're ending without registration
    setEndingSessionWithoutRegister(true);
    // End the session completely without registration
    setPomodoroState(prev => ({ ...prev, status: 'idle' }));
  };

  const handleSessionRegistered = () => {
    // Não encerre o Pomodoro após registrar a sessão
    // Apenas feche o diálogo e continue o Pomodoro normalmente
    setEndingSessionWithoutRegister(false);
  };

  const handleCancelEndSession = () => {
    // If user cancels, resume the previous status before the end session dialog was opened
    // This is now handled in the onOpenChange callback of the dialog
    // Reset the flag to ensure proper behavior
    setEndingSessionWithoutRegister(false);
    setShowEndDialog(false);
  };
  
  const getBackgroundColor = () => {
    const currentStatus = status === 'paused' ? pomodoroState.previousStatus : status;
    switch (currentStatus) {
      case 'focus':
        return 'bg-pomodoro-focus/20 text-pomodoro-focus';
      case 'short_break':
      case 'long_break':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted';
    }
  };
  
  const getProgressIndicatorClass = () => {
     const currentStatus = status === 'paused' ? pomodoroState.previousStatus : status;
    switch (currentStatus) {
      case 'focus':
        return '[&>div]:bg-pomodoro-focus';
      case 'short_break':
      case 'long_break':
        return '[&>div]:bg-destructive';
      default:
        return '[&>div]:bg-muted-foreground';
    }
  }

  if (status === 'idle' || !pomodoroSettings) {
    return null;
  }

  const progressValue = totalDuration > 0 ? (timeRemaining / totalDuration) * 100 : 0;

  const getStatusText = () => {
    if (status === 'paused') {
        return `Pausado (${currentTask?.name || 'Pausa'})`
    }
    if (status === 'focus' && currentTask) {
        return currentTask.name;
    }
    if (status === 'short_break') return 'Pausa Curta';
    if (status === 'long_break') return 'Pausa Longa';
    return 'Pomodoro';
  }

  // Calculate effective time spent for the transition dialog
  const calculateEffectiveTimeSpent = () => {
    if (pomodoroState.originalDuration) {
      // For custom duration sessions
      return pomodoroState.originalDuration - timeRemaining;
    } else {
      // For task-based sessions
      const currentTask = currentTaskIndex !== undefined && pomodoroSettings?.tasks?.[currentTaskIndex];
      if (currentTask) {
        return currentTask.duration - timeRemaining;
      } else {
        return ((pomodoroSettings?.tasks?.[0]?.duration) || 1500) - timeRemaining; // default to 25 mins
      }
    }
  };

  const effectiveTimeSpent = calculateEffectiveTimeSpent();

  return (
    <>
      <div
        className={cn("w-full p-3 flex items-center gap-4 cursor-pointer transition-all hover:shadow-md border-b-2", getBackgroundColor())}
        onClick={() => setActiveTab('planning')}
      >
        <div className="p-2 rounded-full bg-background/50 flex-shrink-0">
          <Timer className="h-5 w-5" />
        </div>
        <div className="flex-grow min-w-0"> {/* Garantir que o conteúdo central possa truncar */}
          <div className="flex justify-between items-center text-sm font-semibold mb-1.5">
            <span className="truncate mr-2"> {/* Adicionar margem direita para espaçamento */}
              {getStatusText()}
              {itemDetails && <span className="text-xs font-normal text-muted-foreground ml-1">• {itemDetails.subjectName}</span>}
            </span>
            <span className="font-mono text-base whitespace-nowrap">{`${Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:${Math.round(timeRemaining % 60).toString().padStart(2, '0')}`}</span>
          </div>
          <div className="flex justify-between items-center">
            <Progress value={progressValue} className={cn("h-2 shadow-inner", getProgressIndicatorClass())} />
            <span className="ml-2 text-xs text-muted-foreground whitespace-nowrap">
              Ciclo {pomodoroState.currentCycle + 1} de {(pomodoroSettings?.cyclesUntilLongBreak || 4)}
            </span>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {(status === 'focus' || status === 'paused') && (
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-background/80" onClick={handleTogglePause}>
              {status === 'paused' ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </Button>
          )}
          {(status === 'focus' || status === 'paused') && (
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-destructive/10 text-destructive hover:text-destructive" onClick={handleEndSession} title="Encerrar sessão">
              <Square className="h-5 w-5" />
            </Button>
          )}
          {(status === 'focus' || status === 'short_break' || status === 'long_break') && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-primary/10 text-primary hover:text-primary"
              onClick={advancePomodoroCycle}
              title="Avançar ciclo"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Dialog de Encerrar Sessão */}
      <PomodoroEndSessionDialog
        open={showEndDialog}
        onOpenChange={(open) => {
          // If dialog is being closed (open = false), check if we should resume or keep as idle
          if (!open) {
            // Check if the dialog was closed because user chose to end without registration
            if (endingSessionWithoutRegister) {
              // Reset the flag and don't resume anything - session is already ended
              setEndingSessionWithoutRegister(false);
            } else if (pomodoroState.status === 'paused' && pomodoroState.previousStatus) {
              // Dialog was closed in other way (e.g., clicked outside), resume the previous state
              setPomodoroState(prev => {
                if (prev.status === 'paused' && prev.previousStatus) {
                  return { ...prev, status: prev.previousStatus, previousStatus: undefined, key: prev.key + 1 };
                }
                return prev;
              });
            }
          }
          setShowEndDialog(open);
        }}
        onEndWithoutRegister={handleEndWithoutRegister}
        onSessionRegistered={handleSessionRegistered}
        sessionData={itemDetails ? {
          subjectId: subjects.find(s => s.topics.some(t => t.id === pomodoroState.associatedItemId))?.id || '',
          topicId: pomodoroState.associatedItemId || '',
          duration: Math.round((totalDuration - timeRemaining) / 60),
          subjectName: itemDetails.subjectName || '',
          topicName: itemDetails.name.replace('Estudo: ', '').replace('Revisão: ', '')
        } : null}
      />

      {/* Dialog de Transição Pomodoro */}
      <PomodoroTransitionDialog
        open={showTransitionDialog}
        onOpenChange={setShowTransitionDialog}
        currentStatus={status}
        timeSpent={effectiveTimeSpent}
        topicId={associatedItemId}
        subjectId={subjects.find(s => s.topics.some(t => t.id === associatedItemId))?.id}
        onSkipToBreak={skipToBreak}
        onContinueToBreak={continueToBreak}
        onPausePomodoro={pausePomodoroTimer}
      />
    </>
  );
}
