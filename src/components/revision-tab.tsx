
"use client";

import { useStudy } from '@/contexts/study-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Check } from 'lucide-react';
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
      topicId
  }: { 
      topicNumber: string; 
      topicName: string;
      isCurrent: boolean;
      isCompleted: boolean;
      onToggle: () => void;
      topicId: string;
  }) => {
    
    const canClick = isCurrent || isCompleted;
    
    const boxContent = () => {
       if (isCurrent) {
         return (
            <div className="w-full flex justify-center">
              <Button size="sm" className="w-full h-6 text-[10px] px-2" onClick={onToggle}>
                <Check className="mr-1 h-2.5 w-2.5"/> Concluir
              </Button>
            </div>
        )
      }
      if (isCompleted) {
        return (
          <div className="flex items-center justify-center w-full h-full py-0.5" onClick={canClick ? onToggle : undefined}>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium text-[10px] bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
              <Check className="h-2.5 w-2.5" /> Concluído
            </div>
          </div>
        )
      }
      return (
        <div className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground/60 text-center w-full py-1">
          Aguardando
        </div>
      )
    }

    return (
      <div className={cn(
          "flex flex-col items-center justify-between p-2 border rounded-lg bg-card shadow-sm h-24 w-full sm:w-[calc(50%-0.25rem)] md:w-[calc(33.33%-0.33rem)] lg:w-[calc(25%-0.25rem)] xl:w-[calc(20%-0.2rem)] transition-all duration-300 hover:shadow-md",
          isCompleted && "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/50",
          isCompleted && canClick && "cursor-pointer hover:border-green-400",
          isCurrent && "border-primary border-2 shadow-lg ring-2 ring-primary/10 scale-105 z-10",
          !isCurrent && !isCompleted && "opacity-50 grayscale bg-muted/50"
      )}>
          <div className="flex-shrink-0 text-center w-full flex flex-col items-center gap-0.5">
            <div className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors",
              isCompleted ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100" : 
              isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {topicNumber}
            </div>
            <p className={cn(
              "text-[10px] text-center font-medium line-clamp-2 h-6 flex items-center justify-center leading-tight", 
              isCompleted ? "text-green-800 dark:text-green-200" : "text-foreground"
            )}>
              {topicName}
            </p>
          </div>
          <div className="flex-grow flex items-end w-full mt-1">
             {boxContent()}
          </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Card className="border-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg"><History className="h-5 w-5 text-primary" /> Sistema de Revisão por Ciclos</CardTitle>
          <CardDescription className="text-sm">
            Conclua cada revisão em sequência para avançar. Apenas os assuntos que você já estudou aparecerão aqui.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-1">
           <Accordion type="multiple" className="w-full space-y-1">
            {subjects.map(subject => {
              const completedTopics = subject.topics.filter(t => t.isCompleted);

              if (completedTopics.length === 0) {
                return null;
              }
              
              const revisionSequence = REVISION_SEQUENCE
                .map(topicOrder => completedTopics.find(t => t.order === topicOrder))
                .filter((topic): topic is NonNullable<typeof topic> => topic !== undefined);

              
              return (
                <AccordionItem key={subject.id} value={subject.id} className="border rounded-lg overflow-hidden bg-card">
                   <div className="bg-card">
                    <AccordionTrigger className="p-3 hover:no-underline hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full ring-1 ring-offset-1 ring-offset-card" style={{ backgroundColor: subject.color, '--tw-ring-color': subject.color } as React.CSSProperties}></div>
                        <span className="font-semibold text-base">{subject.name}</span>
                        <span className="text-[10px] font-normal text-muted-foreground ml-2 bg-muted px-1.5 py-0.5 rounded-full">
                          {subject.revisionProgress} / {revisionSequence.length}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-3 pt-0 bg-muted/10">
                      <div className="flex flex-wrap py-1 gap-1">
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
                  </div>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
