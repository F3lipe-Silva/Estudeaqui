'use client';

import { useStudy } from '@/contexts/study-context';
import { Card, CardContent } from '@/components/ui/card';
import { Timer, Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ClockWidget() {
  const { pomodoroState, pausePomodoroTimer, setPomodoroState, advancePomodoroCycle, data } = useStudy();
  const { pomodoroSettings } = data;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusConfig = () => {
    switch (pomodoroState.status) {
      case 'focus':
        return {
          label: 'Foco',
          color: 'text-primary border-primary',
          bgColor: 'bg-primary/10',
          progressColor: 'stroke-primary',
          animate: 'animate-pulse-subtle'
        };
      case 'short_break':
        return {
          label: 'Pausa Curta',
          color: 'text-blue-700 border-blue-300',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          progressColor: 'stroke-blue-600',
          animate: ''
        };
      case 'long_break':
        return {
          label: 'Pausa Longa',
          color: 'text-purple-700 border-purple-300',
          bgColor: 'bg-purple-100 dark:bg-purple-900/30',
          progressColor: 'stroke-purple-600',
          animate: ''
        };
      case 'paused':
        return {
          label: 'Pausado',
          color: 'text-yellow-700 border-yellow-400',
          bgColor: 'bg-yellow-100/50 dark:bg-yellow-900/20',
          progressColor: 'stroke-yellow-500',
          animate: ''
        };
      default:
        return {
          label: 'Pronto',
          color: 'text-muted-foreground border-border',
          bgColor: 'bg-muted/30',
          progressColor: 'stroke-muted-foreground',
          animate: ''
        };
    }
  };

  const status = getStatusConfig();

  const handleReset = () => {
    setPomodoroState({
      ...pomodoroState,
      status: 'idle',
      timeRemaining: pomodoroSettings?.tasks?.[0]?.duration || 1500,
      currentCycle: 0,
      key: pomodoroState.key + 1,
      currentTaskIndex: 0,
    });
  };

  const currentTask = pomodoroState.currentTaskIndex !== undefined ? pomodoroSettings?.tasks?.[pomodoroState.currentTaskIndex] : null;
  const totalDuration = pomodoroState.isCustomDuration ? pomodoroState.originalDuration || 1500 : (currentTask?.duration || 1500);
  const progress = totalDuration > 0 ? (pomodoroState.timeRemaining / totalDuration) : 1;

  return (
    <div className="flex flex-col items-center space-y-6 py-4">
      {/* Timer Circular */}
      <div className="relative flex items-center justify-center w-64 h-64 md:w-72 md:h-72">
        {/* SVG Progress Circle */}
        <svg className="absolute w-full h-full -rotate-90 transform">
          <circle
            cx="50%"
            cy="50%"
            r="42%"
            className="stroke-muted/20 fill-none"
            strokeWidth="10"
          />
          <circle
            cx="50%"
            cy="50%"
            r="42%"
            className={cn("fill-none transition-all duration-1000 ease-linear", status.progressColor)}
            strokeWidth="10"
            strokeDasharray="553" 
            strokeDashoffset={553 * (1 - progress)}
            strokeLinecap="round"
          />
        </svg>

        {/* Timer Content */}
        <div className={cn(
          "z-10 flex flex-col items-center justify-center w-56 h-56 md:w-64 md:h-64 rounded-full shadow-inner transition-all duration-500 border-4 border-transparent",
          status.bgColor,
          pomodoroState.status === 'focus' && "border-primary/20",
          status.animate
        )}>
          <span className={cn("text-xs font-black uppercase tracking-widest mb-1", status.color)}>
            {status.label}
          </span>
          <div className="text-5xl md:text-6xl font-black font-mono tracking-tighter tabular-nums select-none">
            {formatTime(pomodoroState.timeRemaining)}
          </div>
          {pomodoroState.status === 'focus' && currentTask && (
            <span className="mt-1 text-[10px] font-bold opacity-60 uppercase tracking-widest max-w-[140px] truncate text-center">
              {currentTask.name}
            </span>
          )}
        </div>
      </div>
      
      {/* Controles */}
      <div className="flex items-center gap-4">
        <Button 
          onClick={handleReset}
          size="icon"
          variant="ghost"
          className="rounded-full w-10 h-10 hover:bg-destructive/10 hover:text-destructive transition-colors"
          title="Reiniciar"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button 
          onClick={() => {
            if (['focus', 'short_break', 'long_break', 'paused'].includes(pomodoroState.status)) {
              pausePomodoroTimer();
            }
          }}
          size="icon"
          className={cn(
            "rounded-full w-16 h-16 shadow-lg transition-transform active:scale-95",
            "bg-primary text-primary-foreground hover:opacity-90"
          )}
        >
          {pomodoroState.status === 'paused' || pomodoroState.status === 'idle' ? (
            <Play className="h-8 w-8 fill-current ml-1" />
          ) : (
            <Pause className="h-8 w-8 fill-current" />
          )}
        </Button>

        <Button 
          onClick={advancePomodoroCycle}
          size="icon"
          variant="ghost"
          disabled={pomodoroState.status === 'idle'}
          className="rounded-full w-10 h-10 hover:bg-primary/10 transition-colors"
          title="Avançar etapa"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Sessions Summary */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Ciclo {pomodoroState.currentCycle + 1}
          </span>
        </div>
        <div className="w-px h-3 bg-border" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {pomodoroState.pomodorosCompletedToday} concluídas hoje
        </span>
      </div>
    </div>
  );
}