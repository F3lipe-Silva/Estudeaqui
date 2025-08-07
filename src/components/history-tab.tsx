"use client";

import { useState } from 'react';
import { useStudy } from '@/contexts/study-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import StudyLogForm from '@/components/study-log-form';
import { PlusCircle, Book, Percent, Target, FileClock, CalendarIcon, Repeat, Edit, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { StudyLogEntry } from '@/lib/types';
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

export default function HistoryTab() {
  const { data, dispatch } = useStudy();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<StudyLogEntry | null>(null);
  
  const getSubjectName = (id: string) => data.subjects.find(s => s.id === id)?.name || 'N/A';
  const getTopicName = (subjectId: string, topicId: string) => data.subjects.find(s => s.id === subjectId)?.topics.find(t => t.id === topicId)?.name || 'N/A';

  const getSourceDisplayName = (source?: string) => {
      if (!source || source === 'site-questoes') return 'Site de Questões';
      if (['A', 'B', 'C', 'D'].includes(source)) return `Revisão ${source}`;
      return source;
  }
  
  const handleEdit = (log: StudyLogEntry) => {
      setEditingLog(log);
      setIsFormOpen(true);
  }
  
  const handleAddNew = () => {
      setEditingLog(null);
      setIsFormOpen(true);
  }

  const handleDelete = (logId: string) => {
      dispatch({ type: 'DELETE_STUDY_LOG', payload: logId });
  }
  
  const handleCloseDialog = () => {
      setIsFormOpen(false);
      setEditingLog(null);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Histórico de Estudos</CardTitle>
            <CardDescription>
              Visualize, adicione e edite seus registros de estudo manuais.
            </CardDescription>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew} className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> Registrar Estudo</Button>
            </DialogTrigger>
            <DialogContent onInteractOutside={handleCloseDialog} className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingLog ? "Editar Registro de Estudo" : "Registrar Nova Sessão de Estudo"}</DialogTitle>
              </DialogHeader>
              <StudyLogForm onSave={handleCloseDialog} onCancel={handleCloseDialog} existingLog={editingLog || undefined} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.studyLog.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum registro de estudo encontrado.</p>
            ) : (
              data.studyLog.map(log => {
                const pagesRead = log.endPage > 0 ? log.endPage - log.startPage + 1 : 0;
                const accuracy = log.questionsTotal > 0 ? (log.questionsCorrect / log.questionsTotal) * 100 : 0;
                return (
                  <Card key={log.id} className="bg-card-foreground/5 relative group">
                    <CardHeader className="p-4">
                       <CardTitle className="text-base flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                         <span>{getSubjectName(log.subjectId)}</span>
                         <span className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                           <CalendarIcon className="h-4 w-4" />
                           {format(parseISO(log.date), "dd/MM/yyyy 'às' HH:mm")}
                         </span>
                       </CardTitle>
                       <CardDescription>{getTopicName(log.subjectId, log.topicId)}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
                       <div className="flex items-center gap-2">
                        <Repeat className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">{getSourceDisplayName(log.source)}</p>
                          <p className="text-xs text-muted-foreground">Fonte</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileClock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">{log.duration} min</p>
                          <p className="text-xs text-muted-foreground">Duração</p>
                        </div>
                      </div>
                       <div className="flex items-center gap-2">
                        <Book className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">{pagesRead > 0 ? `${pagesRead} pág.` : "N/A"}</p>
                          <p className="text-xs text-muted-foreground">Leitura</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">{log.questionsTotal > 0 ? `${log.questionsCorrect}/${log.questionsTotal}`: "N/A"}</p>
                          <p className="text-xs text-muted-foreground">Questões</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Percent className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">{log.questionsTotal > 0 ? `${accuracy.toFixed(0)}%` : 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">Acertos</p>
                        </div>
                      </div>
                    </CardContent>
                     <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(log)}>
                              <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Remover Registro?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          Esta ação não pode ser desfeita. Tem certeza que deseja apagar este registro de estudo?
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(log.id)}>Confirmar</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </div>
                  </Card>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
