'use client';

import { useState, useEffect } from 'react';
import { useStudy } from '@/contexts/study-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, BookOpen, Target } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PomodoroSessionSelectorProps {
  onStartSession: (subjectId: string, topicId: string, customDuration?: number) => void;
  disabled?: boolean;
}

export default function PomodoroSessionSelector({ onStartSession, disabled = false }: PomodoroSessionSelectorProps) {
  const { data } = useStudy();
  const { subjects } = data;
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState(25); // Default to 25 minutes

  const availableTopics = subjects.find(s => s.id === selectedSubject)?.topics || [];

  // Efeito para atalho de teclado
  useEffect(() => {
    const handleOpenSelector = () => {
      // Focar no primeiro seletor
      const firstSelect = document.querySelector('[data-testid="subject-select"]') as HTMLButtonElement;
      if (firstSelect && !disabled) {
        firstSelect.click();
      }
    };

    window.addEventListener('open-pomodoro-selector', handleOpenSelector);
    return () => window.removeEventListener('open-pomodoro-selector', handleOpenSelector);
  }, [disabled]);

  const handleStartSession = () => {
    if (selectedSubject && selectedTopic) {
      const duration = useCustomTime ? customTime * 60 : undefined; // Convert to seconds
      onStartSession(selectedSubject, selectedTopic, duration);
    }
  };

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Iniciar Sessão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seleção de Matéria */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Matéria</label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={disabled}>
            <SelectTrigger data-testid="subject-select">
              <SelectValue placeholder="Selecione uma matéria" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: subject.color }}
                    />
                    {subject.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Seleção de Assunto */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Assunto</label>
          <Select 
            value={selectedTopic} 
            onValueChange={setSelectedTopic} 
            disabled={disabled || !selectedSubject}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um assunto" />
            </SelectTrigger>
            <SelectContent>
              {availableTopics.map(topic => (
                <SelectItem key={topic.id} value={topic.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {topic.order.toString().padStart(2, '0')}
                    </span>
                    {topic.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Informações da Matéria Selecionada */}
        {selectedSubjectData && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedSubjectData.color }}
              />
              <span className="font-medium text-sm">{selectedSubjectData.name}</span>
            </div>

            {selectedSubjectData.studyDuration && (
              <div className="text-xs text-muted-foreground">
                <BookOpen className="inline h-3 w-3 mr-1" />
                Tempo sugerido: {selectedSubjectData.studyDuration} min
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              {availableTopics.length} assuntos disponíveis
            </div>
          </div>
        )}

        {/* Opção de tempo personalizado */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useCustomTime"
              checked={useCustomTime}
              onChange={(e) => setUseCustomTime(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="useCustomTime" className="text-sm font-medium">
              Usar tempo personalizado
            </Label>
          </div>

          {useCustomTime && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="customTime">Tempo (minutos)</Label>
              <Input
                id="customTime"
                type="number"
                value={customTime}
                onChange={(e) => setCustomTime(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="120"
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Botão Iniciar */}
        <Button
          onClick={handleStartSession}
          disabled={!selectedSubject || !selectedTopic || disabled}
          className="w-full"
          size="lg"
        >
          <Play className="mr-2 h-4 w-4" />
          Iniciar Sessão Pomodoro
        </Button>

        {disabled && (
          <p className="text-xs text-muted-foreground text-center">
            Finalize a sessão atual para iniciar uma nova
          </p>
        )}
      </CardContent>
    </Card>
  );
}