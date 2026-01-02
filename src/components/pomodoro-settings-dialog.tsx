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
import { Trash2 } from 'lucide-react';
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
  
  const [tasks, setTasks] = useState<{ id: string, name: string, duration: number }[]>([]);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [cyclesUntilLongBreak, setCyclesUntilLongBreak] = useState(4);

  useEffect(() => {
    if (pomodoroSettings && open) {
      setTasks(pomodoroSettings.tasks.map(t => ({ ...t, duration: Math.round(t.duration / 60) })));
      setShortBreakDuration(Math.round(pomodoroSettings.shortBreakDuration / 60));
      setLongBreakDuration(Math.round(pomodoroSettings.longBreakDuration / 60));
      setCyclesUntilLongBreak(pomodoroSettings.cyclesUntilLongBreak);
    }
  }, [pomodoroSettings, open]);

  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const handleAddTask = () => {
    setTasks([...tasks, { id: generateId(), name: 'Nova Tarefa', duration: 25 }]);
  };

  const handleRemoveTask = (id: string) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const handleUpdateTask = (id: string, field: 'name' | 'duration', value: any) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleSave = () => {
    const newSettings = {
      tasks: tasks.map(t => ({ ...t, duration: t.duration * 60 })),
      shortBreakDuration: shortBreakDuration * 60,
      longBreakDuration: longBreakDuration * 60,
      cyclesUntilLongBreak,
    };

    dispatch({
      type: 'UPDATE_POMODORO_SETTINGS',
      payload: newSettings,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações do Pomodoro</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Sessões de Foco */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-bold">Sessões de Foco</Label>
              <Button size="sm" variant="outline" onClick={handleAddTask}>
                Adicionar Tarefa
              </Button>
            </div>
            
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div key={task.id} className="flex gap-2 items-end border p-3 rounded-lg bg-muted/20">
                  <div className="flex-grow space-y-1">
                    <Label className="text-xs">Nome</Label>
                    <Input 
                      value={task.name} 
                      onChange={(e) => handleUpdateTask(task.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Minutos</Label>
                    <Input 
                      type="number"
                      value={task.duration} 
                      onChange={(e) => handleUpdateTask(task.id, 'duration', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive"
                    onClick={() => handleRemoveTask(task.id)}
                    disabled={tasks.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-2">
              <Label>Pausa Curta (min)</Label>
              <Input
                type="number"
                value={shortBreakDuration}
                onChange={(e) => setShortBreakDuration(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Pausa Longa (min)</Label>
              <Input
                type="number"
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ciclos até Pausa Longa</Label>
            <Input
              type="number"
              value={cyclesUntilLongBreak}
              onChange={(e) => setCyclesUntilLongBreak(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Tudo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}