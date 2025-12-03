
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
import { Plus, Edit, Trash2, PlayCircle, CheckCircle2, Clock, FolderKanban, Circle, Save, FolderOpen } from 'lucide-react';
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
  const [editingTopic, setEditingTopic] = useState(null);
  const [editingTopicName, setEditingTopicName] = useState('');
  const [isEditingTopicOpen, setIsEditingTopicOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<{id: string, name: string} | null>(null);
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);

  const handleAddSubject = (data: any) => {
    const subjectData = { ...data, id: crypto.randomUUID() };
    dispatch({ type: 'ADD_SUBJECT', payload: subjectData });
  };

  const handleUpdateSubject = (data: any) => {
    if(editingSubject) {
      // @ts-ignore
      dispatch({ type: 'UPDATE_SUBJECT', payload: { id: editingSubject.id, data } });
    }
  };

  const handleAddTopic = (subjectId: string) => {
    if (newTopicName.trim()) {
      const topicData = { subjectId, name: newTopicName, id: crypto.randomUUID() };
      dispatch({ type: 'ADD_TOPIC', payload: topicData });
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

  const handleEditTopic = (topic: any) => {
    setEditingTopic(topic);
    setEditingTopicName(topic.name);
    setIsEditingTopicOpen(true);
  };

  const handleSaveTopic = () => {
    if (editingTopicName.trim() && editingTopic) {
      const updatedSubject = {
        ...data.subjects.find((s: any) => s.id === editingTopic.subjectId),
        topics: data.subjects
          .find((s: any) => s.id === editingTopic.subjectId)
          .topics.map((t: any) =>
            t.id === editingTopic.id ? { ...t, name: editingTopicName.trim() } : t
          )
      };

      dispatch({
        type: 'UPDATE_SUBJECT',
        payload: { id: editingTopic.subjectId, data: { topics: updatedSubject.topics } }
      });

      setIsEditingTopicOpen(false);
      setEditingTopic(null);
      setEditingTopicName('');
    }
  };

  const handleDeleteSubject = (id: string, name: string) => {
    setSubjectToDelete({ id, name });
  };

  const confirmDeleteSubject = () => {
    if (subjectToDelete) {
      dispatch({ type: 'DELETE_SUBJECT', payload: subjectToDelete.id });
      setSubjectToDelete(null);
    }
  };

  const handleSaveTemplate = () => {
    if (saveTemplateName.trim()) {
      const templateData = { id: crypto.randomUUID(), name: saveTemplateName };
      dispatch({ type: 'SAVE_TEMPLATE', payload: templateData });
      setSaveTemplateName('');
      setIsSaveDialogOpen(false);
    }
  };

  const handleLoadTemplate = (templateId: string) => {
    dispatch({ type: 'LOAD_TEMPLATE', payload: templateId });
    setIsLoadDialogOpen(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    dispatch({ type: 'DELETE_TEMPLATE', payload: templateId });
  };

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-primary/5 to-transparent">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FolderKanban className="h-6 w-6 text-primary" />
              Matéria
            </CardTitle>
            <CardDescription className="mt-1">Gerencie suas matérias e assuntos de forma organizada.</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" /> Salvar Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw]">
                <DialogHeader>
                  <DialogTitle>Salvar Template de Matérias</DialogTitle>
                  <DialogDescription>Digite o nome do concurso para salvar as matérias atuais como template.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="templateName" className="text-right">Nome</Label>
                    <Input id="templateName" value={saveTemplateName} onChange={(e) => setSaveTemplateName(e.target.value)} className="col-span-3" placeholder="Ex: Concurso XYZ" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveTemplate}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
                  <FolderOpen className="mr-2 h-4 w-4" /> Carregar Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw]">
                <DialogHeader>
                  <DialogTitle>Carregar Template de Matérias</DialogTitle>
                  <DialogDescription>Selecione um template para carregar as matérias.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {data.templates.length === 0 ? (
                    <p className="text-muted-foreground">Nenhum template salvo ainda.</p>
                  ) : (
                    <div className="space-y-2">
                      {data.templates.map(template => (
                        <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{template.name}</span>
                          <div className="flex gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm">Carregar</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Carregar template?</AlertDialogTitle>
                                  <AlertDialogDescription>Isso substituirá todas as matérias atuais pelas do template "{template.name}".</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleLoadTemplate(template.id)}>Carregar</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover template?</AlertDialogTitle>
                                  <AlertDialogDescription>Isso removerá o template "{template.name}".</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteTemplate(template.id)}>Remover</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsLoadDialogOpen(false)}>Fechar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow">
                  <Plus className="mr-2 h-4 w-4" /> Nova Matéria
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[90vw]">
                <DialogHeader><DialogTitle>Adicionar Nova Matéria</DialogTitle></DialogHeader>
                <SubjectForm onSave={handleAddSubject} onCancel={() => {}} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {data.subjects.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="mx-auto bg-muted/50 p-4 rounded-full w-fit mb-4">
                <FolderKanban className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhuma matéria cadastrada</h3>
              <p className="text-muted-foreground mb-4">Comece adicionando sua primeira matéria para organizar seus estudos.</p>
            </div>
          ) : (
          <Accordion type="multiple" className="w-full space-y-3">
            {data.subjects.map(subject => (
              <AccordionItem key={subject.id} value={subject.id} className="border rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
                <AccordionTrigger className="hover:bg-muted/50 px-4 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-3 h-3 rounded-full ring-2 ring-offset-2 ring-offset-background" style={{ backgroundColor: subject.color, '--tw-ring-color': subject.color } as React.CSSProperties}></div>
                    <span className="font-semibold text-lg text-left">{subject.name}</span>
                    <span className="text-xs font-medium text-muted-foreground ml-2 bg-muted px-2 py-0.5 rounded-full">
                      {subject.topics.filter(t => t.isCompleted).length}/{subject.topics.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 bg-muted/10">
                  {subject.description && <p className="text-sm text-muted-foreground mb-4 italic bg-muted/50 p-3 rounded-md">{subject.description}</p>}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 pb-4 border-b">
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                        {subject.materialUrl && (
                           <a href={subject.materialUrl} target="_blank" rel="noopener noreferrer">
                             <Button variant="outline" size="sm" className="w-full sm:w-auto"><FolderKanban className="mr-2 h-3 w-3" /> Abrir Material</Button>
                           </a>
                        )}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setEditingSubject(subject as any)}><Edit className="mr-2 h-3 w-3" /> Editar</Button>
                            </DialogTrigger>
                            {editingSubject && (
                                <DialogContent className="max-w-[90vw]">
                                    <DialogHeader><DialogTitle>Editar Matéria</DialogTitle></DialogHeader>
                                    <SubjectForm subject={editingSubject} onSave={handleUpdateSubject} onCancel={() => setEditingSubject(null)}/>
                                </DialogContent>
                            )}
                        </Dialog>
                        <Dialog open={subjectToDelete?.id === subject.id} onOpenChange={() => setSubjectToDelete(null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() => handleDeleteSubject(subject.id, subject.name)}
                            >
                              <Trash2 className="mr-2 h-3 w-3" /> Remover
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                              <DialogHeader>
                                  <DialogTitle>Remover matéria?</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                  <p>Isso removerá "{subject.name}" e todos os seus {subject.topics.length} assuntos. Essa ação não pode ser desfeita.</p>
                              </div>
                              <DialogFooter>
                                  <Button variant="outline" onClick={() => setSubjectToDelete(null)}>Cancelar</Button>
                                  <Button variant="destructive" onClick={confirmDeleteSubject}>Remover</Button>
                              </DialogFooter>
                          </DialogContent>
                        </Dialog>
                    </div>
                    {subject.studyDuration && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
                            <Clock className="h-4 w-4" />
                            <span>{subject.studyDuration} min / sessão</span>
                        </div>
                    )}
                  </div>
                  <div className="space-y-2 mt-4">
                    {subject.topics.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                        <p className="text-sm">Nenhum assunto cadastrado ainda.</p>
                      </div>
                    ) : (
                      subject.topics.map(topic => (
                      <div key={topic.id} className="flex flex-col">
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-card border transition-all hover:shadow-sm">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-9 w-9 rounded-full transition-all",
                              topic.isCompleted
                                ? 'text-green-600 hover:text-green-700 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            )}
                            onClick={() => handleToggleTopic(subject.id, topic.id)}
                          >
                            {topic.isCompleted ? <CheckCircle2 className="h-5 w-5"/> : <Circle className="h-5 w-5"/>}
                          </Button>
                          <div className="flex-grow flex items-center gap-3">
                              <span className="font-mono text-sm font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">{topic.order.toString().padStart(2, '0')}</span>
                              <span className={cn("text-sm font-medium", topic.isCompleted && "line-through text-muted-foreground")}>{topic.name}</span>
                          </div>
                          <Dialog open={isEditingTopicOpen} onOpenChange={setIsEditingTopicOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-primary hover:text-primary hover:bg-primary/10 rounded-full transition-all"
                                onClick={() => handleEditTopic(topic)}
                                title="Editar assunto"
                              >
                                <Edit className="h-5 w-5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[90vw]">
                              <DialogHeader>
                                <DialogTitle>Editar Assunto</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="topic-name" className="text-right">Nome</Label>
                                  <Input
                                    id="topic-name"
                                    value={editingTopicName}
                                    onChange={(e) => setEditingTopicName(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Nome do assunto..."
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditingTopicOpen(false)}>Cancelar</Button>
                                <Button onClick={handleSaveTopic}>Salvar</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Remover assunto?</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <p>Tem certeza que deseja remover "{topic.name}"?</p>
                              </div>
                              <DialogFooter>
                                <Button variant="outline">Cancelar</Button>
                                <Button variant="destructive" onClick={() => handleDeleteTopic(subject.id, topic.id)}>Remover</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))
                    )}
                    {addingTopicTo === subject.id ? (
                       <div className="flex flex-col sm:flex-row gap-2 p-3 bg-muted/50 rounded-lg">
                         <Input
                           placeholder="Nome do novo assunto"
                           value={newTopicName}
                           onChange={(e) => setNewTopicName(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleAddTopic(subject.id)}
                           autoFocus
                           className="border-2"
                         />
                         <div className='flex gap-2 justify-end'>
                            <Button onClick={() => handleAddTopic(subject.id)} className="shadow-sm">Salvar</Button>
                            <Button variant="outline" onClick={() => setAddingTopicTo(null)}>Cancelar</Button>
                         </div>
                       </div>
                    ) : (
                      <Button variant="outline" className="w-full justify-start mt-2 border-dashed hover:border-solid hover:bg-muted/50 transition-all" onClick={() => setAddingTopicTo(subject.id)}>
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Assunto
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
