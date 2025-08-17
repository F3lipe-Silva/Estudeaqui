"use client";

import { useState, useEffect, useMemo } from 'react';
import { useStudy } from '@/contexts/study-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Pencil, ArrowUp, ArrowDown, Save, X, RotateCcw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn, generateUUID } from '@/lib/utils';
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
import type { StudySequenceItem, StudySequence } from '@/lib/types';


export default function StudySequencePlanningTab() {
  const { data, dispatch, setActiveTab } = useStudy();
  const { subjects, studySequence, sequenceIndex } = data;
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingSequence, setEditingSequence] = useState<StudySequenceItem[]>([]);
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [logInitialData, setLogInitialData] = useState<any>(undefined);
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);
  const [newSequenceName, setNewSequenceName] = useState('');
  
  useEffect(() => {
     if (studySequence) {
      // Garante que todos os itens da sequência tenham um ID único para React keys
      const sequenceWithIds = studySequence.sequence.map(item => ({
        ...item,
        id: item.id || generateUUID() // Gera ID se estiver faltando
      }));
      setEditingSequence(sequenceWithIds);
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
    // Para permitir matérias duplicadas, geramos um ID único para cada item da sequência
    setEditingSequence(prev => [...prev, { id: generateUUID(), subjectId, totalTimeStudied: 0 }]);
    toast({ title: "Matéria adicionada à sequência!" });
  };

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  const openLogForm = (subjectId: string, itemSequenceIndex: number) => {
    setLogInitialData({ subjectId, sequenceItemIndex: itemSequenceIndex });
    setIsLogFormOpen(true);
  }

  const handleCreateEmptySequence = () => {
      const newSequence = {
          id: generateUUID(),
          name: "Plano de Estudos Manual",
          sequence: subjects.map(s => ({ id: `${s.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`, subjectId: s.id, totalTimeStudied: 0 })),
      };
      dispatch({ type: 'SAVE_STUDY_SEQUENCE', payload: newSequence });
      toast({ title: "Sequência de estudos criada!" });
  }

  const handleCreateEmptyManualSequence = () => {
    const newSequence = {
        id: generateUUID(),
        name: "Plano de Estudos Manual Vazio",
        sequence: [], // Sequence is empty, so no need to add IDs here. IDs will be added when subjects are added.
    };
    dispatch({ type: 'SAVE_STUDY_SEQUENCE', payload: newSequence });
    toast({ title: "Plano de estudos manual vazio criado!" });
  }


  const handleSaveAsNew = () => {
    if (!newSequenceName.trim()) {
      toast({ title: "Por favor, dê um nome ao seu novo plano de estudos." });
      return;
    }
    dispatch({
      type: 'SAVE_AS_NEW_SEQUENCE',
      payload: { name: newSequenceName.trim(), sequence: editingSequence }
    });
    toast({ title: `Plano "${newSequenceName.trim()}" salvo com sucesso!` });
    setIsSaveAsModalOpen(false);
    setNewSequenceName('');
  };

  const handleLoadSequence = (id: string) => {
    dispatch({ type: 'LOAD_SAVED_SEQUENCE', payload: id });
    toast({ title: "Plano de estudos carregado com sucesso!" });
    setIsEditing(false); // Sair do modo de edição ao carregar
  };

  const handleDeleteSavedSequence = (id: string) => {
    dispatch({ type: 'DELETE_SAVED_SEQUENCE', payload: id });
    toast({ title: "Plano de estudos salvo apagado!" });
  };


  return (
    <>
    <Dialog open={isLogFormOpen} onOpenChange={setIsLogFormOpen}>
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
    </Dialog>

    <Dialog open={isSaveAsModalOpen} onOpenChange={setIsSaveAsModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salvar Plano de Estudos</DialogTitle>
          <CardDescription>Dê um nome ao seu plano de estudos para salvá-lo e poder restaurá-lo mais tarde.</CardDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="new-sequence-name">Nome do Plano</Label>
          <Input
            id="new-sequence-name"
            value={newSequenceName}
            onChange={(e) => setNewSequenceName(e.target.value)}
            placeholder="Ex: Ciclo 1 Concurso X"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsSaveAsModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveAsNew} disabled={!newSequenceName.trim()}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>

    <div className="min-h-[calc(100vh-12rem)] sm:min-h-[calc(100vh-4rem)] p-4 space-y-6">
        {/* Adiciona um botão para "Salvar como" fora do modo de edição */}
        {studySequence && (
          <div className="flex justify-end">
            <Button onClick={() => setIsSaveAsModalOpen(true)}><Save className="mr-2 h-4 w-4" /> Salvar como...</Button>
          </div>
        )}

        {/* Seção para listar planejamentos salvos */}
        {data.savedStudySequences && data.savedStudySequences.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Meus Planos Salvos</CardTitle>
              <CardDescription>Selecione um plano para carregar ou gerencie seus planos salvos.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.savedStudySequences.map(savedSeq => (
                  <div key={savedSeq.id} className="flex items-center justify-between p-2 border rounded-md">
                    <span className="font-medium">{savedSeq.name}</span>
                    <div className="flex flex-wrap gap-2"> {/* Adjusted for mobile */}
                      <Button size="sm" variant="outline" onClick={() => handleLoadSequence(savedSeq.id)}>Carregar</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">Excluir</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Plano Salvo?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o plano "{savedSeq.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2"> {/* Adjusted for mobile */}
                            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel> {/* Adjusted width for mobile */}
                            <AlertDialogAction onClick={() => handleDeleteSavedSequence(savedSeq.id)} className="w-full sm:w-auto">Excluir</AlertDialogAction> {/* Adjusted width for mobile */}
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
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
                                    <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2"> {/* Adjusted for mobile */}
                                    <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel> {/* Adjusted width for mobile */}
                                    <AlertDialogAction onClick={handleResetSequence} className="w-full sm:w-auto">Confirmar</AlertDialogAction> {/* Adjusted width for mobile */}
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
                                    <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2"> {/* Adjusted for mobile */}
                                    <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel> {/* Adjusted width for mobile */}
                                    <AlertDialogAction onClick={handleDeleteSequence} className="w-full sm:w-auto">Confirmar</AlertDialogAction> {/* Adjusted width for mobile */}
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
                                        key={item.id}
                                        className={cn(
                                            "flex flex-col sm:flex-row items-center gap-3 p-2 rounded-md bg-card border transition-all", /* Adjusted for mobile */
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
                                          <div className='flex flex-wrap gap-1 justify-end w-full sm:w-auto'> {/* Adjusted for mobile */}
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveSequenceItem(index, index - 1)} disabled={index === 0}><ArrowUp className="h-4 w-4"/></Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveSequenceItem(index, index + 1)} disabled={index === editingSequence.length - 1}><ArrowDown className="h-4 w-4"/></Button>
                                            <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDeleteSequenceItem(index)}><Trash2 className="h-4 w-4"/></Button>
                                          </div>
                                        )}
                                        <Button size="sm" variant="outline" className="flex-shrink-0 w-full sm:w-auto" onClick={() => openLogForm(subject.id, index)}> {/* Adjusted width for mobile */}
                                            <PlusCircle className="mr-2 h-4 w-4" /> Registrar
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {isEditing && (
                        <div className="flex flex-col sm:flex-row items-end gap-2 mt-4"> {/* Adjusted for mobile */}
                            <div className="flex-grow w-full"> {/* Adjusted for mobile */}
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
                            <Button onClick={() => handleAddSubjectToSequence(undefined)} disabled={!subjects.length} className="w-full sm:w-auto"> {/* Adjusted width for mobile */}
                                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        ) : (
            <Card>
                <CardHeader>
                  <CardTitle>Crie sua Sequência de Estudos</CardTitle>
                   <CardDescription>Você ainda não tem um plano de estudos. Crie um para começar.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={handleCreateEmptySequence} className="w-full sm:w-auto"> {/* Adjusted width for mobile */}
                        Criar Plano Básico (com todas as matérias)
                      </Button>
                      <Button variant="outline" onClick={handleCreateEmptyManualSequence} className="w-full sm:w-auto"> {/* Adjusted width for mobile */}
                        Criar Plano Manual Vazio
                      </Button>
                </CardContent>
            </Card>
        )}
      </div>
    </>
  );
}
