
"use client";

import { useState, useEffect } from 'react';
import { useStudy } from '@/contexts/study-context';
import { Button } from '@/components/ui/button';
import {
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { StudyLogEntry } from '@/lib/types';


export default function StudyLogForm({ onSave, onCancel, existingLog, initialData }: { onSave: () => void, onCancel: () => void, existingLog?: StudyLogEntry, initialData?: { subjectId?: string, topicId?: string, sequenceItemIndex?: number } }) {
  const { data, dispatch } = useStudy();
  const [subjectId, setSubjectId] = useState(existingLog?.subjectId || initialData?.subjectId || '');
  const [topicId, setTopicId] = useState(existingLog?.topicId || initialData?.topicId || '');
  const [duration, setDuration] = useState(existingLog?.duration || '');
  const [startPage, setStartPage] = useState(existingLog?.startPage || '');
  const [endPage, setEndPage] = useState(existingLog?.endPage || '');
  const [questionsTotal, setQuestionsTotal] = useState(existingLog?.questionsTotal || '');
  const [questionsCorrect, setQuestionsCorrect] = useState(existingLog?.questionsCorrect || '');
  const [source, setSource] = useState(existingLog?.source || '');

  const { toast } = useToast();

  const availableTopics = data.subjects.find(s => s.id === subjectId)?.topics || [];

  useEffect(() => {
    // This effect handles updates for existing logs
    if (existingLog) {
        setSubjectId(existingLog.subjectId);
        setTopicId(existingLog.topicId);
        setDuration(existingLog.duration);
        setStartPage(existingLog.startPage);
        setEndPage(existingLog.endPage);
        setQuestionsTotal(existingLog.questionsTotal);
        setQuestionsCorrect(existingLog.questionsCorrect);
        setSource(existingLog.source || '');
    } else {
        // Reset form for new entries, respecting initialData
        setSubjectId(initialData?.subjectId || '');
        setTopicId(initialData?.topicId || '');
        setDuration('');
        setStartPage('');
        setEndPage('');
        setQuestionsTotal('');
        setQuestionsCorrect('');
        setSource('');
    }
  }, [existingLog, initialData]);


  const handleSubmit = () => {
    const numericDuration = Number(duration);
    if (!subjectId || !topicId || numericDuration <= 0) {
      toast({
        title: 'Erro',
        description: 'Preencha pelo menos a matéria, assunto e duração.',
        variant: 'destructive',
      });
      return;
    }
    
    const logData = {
        subjectId,
        topicId,
        duration: numericDuration,
        startPage: Number(startPage),
        endPage: Number(endPage),
        questionsTotal: Number(questionsTotal),
        questionsCorrect: Number(questionsCorrect),
        source,
        sequenceItemIndex: initialData?.sequenceItemIndex,
    };
    
    if (existingLog) {
      dispatch({
        type: 'UPDATE_STUDY_LOG',
        payload: { ...existingLog, ...logData },
      });
      toast({ title: 'Registro de estudo atualizado!' });
    } else {
        dispatch({
            type: 'ADD_STUDY_LOG',
            payload: logData,
        });
        toast({ title: 'Sessão de estudo registrada!' });
    }
    onSave(); // Close dialog
  };

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Matéria</Label>
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a matéria" />
            </SelectTrigger>
            <SelectContent>
              {data.subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Assunto</Label>
          <Select value={topicId} onValueChange={setTopicId} disabled={!subjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o assunto" />
            </SelectTrigger>
            <SelectContent>
              {availableTopics.map(topic => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duração (min)</Label>
          <Input id="duration" type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Ex: 50" />
        </div>
         <div className="space-y-2">
            <Label>Fonte / Revisão</Label>
            <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                    <SelectValue placeholder="Fonte / Revisão" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="site-questoes">Site de Questões</SelectItem>
                    <SelectItem value="A">Revisão A</SelectItem>
                    <SelectItem value="B">Revisão B</SelectItem>
                    <SelectItem value="C">Revisão C</SelectItem>
                    <SelectItem value="D">Revisão D</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div className="space-y-2">
          <Label htmlFor="startPage">Pág. Início</Label>
          <Input id="startPage" type="number" value={startPage} onChange={e => setStartPage(e.target.value)} placeholder="Ex: 10"/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="endPage">Pág. Fim</Label>
          <Input id="endPage" type="number" value={endPage} onChange={e => setEndPage(e.target.value)} placeholder="Ex: 25"/>
        </div>
      </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="questionsTotal">Questões (Total)</Label>
          <Input id="questionsTotal" type="number" value={questionsTotal} onChange={e => setQuestionsTotal(e.target.value)} placeholder="Ex: 20"/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="questionsCorrect">Questões (Acertos)</Label>
          <Input id="questionsCorrect" type="number" value={questionsCorrect} onChange={e => setQuestionsCorrect(e.target.value)} placeholder="Ex: 18"/>
        </div>
      </div>
      <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSubmit}>Salvar</Button>
      </DialogFooter>
    </div>
  );
}
