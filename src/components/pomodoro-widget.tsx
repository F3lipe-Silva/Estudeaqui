
"use client";

import { useStudy } from '@/contexts/study-context';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Play, Pause, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export default function PomodoroWidget() {
  const { pomodoroState, setPomodoroState, setActiveTab, data } = useStudy();
  const { status, timeRemaining, associatedItemId, associatedItemType, currentTaskIndex } = pomodoroState;
  const { pomodoroSettings } = data;
  
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
    setPomodoroState(prev => {
      if (prev.status === 'paused') {
        const previousStatus = prev.previousStatus || 'focus';
        return { ...prev, status: previousStatus, previousStatus: undefined };
      }
      return { ...prev, status: 'paused', previousStatus: prev.status };
    });
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

  return (
    <div
      className={cn("w-full p-2 flex items-center gap-4 cursor-pointer transition-all", getBackgroundColor())}
      onClick={() => setActiveTab('pomodoro')}
    >
      <Timer className="h-5 w-5 flex-shrink-0" />
      <div className="flex-grow">
        <div className="flex justify-between items-center text-sm font-medium mb-1">
          <span>
            {getStatusText()}
            {itemDetails && ` - ${itemDetails.subjectName}`}
          </span>
          <span>{`${Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:${Math.round(timeRemaining % 60).toString().padStart(2, '0')}`}</span>
        </div>
        <Progress value={progressValue} className={cn("h-1", getProgressIndicatorClass())} />
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleTogglePause}>
        {status === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
      </Button>
    </div>
  );
}
