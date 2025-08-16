
"use client";

import { useStudy } from '@/contexts/study-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Check, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// This sequence can be used for more advanced logic later, but for now we simplify.
export const REVISION_SEQUENCE = [0,1,0,2,1,3,2,4,3,0,5,4,1,6,5,2,7,6,3,8,7,4,0,9,8,5,1,10,9,6,2,11,10,7,3,12,11,8,4,13,12,9,5,14,13,10,6,15,14,11,7,16,15,12,8,17,16,13,9,18,17,15,11,19,18,15,11,20,19,16,12,21,20,17,13,21,20,17,13,22,21,18,14,22,21,18,14,23,22,19,15];

export default function RevisionTab() {
  const { data, dispatch, startPomodoroForItem } = useStudy();
  const { subjects } = data;

  const handleToggleStep = (subjectId: string, newProgress: number) => {
    dispatch({ type: 'SET_REVISION_PROGRESS', payload: { subjectId, progress: newProgress } });
  };
  
  const RevisionBox = ({ 
      topicNumber, 
      topicName,
      isCurrent,
      isCompleted,
      onToggle,
      onStartTimer,
      topicId
  }: { 
      topicNumber: string; 
      topicName: string;
      isCurrent: boolean;
      isCompleted: boolean;
      onToggle: () => void;
      onStartTimer: () => void;
      topicId: string;
  }) => {
    
    const canClick = isCurrent || isCompleted;
    
    const boxContent = () => {
       if (isCurrent) {
         return (
            <div className="w-full flex flex-col gap-1">
              <Button size="sm" className="w-full h-7 text-xs" onClick={onToggle}>
                <Check className="mr-1 h-3 w-3"/> Concluir
              </Button>
               <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={() => startPomodoroForItem(topicId, 'revision')}>
                <PlayCircle className="mr-1 h-3 w-3" /> Focar
              </Button>
            </div>
        )
      }
      if (isCompleted) {
        return (
          <div className="flex items-center justify-center text-primary-foreground w-full h-full" onClick={canClick ? onToggle : undefined}>
            <Check className="h-6 w-6" />
          </div>
        )
      }
      return (
        <div className="text-xs text-muted-foreground text-center w-full">Aguardando</div>
      )
    }

    return (
      <div className={cn(
          "flex flex-col items-center justify-between p-2 border rounded-lg bg-card shadow-sm h-24 flex-auto w-full max-w-[calc(50%-0.5rem)] sm:max-w-[calc(33.33%-0.5rem)] md:max-w-[calc(25%-0.5rem)] lg:max-w-[calc(20%-0.5rem)] transition-all duration-300",
          isCompleted && "bg-green-600/90 border-green-700/50 text-primary-foreground",
          isCompleted && canClick && "cursor-pointer hover:border-primary",
          isCurrent && "border-primary border-2 shadow-lg",
          !isCurrent && !isCompleted && "opacity-60"
      )}>
          <div className="flex-shrink-0 text-center w-full">
            <span className="text-xl font-bold">{topicNumber}</span>
            <p className={cn("text-xs text-center mt-1 leading-tight break-words", isCompleted ? "text-primary-foreground/80" : "text-muted-foreground")}>{topicName}</p>
          </div>
          <div className="flex-grow flex items-end w-full mt-1">
             {boxContent()}
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] sm:min-h-[calc(100vh-4rem)] p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-6 w-6 text-primary" /> Sistema de Revisão por Ciclos</CardTitle>
          <CardDescription>
            Conclua cada revisão em sequência para avançar. Apenas os assuntos que você já estudou aparecerão aqui.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Accordion type="multiple" defaultValue={subjects.map(s=>s.id)} className="w-full space-y-4">
            {subjects.map(subject => {
              const completedTopics = subject.topics.filter(t => t.isCompleted);

              if (completedTopics.length === 0) {
                return null;
              }
              
              const revisionSequence = REVISION_SEQUENCE
                .map(topicOrder => completedTopics.find(t => t.order === topicOrder))
                .filter((topic): topic is NonNullable<typeof topic> => topic !== undefined);

              
              return (
                <AccordionItem key={subject.id} value={subject.id} className="border-none">
                   <Card className="bg-card-foreground/5 overflow-hidden">
                    <AccordionTrigger className="p-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-6 rounded-full" style={{ backgroundColor: subject.color }}></div>
                        <span className="font-semibold text-lg">{subject.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                      <div className="flex flex-wrap py-4 gap-4">
                        {revisionSequence.map((topic, index) => {
                          const topicDisplayNumber = `${topic.order}`;
                          
                          const isCompleted = index < subject.revisionProgress;
                          const isCurrent = index === subject.revisionProgress;

                          const handleToggle = () => {
                              if (isCurrent) {
                                  handleToggleStep(subject.id, subject.revisionProgress + 1);
                              } else if (isCompleted && index === subject.revisionProgress - 1) {
                                  // Allow un-doing the last step
                                  handleToggleStep(subject.id, subject.revisionProgress - 1);
                              }
                          }

                          return (
                            <RevisionBox 
                              key={`${topic.id}-${index}`}
                              topicId={topic.id}
                              topicNumber={topicDisplayNumber}
                              topicName={topic.name}
                              isCompleted={isCompleted}
                              isCurrent={isCurrent}
                              onToggle={handleToggle}
                              onStartTimer={() => startPomodoroForItem(topic.id, 'revision')}
                           />
                          );
                        })}
                         {subject.revisionProgress >= revisionSequence.length && revisionSequence.length > 0 && (
                            <div className="p-4 text-center text-green-600 font-semibold bg-green-100 rounded-lg w-full">
                                Parabéns! Você concluiu todas as revisões para esta matéria!
                            </div>
                        )}
                        {revisionSequence.length === 0 && (
                            <div className="p-4 text-center text-muted-foreground bg-muted rounded-lg w-full">
                                Nenhum tópico concluído nesta matéria para iniciar o ciclo de revisões.
                            </div>
                        )}
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
