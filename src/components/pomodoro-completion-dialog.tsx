'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, BookOpen, X } from 'lucide-react';
import StudyLogForm from '@/components/study-log-form';

interface PomodoroCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionData: {
    subjectId: string;
    topicId: string;
    duration: number;
    subjectName: string;
    topicName: string;
  } | null;
}

export default function PomodoroCompletionDialog({ 
  open, 
  onOpenChange, 
  sessionData 
}: PomodoroCompletionDialogProps) {
  const [showLogForm, setShowLogForm] = useState(false);

  if (!sessionData) return null;

  const handleRegisterSession = () => {
    setShowLogForm(true);
  };

  const handleLogFormSave = () => {
    setShowLogForm(false);
    onOpenChange(false);
  };

  const handleLogFormCancel = () => {
    setShowLogForm(false);
    onOpenChange(false);
  };

  const handleIgnore = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {!showLogForm ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Sessão Concluída!
              </DialogTitle>
              <DialogDescription>
                Parabéns! Você completou mais uma sessão de estudo focada.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6">
              <div className="space-y-4">
                {/* Tempo decorrido */}
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">
                    {sessionData.duration} minutos
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tempo de estudo focado
                  </div>
                </div>

                {/* Detalhes da sessão */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{sessionData.subjectName}</div>
                      <div className="text-sm text-muted-foreground">{sessionData.topicName}</div>
                    </div>
                  </div>
                </div>

                {/* Pergunta de registro */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Deseja registrar esta sessão no seu histórico de estudos?
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleIgnore} className="w-full sm:w-auto">
                <X className="mr-2 h-4 w-4" />
                Ignorar
              </Button>
              <Button onClick={handleRegisterSession} className="w-full sm:w-auto">
                <CheckCircle className="mr-2 h-4 w-4" />
                Registrar Sessão
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Sessão de Estudo</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da sua sessão para registrar no histórico.
              </DialogDescription>
            </DialogHeader>
            
            <StudyLogForm
              onSave={handleLogFormSave}
              onCancel={handleLogFormCancel}
              initialData={{
                subjectId: sessionData.subjectId,
                topicId: sessionData.topicId,
                duration: sessionData.duration,
                source: 'pomodoro'
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}