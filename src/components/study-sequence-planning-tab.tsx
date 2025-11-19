
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useStudy } from '@/contexts/study-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Pencil, ArrowUp, ArrowDown, Save, X, RotateCcw, Calendar, Upload } from 'lucide-react';
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
      // Cancelar edição - voltar ao estado original
      setEditingSequence(studySequence?.sequence || []);
      setIsEditing(false);
    } else {
      // Entrar no modo de edição
      setIsEditing(true);
    }
  }

  const handleSaveSequence = () => {
    if (!studySequence) {
      toast({ title: "Erro: Nenhuma sequência para salvar." });
      return;
    }

    try {
      dispatch({
        type: 'SAVE_STUDY_SEQUENCE',
        payload: { ...studySequence, sequence: editingSequence }
      });
      setIsEditing(false);
      toast({ title: "Sequência de estudos atualizada!" });
    } catch (error) {
      console.error('Erro ao salvar sequência:', error);
      toast({ title: "Erro ao salvar sequência.", variant: "destructive" });
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

  const handleDeleteSequenceItem = (index: number) => {
    const newSequence = [...editingSequence];
    newSequence.splice(index, 1);
    setEditingSequence(newSequence);
  };

  const handleAddSubjectToSequence = (subjectId: string | undefined) => {
    if (!subjectId) {
      toast({ title: "Selecione uma matéria para adicionar." });
      return;
    }
    // Verificar se a matéria já existe na sequência
    const existingItem = editingSequence.find(item => item.subjectId === subjectId);
    if (existingItem) {
      toast({ title: "Esta matéria já está na sequência." });
      return;
    }
    setEditingSequence(prev => [...prev, { subjectId, totalTimeStudied: 0 }]);
  };

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

  const handleCreateEmptyManualSequence = () => {
    const newSequence = {
        id: `seq-manual-empty-${Date.now()}`,
        name: "Plano de Estudos Manual Vazio",
        sequence: [],
    };
    dispatch({ type: 'SAVE_STUDY_SEQUENCE', payload: newSequence });
    toast({ title: "Plano de estudos manual vazio criado!" });
  }

  const handleImportToPlanning = () => {
    if (!studySequence) return;

    // Calcular o tempo total estudado por matéria na sequência
    const timeBySubject: { [subjectId: string]: number } = {};
    studySequence.sequence.forEach(item => {
      const minutes = item.totalTimeStudied || 0;
      if (timeBySubject[item.subjectId]) {
        timeBySubject[item.subjectId] += minutes;
      } else {
        timeBySubject[item.subjectId] = minutes;
      }
    });

    // Converter minutos para horas e atualizar as matérias
    Object.entries(timeBySubject).forEach(([subjectId, totalMinutes]) => {
      const hours = totalMinutes / 60; // converter minutos para horas
      dispatch({
        type: 'UPDATE_SUBJECT',
        payload: {
          id: subjectId,
          data: { horasSemanais: hours }
        }
      });
    });

    // Mudar para a aba de planejamento
    setActiveTab('planning');
    toast({ title: "Dados importados para o planejamento semanal!" });
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
            <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-primary/5 to-transparent">
                    <div>
                      <CardTitle className="text-xl">{studySequence.name}</CardTitle>
                      <CardDescription className="mt-1">Este é o seu plano de estudos ativo. Conclua cada sessão para avançar.</CardDescription>
                    </div>
                     <div className="flex flex-col sm:flex-row gap-2">
                        {isEditing ? (
                          <>
                           <Button onClick={handleSaveSequence}><Save className="mr-2 h-4 w-4"/>Salvar</Button>
                           <Button variant="outline" onClick={handleEditToggle}><X className="mr-2 h-4 w-4"/>Cancelar</Button>
                          </>
                        ) : (
                          <>
                            <Button onClick={handleImportToPlanning} variant="secondary">
                              <Upload className="mr-2 h-4 w-4" /> Importar p/ Planejamento
                            </Button>
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
                <CardContent className="pt-6">
                    <div className="mt-4 p-3 border-2 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 min-h-[60px]">
                        <div className="space-y-3">
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
                                            "flex items-center gap-3 p-4 rounded-xl bg-card border-2 transition-all duration-300 hover:shadow-md",
                                            isCurrent && "border-primary ring-4 ring-primary/20 shadow-lg scale-[1.02] z-10",
                                            isCompleted && !isEditing && "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-colors",
                                            isCurrent ? "bg-primary text-primary-foreground" : 
                                            isCompleted ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : 
                                            "bg-muted text-muted-foreground"
                                        )}>
                                            {index + 1}
                                        </div>
                                        <div className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-card" style={{ backgroundColor: subject.color, '--tw-ring-color': subject.color } as React.CSSProperties}></div>
                                        <div className="flex-grow">
                                            <span className="font-semibold text-base">{subject.name}</span>
                                            {subject.studyDuration && (
                                                <div className="text-xs text-muted-foreground mt-2">
                                                    <Progress value={progress} className={cn(
                                                        "h-2 shadow-inner",
                                                        isCompleted && "[&>div]:bg-green-500"
                                                    )} />
                                                    <div className="flex justify-between mt-1.5">
                                                        <span className="font-medium">{timeStudied} min</span>
                                                        <span>Meta: {timeGoal} min</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {isEditing && (
                                          <div className='flex gap-1'>
                                            <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-primary/10 rounded-full" onClick={() => moveSequenceItem(index, index - 1)} disabled={index === 0}><ArrowUp className="h-4 w-4"/></Button>
                                            <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-primary/10 rounded-full" onClick={() => moveSequenceItem(index, index + 1)} disabled={index === editingSequence.length - 1}><ArrowDown className="h-4 w-4"/></Button>
                                            <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-full" onClick={() => handleDeleteSequenceItem(index)}><Trash2 className="h-4 w-4"/></Button>
                                          </div>
                                        )}
                                        <Button size="sm" variant="outline" className="flex-shrink-0 shadow-sm hover:shadow-md transition-shadow" onClick={() => openLogForm(subject.id, index)}>
                                            <PlusCircle className="mr-2 h-4 w-4" /> Registrar
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {isEditing && (
                        <div className="flex items-end gap-2 mt-4">
                            <div className="flex-grow">
                                <Label htmlFor="add-subject-to-sequence">Adicionar Matéria</Label>
                                <Select onValueChange={handleAddSubjectToSequence}>
                                    <SelectTrigger id="add-subject-to-sequence">
                                        <SelectValue placeholder="Selecione uma matéria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map(subject => (
                                            <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={() => handleAddSubjectToSequence(undefined)} disabled={!subjects.length}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        ) : (
            <Card className="text-center py-12 border-2 border-dashed hover:border-solid hover:shadow-md transition-all">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                      <Calendar className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Crie sua Sequência de Estudos</CardTitle>
                   <CardDescription className="mt-2 text-base">Você ainda não tem um plano de estudos. Crie um para começar.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={handleCreateEmptySequence} className="shadow-sm hover:shadow-md transition-shadow">
                        Criar Plano Básico (com todas as matérias)
                      </Button>
                      <Button variant="outline" onClick={handleCreateEmptyManualSequence} className="shadow-sm hover:shadow-md transition-shadow">
                        Criar Plano Manual Vazio
                      </Button>
                </CardContent>
            </Card>
        )}
      </div>
    </Dialog>
  );
}
