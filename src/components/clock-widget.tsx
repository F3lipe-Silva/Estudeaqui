'use client';

import { useStudy } from '@/contexts/study-context';
import { Card, CardContent } from '@/components/ui/card';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ClockWidget() {
  const { pomodoroState, pausePomodoroTimer, setPomodoroState } = useStudy();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (pomodoroState.status) {
      case 'focus':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'short_break':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'long_break':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'paused':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (pomodoroState.status) {
      case 'focus':
        return 'FOCO';
      case 'short_break':
        return 'PAUSA CURTA';
      case 'long_break':
        return 'PAUSA LONGA';
      case 'paused':
        return 'PAUSADO';
      default:
        return 'PRONTO';
    }
  };

  const handlePause = () => {
    if (pomodoroState.status === 'focus' || pomodoroState.status === 'short_break' || pomodoroState.status === 'long_break') {
      pausePomodoroTimer();
    }
  };

  const handleReset = () => {
    setPomodoroState({
      status: 'idle',
      timeRemaining: 0,
      currentCycle: 0,
      pomodorosCompletedToday: 0,
      associatedItemId: undefined,
      associatedItemType: undefined,
      key: 0,
      previousStatus: undefined,
      pausedTime: 0,
      currentTaskIndex: undefined,
      isCustomDuration: false,
      originalDuration: undefined
    });
  };

  return (
    <Card className={cn(
      'border-2 transition-all duration-300',
      getStatusColor()
    )}>
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          {/* Status */}
          <div className="text-sm font-semibold uppercase tracking-wider">
            {getStatusText()}
          </div>

          {/* Timer Principal */}
          <div className="relative">
            <div className="text-6xl md:text-7xl font-bold font-mono tabular-nums">
              {formatTime(pomodoroState.timeRemaining)}
            </div>
            
            {/* Indicador de progresso visual */}
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  'h-2 rounded-full transition-all duration-1000',
                  pomodoroState.status === 'focus' && 'bg-green-500',
                  pomodoroState.status === 'short_break' && 'bg-blue-500',
                  pomodoroState.status === 'long_break' && 'bg-purple-500',
                  pomodoroState.status === 'paused' && 'bg-yellow-500',
                  pomodoroState.status === 'idle' && 'bg-gray-400'
                )}
                style={{
                  width: pomodoroState.originalDuration && pomodoroState.originalDuration > 0 
                    ? `${((pomodoroState.originalDuration - pomodoroState.timeRemaining) / pomodoroState.originalDuration) * 100}%`
                    : '0%'
                }}
              />
            </div>
          </div>

          {/* Controles */}
          <div className="flex justify-center gap-2">
            {(pomodoroState.status === 'focus' || pomodoroState.status === 'short_break' || pomodoroState.status === 'long_break') && (
              <Button 
                onClick={handlePause}
                size="lg"
                variant="outline"
                className="rounded-full w-14 h-14"
              >
                <Pause className="h-6 w-6" />
              </Button>
            )}
            
            <Button 
              onClick={handleReset}
              size="lg"
              variant="outline"
              className="rounded-full w-14 h-14"
            >
              <RotateCcw className="h-6 w-6" />
            </Button>
          </div>

          {/* Informações adicionais */}
          {pomodoroState.currentCycle !== undefined && (
            <div className="text-sm text-muted-foreground">
              Ciclo {pomodoroState.currentCycle}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}