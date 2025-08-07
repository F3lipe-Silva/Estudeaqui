
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useStudy } from '@/contexts/study-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Pencil, ArrowUp, ArrowDown, Save, X, RotateCcw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import StudyLogForm from '@/components/study-log-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { StudySequenceItem } from '@/lib/types';


export default function StudySequencePlanningTab() {
  const { data, dispatch, setActiveTab } = useStudy();
  const { subjects, studySequence, sequenceIndex } = data;
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingSequence, setEditingSequence] = useState<StudySequenceItem[]>([]);
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [logInitialData, setLogInitialData] = useState<any>(undefined);
  
  useEffect(() => {
     if (studySequence) {
      setEditingSequence(studySequence.sequence);
    }
  }, [studySequence]);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditingSequence(studySequence?.sequence || []);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }

  const handleSaveSequence = () => {
    if(studySequence) {
       dispatch({ 
        type: 'SAVE_STUDY_SEQUENCE', 
        payload: { ...studySequence, sequence: editingSequence } 
      });
      setIsEditing(false);
      toast({ title: "Sequência de estudos atualizada!" });
    }
  }

  const moveSequenceItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= editingSequence.length) return;
    const newSequence = [...editingSequence];
    const [movedItem] = newSequence.splice(fromIndex, 1);
    newSequence.splice(toIndex, 0, movedItem);
    setEditingSequence(newSequence);
  };
  
  const handleResetSequence = () => {
    dispatch({ type: 'RESET_STUDY_SEQUENCE' });
    toast({ title: 'Ciclo de estudos reiniciado!'});
  }
  
  const handleDeleteSequence = () => {
      dispatch({ type: 'SAVE_STUDY_SEQUENCE', payload: null });
      toast({ title: "Sequência de estudos apagada."});
      setIsEditing(false);
  }

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  const openLogForm = (subjectId: string, itemSequenceIndex: number) => {
    setLogInitialData({ subjectId, sequenceItemIndex: itemSequenceIndex });
    setIsLogFormOpen(true);
  }

  const handleCreateEmptySequence = () => {
      const newSequence = {
          id: `seq-manual-${Date.now()}`,
          name: "Plano de Estudos Manual",
          sequence: subjects.map(s => ({ subjectId: s.id, totalTimeStudied: 0 })),
      };
      dispatch({ type: 'SAVE_STUDY_SEQUENCE', payload: newSequence });
      toast({ title: "Sequência de estudos criada!" });
  }


  return (
    <Dialog open={isLogFormOpen} onOpenChange={setIsLogFormOpen}>
      <div className="space-y-6">
        <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>Registrar Sessão de Estudo</DialogTitle>
            </DialogHeader>
            <StudyLogForm 
                onSave={() => setIsLogFormOpen(false)} 
                onCancel={() => setIsLogFormOpen(false)}
                initialData={logInitialData}
            />
        </DialogContent>
        
        {studySequence ? (
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>{studySequence.name}</CardTitle>
                      <CardDescription>Este é o seu plano de estudos ativo. Conclua cada sessão para avançar.</CardDescription>
                    </div>
                     <div className="flex flex-col sm:flex-row gap-2">
                        {isEditing ? (
                          <>
                           <Button onClick={handleSaveSequence}><Save className="mr-2 h-4 w-4"/>Salvar</Button>
                           <Button variant="outline" onClick={handleEditToggle}><X className="mr-2 h-4 w-4"/>Cancelar</Button>
                          </>
                        ) : (
                          <>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline"><RotateCcw className="mr-2 h-4 w-4" />Reiniciar Ciclo</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Reiniciar Ciclo?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Isto irá zerar o progresso de tempo estudado de todas as sessões e voltar ao início da sequência. A ordem das matérias será mantida.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleResetSequence}>Confirmar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button onClick={handleEditToggle}><Pencil className="mr-2 h-4 w-4"/>Editar</Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Apagar</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Apagar Sequência?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tem certeza que deseja apagar sua sequência de estudos atual? Você precisará gerar uma nova.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteSequence}>Confirmar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                     </div>
                </CardHeader>
                <CardContent>
                    <div className="mt-4 p-2 border rounded-lg bg-muted/20 min-h-[60px]">
                        <div className="space-y-2">
                            {(isEditing ? editingSequence : studySequence.sequence).map((item, index) => {
                                const subject = getSubjectById(item.subjectId);
                                if (!subject) return null;

                                const isCurrent = index === sequenceIndex && !isEditing;
                                const timeStudied = item.totalTimeStudied || 0;
                                const timeGoal = subject.studyDuration || 60;
                                const progress = timeGoal > 0 ? (timeStudied / timeGoal) * 100 : 0;
                                const isCompleted = timeStudied >= timeGoal;

                                return (
                                    <div
                                        key={`${item.subjectId}-${index}`}
                                        className={cn(
                                            "flex items-center gap-3 p-2 rounded-md bg-card border transition-all",
                                            isCurrent && "border-primary ring-2 ring-primary/50",
                                            isCompleted && !isEditing && "bg-green-600/10 border-green-600/20"
                                        )}
                                    >
                                        <span className="font-mono text-sm text-muted-foreground w-6 text-center">{index + 1}</span>
                                        <div className="w-2 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color }}></div>
                                        <div className="flex-grow">
                                            <span className="font-medium text-sm">{subject.name}</span>
                                            {subject.studyDuration && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    <Progress value={progress} className="h-1 my-1" />
                                                    <span>{timeStudied} de {timeGoal} min concluídos</span>
                                                </div>
                                            )}
                                        </div>
                                        {isEditing && (
                                          <div className='flex gap-1'>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveSequenceItem(index, index - 1)} disabled={index === 0}><ArrowUp className="h-4 w-4"/></Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveSequenceItem(index, index + 1)} disabled={index === editingSequence.length - 1}><ArrowDown className="h-4 w-4"/></Button>
                                          </div>
                                        )}
                                        <Button size="sm" variant="outline" className="flex-shrink-0" onClick={() => openLogForm(subject.id, index)}>
                                            <PlusCircle className="mr-2 h-4 w-4" /> Registrar
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>
        ) : (
            <Card>
                <CardHeader>
                  <CardTitle>Crie sua Sequência de Estudos</CardTitle>
                   <CardDescription>Você ainda não tem um plano de estudos. Crie um para começar.</CardDescription>
                </CardHeader>
                <CardContent>
                      <Button onClick={handleCreateEmptySequence}>
                        Criar Plano Básico (com todas as matérias)
                      </Button>
                </CardContent>
            </Card>
        )}
      </div>
    </Dialog>
  );
}
