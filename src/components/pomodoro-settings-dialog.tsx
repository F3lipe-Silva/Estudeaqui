'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStudy } from '@/contexts/study-context';

interface PomodoroSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PomodoroSettingsDialog({ 
  open, 
  onOpenChange 
}: PomodoroSettingsDialogProps) {
  const { data, dispatch } = useStudy();
  const { pomodoroSettings } = data;
  
  const [focusDuration, setFocusDuration] = useState(25); // in minutes
  const [shortBreakDuration, setShortBreakDuration] = useState(5); // in minutes
  const [longBreakDuration, setLongBreakDuration] = useState(15); // in minutes
  const [cyclesUntilLongBreak, setCyclesUntilLongBreak] = useState(4);

  // Initialize form with current settings
  useEffect(() => {
    if (pomodoroSettings) {
      setFocusDuration(Math.round(pomodoroSettings.tasks?.[0]?.duration / 60 || 25));
      setShortBreakDuration(Math.round(pomodoroSettings.shortBreakDuration / 60 || 5));
      setLongBreakDuration(Math.round(pomodoroSettings.longBreakDuration / 60 || 15));
      setCyclesUntilLongBreak(pomodoroSettings.cyclesUntilLongBreak || 4);
    }
  }, [pomodoroSettings, open]);

  const handleSave = () => {
    // Create a single focus task with the specified duration
    const newSettings = {
      tasks: [
        {
          id: 'task-1',
          name: 'Foco',
          duration: focusDuration * 60 // Convert to seconds
        }
      ],
      shortBreakDuration: shortBreakDuration * 60, // Convert to seconds
      longBreakDuration: longBreakDuration * 60, // Convert to seconds
      cyclesUntilLongBreak,
    };

    dispatch({
      type: 'UPDATE_POMODORO_SETTINGS',
      payload: newSettings,
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset to current settings when canceling
    if (pomodoroSettings) {
      setFocusDuration(Math.round(pomodoroSettings.tasks?.[0]?.duration / 60 || 25));
      setShortBreakDuration(Math.round(pomodoroSettings.shortBreakDuration / 60 || 5));
      setLongBreakDuration(Math.round(pomodoroSettings.longBreakDuration / 60 || 15));
      setCyclesUntilLongBreak(pomodoroSettings.cyclesUntilLongBreak || 4);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Configurações do Pomodoro
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="focusDuration">Tempo de Foco (minutos)</Label>
            <Input
              id="focusDuration"
              type="number"
              min="1"
              max="60"
              value={focusDuration}
              onChange={(e) => setFocusDuration(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortBreakDuration">Tempo de Pausa Curta (minutos)</Label>
            <Input
              id="shortBreakDuration"
              type="number"
              min="1"
              max="30"
              value={shortBreakDuration}
              onChange={(e) => setShortBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longBreakDuration">Tempo de Pausa Longa (minutos)</Label>
            <Input
              id="longBreakDuration"
              type="number"
              min="1"
              max="60"
              value={longBreakDuration}
              onChange={(e) => setLongBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cyclesUntilLongBreak">Ciclos até Pausa Longa</Label>
            <Input
              id="cyclesUntilLongBreak"
              type="number"
              min="1"
              max="10"
              value={cyclesUntilLongBreak}
              onChange={(e) => setCyclesUntilLongBreak(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Configurações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}