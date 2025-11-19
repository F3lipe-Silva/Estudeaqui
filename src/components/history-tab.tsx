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
      <Card className="border-2">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-primary/5 to-transparent">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileClock className="h-6 w-6 text-primary" />
              Histórico de Estudos
            </CardTitle>
            <CardDescription className="mt-1">
              Visualize, adicione e edite seus registros de estudo manuais.
            </CardDescription>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew} className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow">
                <PlusCircle className="mr-2 h-4 w-4" /> Registrar Estudo
              </Button>
            </DialogTrigger>
            <DialogContent onInteractOutside={handleCloseDialog} className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingLog ? "Editar Registro de Estudo" : "Registrar Nova Sessão de Estudo"}</DialogTitle>
              </DialogHeader>
              <StudyLogForm onSave={handleCloseDialog} onCancel={handleCloseDialog} existingLog={editingLog || undefined} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {data.studyLog.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="mx-auto bg-muted/50 p-4 rounded-full w-fit mb-4">
                  <FileClock className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum registro encontrado</h3>
                <p className="text-muted-foreground mb-4">Comece registrando suas sessões de estudo para acompanhar seu progresso.</p>
              </div>
            ) : (
              data.studyLog.map(log => {
                const pagesRead = log.endPage > 0 ? log.endPage - log.startPage + 1 : 0;
                const accuracy = log.questionsTotal > 0 ? (log.questionsCorrect / log.questionsTotal) * 100 : 0;
                return (
                  <Card key={log.id} className="relative group hover:shadow-lg transition-all duration-300 border-2">
                    <CardHeader className="p-4 pb-3">
                       <CardTitle className="text-base flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                         <span className="font-bold text-lg">{getSubjectName(log.subjectId)}</span>
                         <span className="text-xs font-normal text-muted-foreground flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                           <CalendarIcon className="h-3.5 w-3.5" />
                           {format(parseISO(log.date), "dd/MM/yyyy 'às' HH:mm")}
                         </span>
                       </CardTitle>
                       <CardDescription className="text-sm font-medium">{getTopicName(log.subjectId, log.topicId)}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-sm">
                       <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
                        <Repeat className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-bold text-sm">{getSourceDisplayName(log.source)}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Fonte</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
                        <FileClock className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-bold text-sm">{log.duration} min</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Duração</p>
                        </div>
                      </div>
                       <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
                        <Book className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-bold text-sm">{pagesRead > 0 ? `${pagesRead} pág.` : "N/A"}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Leitura</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
                        <Target className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-bold text-sm">{log.questionsTotal > 0 ? `${log.questionsCorrect}/${log.questionsTotal}`: "N/A"}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Questões</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
                        <Percent className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-bold text-sm">{log.questionsTotal > 0 ? `${accuracy.toFixed(0)}%` : 'N/A'}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Acertos</p>
                        </div>
                      </div>
                    </CardContent>
                     <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/95 backdrop-blur rounded-lg shadow-lg p-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => handleEdit(log)} title="Editar">
                              <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" title="Remover">
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
