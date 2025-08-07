
"use client";

import { useStudy } from '@/contexts/study-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, PlayCircle, CheckCircle2, Clock, FolderKanban, Circle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';


const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280'];

function SubjectForm({ subject, onSave, onCancel }: { subject?: any; onSave: (data: any) => void; onCancel: () => void; }) {
  const [name, setName] = useState(subject?.name || '');
  const [color, setColor] = useState(subject?.color || COLORS[0]);
  const [description, setDescription] = useState(subject?.description || '');
  const [studyDuration, setStudyDuration] = useState(subject?.studyDuration || 60);
  const [materialUrl, setMaterialUrl] = useState(subject?.materialUrl || '');

  const handleSubmit = () => {
    onSave({ name, color, description, studyDuration, materialUrl });
    onCancel();
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-left sm:text-right">Nome</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-1 sm:col-span-3" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
        <Label htmlFor="description" className="text-left sm:text-right pt-2">Descrição</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-1 sm:col-span-3" placeholder="Descrição breve da matéria..."/>
      </div>
       <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
        <Label htmlFor="studyDuration" className="text-left sm:text-right">Tempo (min)</Label>
        <Input id="studyDuration" type="number" value={studyDuration} onChange={(e) => setStudyDuration(Number(e.target.value))} className="col-span-1 sm:col-span-3" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
        <Label htmlFor="materialUrl" className="text-left sm:text-right">URL do Material</Label>
        <Input id="materialUrl" value={materialUrl} onChange={(e) => setMaterialUrl(e.target.value)} className="col-span-1 sm:col-span-3" placeholder="https://..."/>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
        <Label htmlFor="color" className="text-left sm:text-right">Cor</Label>
        <div className="col-span-1 sm:col-span-3 flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-primary' : 'border-transparent'}`} style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSubmit}>Salvar</Button>
      </DialogFooter>
    </div>
  );
}

export default function StudyCycleTab() {
  const { data, dispatch, startPomodoroForItem } = useStudy();
  const [newTopicName, setNewTopicName] = useState('');
  const [addingTopicTo, setAddingTopicTo] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState(null);

  const handleAddSubject = (data: any) => {
    dispatch({ type: 'ADD_SUBJECT', payload: data });
  };

  const handleUpdateSubject = (data: any) => {
    if(editingSubject) {
      // @ts-ignore
      dispatch({ type: 'UPDATE_SUBJECT', payload: { id: editingSubject.id, data } });
    }
  };

  const handleDeleteSubject = (id: string) => {
    dispatch({ type: 'DELETE_SUBJECT', payload: id });
  };

  const handleAddTopic = (subjectId: string) => {
    if (newTopicName.trim()) {
      dispatch({ type: 'ADD_TOPIC', payload: { subjectId, name: newTopicName } });
      setNewTopicName('');
      setAddingTopicTo(null);
    }
  };
  
  const handleToggleTopic = (subjectId: string, topicId: string) => {
    dispatch({ type: 'TOGGLE_TOPIC_COMPLETED', payload: { subjectId, topicId } });
  };

  const handleDeleteTopic = (subjectId: string, topicId: string) => {
    dispatch({ type: 'DELETE_TOPIC', payload: { subjectId, topicId } });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Ciclo de Estudos</CardTitle>
            <CardDescription>Gerencie suas matérias e assuntos.</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Nova Matéria</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Adicionar Nova Matéria</DialogTitle></DialogHeader>
              <SubjectForm onSave={handleAddSubject} onCancel={() => {}} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {data.subjects.map(subject => (
              <AccordionItem key={subject.id} value={subject.id}>
                <AccordionTrigger>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-2 h-6 rounded-full" style={{ backgroundColor: subject.color }}></div>
                    <span className="font-semibold text-lg text-left">{subject.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">({subject.topics.length} assuntos)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-5">
                  {subject.description && <p className="text-sm text-muted-foreground mb-4">{subject.description}</p>}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                    <div className="flex gap-2">
                        {subject.materialUrl && (
                           <a href={subject.materialUrl} target="_blank" rel="noopener noreferrer">
                             <Button variant="outline" size="sm"><FolderKanban className="mr-2 h-3 w-3" /> Abrir Material</Button>
                           </a>
                        )}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setEditingSubject(subject as any)}><Edit className="mr-2 h-3 w-3" /> Editar</Button>
                            </DialogTrigger>
                            {editingSubject && (
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Editar Matéria</DialogTitle></DialogHeader>
                                    <SubjectForm subject={editingSubject} onSave={handleUpdateSubject} onCancel={() => setEditingSubject(null)}/>
                                </DialogContent>
                            )}
                        </Dialog>
                        <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-3 w-3" /> Remover</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Remover matéria?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Isso removerá "{subject.name}" e todos os seus {subject.topics.length} assuntos. Essa ação não pode ser desfeita.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSubject(subject.id)}>Confirmar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    {subject.studyDuration && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
                            <Clock className="h-4 w-4" />
                            <span>{subject.studyDuration} min / sessão</span>
                        </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {subject.topics.map(topic => (
                      <div key={topic.id} className="flex flex-col">
                        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn("h-8 w-8", topic.isCompleted ? 'text-green-500 hover:text-green-600' : 'text-muted-foreground hover:text-foreground')}
                            onClick={() => handleToggleTopic(subject.id, topic.id)}
                          >
                            {topic.isCompleted ? <CheckCircle2 className="h-5 w-5"/> : <Circle className="h-5 w-5"/>}
                          </Button>
                          <div className="flex-grow flex items-center gap-3">
                              <span className="font-mono text-sm text-muted-foreground">{topic.order.toString().padStart(2, '0')}</span>
                              <span className="text-sm">{topic.name}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startPomodoroForItem(topic.id, 'topic')}>
                            <PlayCircle className="h-5 w-5 text-primary" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover assunto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover "{topic.name}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTopic(subject.id, topic.id)}>Remover</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                    {addingTopicTo === subject.id ? (
                       <div className="flex flex-col sm:flex-row gap-2 p-2">
                         <Input
                           placeholder="Nome do novo assunto"
                           value={newTopicName}
                           onChange={(e) => setNewTopicName(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleAddTopic(subject.id)}
                           autoFocus
                         />
                         <div className='flex gap-2 justify-end'>
                            <Button onClick={() => handleAddTopic(subject.id)}>Salvar</Button>
                            <Button variant="ghost" onClick={() => setAddingTopicTo(null)}>Cancelar</Button>
                         </div>
                       </div>
                    ) : (
                      <Button variant="ghost" className="w-full justify-start mt-2" onClick={() => setAddingTopicTo(subject.id)}>
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Assunto
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
