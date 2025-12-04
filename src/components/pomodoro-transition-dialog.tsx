'use client';

import { useState, useEffect } from 'react';
import { useStudy } from '@/contexts/study-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Play, CheckCircle, Timer } from 'lucide-react';
import StudyLogForm from '@/components/study-log-form';

interface PomodoroTransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: 'focus' | 'short_break' | 'long_break' | 'paused';
  timeSpent: number; // Time spent in seconds
  topicId?: string;
  subjectId?: string;
  onSkipToBreak?: () => void;
  onContinueToBreak?: () => void;
  onPausePomodoro?: () => void;
}

export default function PomodoroTransitionDialog({
  open,
  onOpenChange,
  currentStatus,
  timeSpent,
  topicId,
  subjectId,
  onSkipToBreak,
  onContinueToBreak,
  onPausePomodoro
}: PomodoroTransitionDialogProps) {
  const { resetManualRegistrationFlag } = useStudy();
  const [showLogForm, setShowLogForm] = useState(false);
  const [sessionSubjectId, setSessionSubjectId] = useState<string | undefined>();
  const [sessionTopicId, setSessionTopicId] = useState<string | undefined>();

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setShowLogForm(false);
      // Set up subject/topic IDs if available
      setSessionSubjectId(subjectId);
      setSessionTopicId(topicId);
    }
  }, [open, subjectId, topicId]);

  // Prevent closing the dialog via ESC or clicking outside
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Add a small delay to ensure all transitions are handled before resetting flag
      setTimeout(() => {
        resetManualRegistrationFlag();
      }, 0);
    }
    // Only allow closing through explicit actions (buttons), not ESC or outside click
    // We'll allow the closing through the buttons by calling resetManualRegistrationFlag
  };

  const handleSkipToBreak = () => {
    if (onSkipToBreak) {
      onSkipToBreak();
    }
    onOpenChange(false);
  };

  const handleContinueToBreak = () => {
    if (onContinueToBreak) {
      onContinueToBreak();
    }
    onOpenChange(false);
  };

  const handlePauseSession = () => {
    if (onPausePomodoro) {
      onPausePomodoro();
    }
    onOpenChange(false);
  };

  const handleRegisterSession = () => {
    setShowLogForm(true);
  };

  const handleLogFormSave = () => {
    // After saving the log, continue to the break
    if (onContinueToBreak) {
      onContinueToBreak();
    }
    setShowLogForm(false);
    onOpenChange(false);
  };

  const handleLogFormCancel = () => {
    setShowLogForm(false);
  };

  const timeSpentMinutes = Math.round(timeSpent / 60);

  useEffect(() => {
    if (open) {
      // Ocultar o botão de fechar quando o diálogo estiver aberto
      const closeButtons = document.querySelectorAll('.dialog-no-close-button .radix-dialog-close');
      closeButtons.forEach(button => {
        (button as HTMLElement).style.display = 'none';
      });
    }
  }, [open]);

  if (!open) return null;

  return (
    <Dialog open={open} modal={true}>
      <DialogContent
        className="max-w-md dialog-no-close-button"
        onInteractOutside={(e) => {
          // Prevenir fechamento ao clicar fora
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          if (!showLogForm) {
            // No Foco Concluído - comportamento igual a "Ir para Pausa"
            handleContinueToBreak();
          } else {
            // No Registrar Sessão - comportamento igual a "Cancelar"
            handleLogFormCancel();
          }
        }}
      >
        {!showLogForm ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                {currentStatus === 'focus' ? 'Foco Concluído!' : 'Pausa Concluída!'}
              </DialogTitle>
              <DialogDescription>
                {currentStatus === 'focus'
                  ? 'Você completou sua sessão de foco. O que deseja fazer agora?'
                  : 'Sua pausa está terminando. O que deseja fazer agora?'}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">
                  {timeSpentMinutes} min
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentStatus === 'focus' ? 'Tempo de foco' : 'Tempo de pausa'}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button 
                  onClick={handleRegisterSession}
                  className="w-full"
                  variant="default"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Registrar Sessão ({timeSpentMinutes} min)
                </Button>
                
                 <Button 
                   onClick={handleContinueToBreak}
                   className="w-full"
                   variant="outline"
                 >
                   <Play className="mr-2 h-4 w-4" />
                   {currentStatus === 'focus' ? 'Ir para Pausa' : 'Próximo Ciclo'}
                 </Button>
                 
                 {currentStatus !== 'focus' && (
                   <Button
                     onClick={handlePauseSession}
                     className="w-full"
                     variant="outline"
                   >
                     Pausar Sessão
                   </Button>
                 )}
              </div>
            </div>

            <DialogFooter className="hidden"> {/* Hidden since we have buttons above */}</DialogFooter>
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
                subjectId: sessionSubjectId,
                topicId: sessionTopicId,
                duration: timeSpentMinutes,
                source: 'pomodoro'
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}