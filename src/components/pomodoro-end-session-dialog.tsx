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
import { Square, Clock, CheckCircle, X, BookOpen } from 'lucide-react';
import StudyLogForm from '@/components/study-log-form';

interface PomodoroEndSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionData: {
    subjectId: string;
    topicId: string;
    duration: number;
    subjectName: string;
    topicName: string;
  } | null;
  onEndWithoutRegister?: () => void;
  onSessionRegistered?: () => void;
}

export default function PomodoroEndSessionDialog({
  open,
  onOpenChange,
  sessionData,
  onEndWithoutRegister,
  onSessionRegistered
}: PomodoroEndSessionDialogProps) {
  const [showLogForm, setShowLogForm] = useState(false);

  if (!sessionData) return null;

  const handleRegisterSession = () => {
    setShowLogForm(true);
  };

  const handleLogFormSave = () => {
    // Não encerre o Pomodoro após salvar o registro
    setShowLogForm(false);
    onOpenChange(false);
  };

  const handleLogFormCancel = () => {
    setShowLogForm(false);
    onOpenChange(false);
  };

  const handleEndWithoutRegister = () => {
    if (onEndWithoutRegister) {
      onEndWithoutRegister();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {!showLogForm ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Square className="h-5 w-5 text-orange-600" />
                Encerrar Sessão
              </DialogTitle>
              <DialogDescription>
                Você está prestes a encerrar sua sessão Pomodoro.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6">
              <div className="space-y-4">
                {/* Tempo decorrido */}
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold text-orange-600">
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
              <Button variant="outline" onClick={handleEndWithoutRegister} className="w-full sm:w-auto">
                <X className="mr-2 h-4 w-4" />
                Encerrar sem Registrar
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