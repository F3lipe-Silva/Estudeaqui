
"use client";

import React, { createContext, useContext, useReducer, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { StudyContextType, StudyData, Subject, Topic, PomodoroState, StudyLogEntry, StudySequenceItem, PomodoroSettings, SubjectTemplate } from '@/lib/types';
import { INITIAL_SUBJECTS } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { REVISION_SEQUENCE } from '@/components/revision-tab';
// import { db } from '@/lib/firebase';
// import { doc, getDoc, setDoc, deleteField } from 'firebase/firestore';
import { useAuth } from './auth-context';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280', '#EC4899', '#3B82F6'];

const initialPomodoroSettings: PomodoroSettings = {
  tasks: [
    { id: 'task-1', name: 'Questões', duration: 30 * 60 },
    { id: 'task-2', name: 'Anki', duration: 10 * 60 },
    { id: 'task-3', name: 'Lei Seca', duration: 20 * 60 },
  ],
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  cyclesUntilLongBreak: 4,
};

const initialState: StudyData = {
  subjects: INITIAL_SUBJECTS,
  studyLog: [],
  lastStudiedDate: null,
  streak: 0,
  studySequence: null,
  sequenceIndex: 0,
  pomodoroSettings: initialPomodoroSettings,
  templates: [],
};

const StudyContext = createContext<StudyContextType | undefined>(undefined);

function studyReducer(state: StudyData, action: any): StudyData {
  switch (action.type) {
    case 'SET_STATE':
      const loadedState = action.payload;
      if (!loadedState) return initialState;
      if (!loadedState.studyLog) {
        loadedState.studyLog = [];
      }
      return { ...initialState, ...loadedState };
    case 'ADD_SUBJECT': {
      const newSubject: Subject = {
        id: `subj-${Date.now()}`,
        name: action.payload.name,
        color: action.payload.color,
        description: action.payload.description,
        studyDuration: action.payload.studyDuration,
        materialUrl: action.payload.materialUrl,
        revisionProgress: 0,
        topics: [],
      };
      return { ...state, subjects: [...state.subjects, newSubject] };
    }
    case 'UPDATE_SUBJECT': {
      return {
        ...state,
        subjects: state.subjects.map(s => s.id === action.payload.id ? { ...s, ...action.payload.data } : s),
      };
    }
    case 'DELETE_SUBJECT': {
      return { 
          ...state, 
          subjects: state.subjects.filter(s => s.id !== action.payload),
        };
    }
    case 'ADD_TOPIC': {
      const { subjectId, name } = action.payload;
      const subjects = state.subjects.map(s => {
        if (s.id === subjectId) {
          const newTopic: Topic = {
            id: `topic-${subjectId}-${Date.now()}`,
            subjectId,
            name,
            order: s.topics.length,
            isCompleted: false,
          };
          return { ...s, topics: [...s.topics, newTopic] };
        }
        return s;
      });
      return { ...state, subjects };
    }
     case 'TOGGLE_TOPIC_COMPLETED': {
      const { subjectId, topicId } = action.payload;
      return {
        ...state,
        subjects: state.subjects.map(s => {
          if (s.id === subjectId) {
            return {
              ...s,
              topics: s.topics.map(t =>
                t.id === topicId
                  ? { ...t, isCompleted: !t.isCompleted }
                  : t
              ),
            };
          }
          return s;
        }),
      };
    }
    case 'DELETE_TOPIC': {
      const { subjectId, topicId } = action.payload;
      const subjects = state.subjects.map(s => {
        if (s.id === subjectId) {
          const newTopics = s.topics
            .filter(t => t.id !== topicId)
            .map((t, index) => ({ ...t, order: index }));
          return { ...s, topics: newTopics };
        }
        return s;
      });
      return { ...state, subjects };
    }
     case 'SET_REVISION_PROGRESS': {
      const { subjectId, progress } = action.payload;
      return {
        ...state,
        subjects: state.subjects.map(s => {
          if (s.id === subjectId) {
            const completedTopics = s.topics.filter(t => t.isCompleted);
            const relevantSequence = REVISION_SEQUENCE
                .map(topicOrder => completedTopics.find(t => t.order === topicOrder))
                .filter((topic): topic is NonNullable<typeof topic> => topic !== undefined);

            const newProgress = Math.max(0, Math.min(progress, relevantSequence.length));
            return { ...s, revisionProgress: newProgress };
          }
          return s;
        }),
      };
    }
    case 'ADD_STUDY_LOG': {
      const logData = action.payload;
      let { streak, lastStudiedDate, subjects } = state;
      let { studySequence, sequenceIndex } = state;
      const today = new Date();

      const newLog: StudyLogEntry = {
        ...logData,
        id: `log-${Date.now()}`,
        date: today.toISOString(),
      };
      
      const lastDate = state.lastStudiedDate ? parseISO(state.lastStudiedDate) : null;
      if (!lastDate || !isSameDay(lastDate, today)) {
          const yesterday = subDays(today, 1);
          if (lastDate && isSameDay(lastDate, yesterday)) {
              streak = state.streak + 1;
          } else {
              streak = 1;
          }
          lastStudiedDate = today.toISOString();
      }

      // Update study sequence progress
      if (studySequence && newLog.sequenceItemIndex !== undefined && newLog.sequenceItemIndex !== null) {
          let itemToUpdate = studySequence.sequence[newLog.sequenceItemIndex];

          if(itemToUpdate && itemToUpdate.subjectId === newLog.subjectId) {
            const newTotalTime = (itemToUpdate.totalTimeStudied || 0) + newLog.duration;
            const newSequence = [...studySequence.sequence];
            newSequence[newLog.sequenceItemIndex] = { ...itemToUpdate, totalTimeStudied: newTotalTime };
            studySequence = { ...studySequence, sequence: newSequence };
            
            itemToUpdate = newSequence[newLog.sequenceItemIndex];

            // Check if current item is now complete and should advance
            if (newLog.sequenceItemIndex === sequenceIndex) {
              const subject = state.subjects.find(s => s.id === itemToUpdate.subjectId);
              const timeGoal = subject?.studyDuration || 0;
  
              if (timeGoal > 0 && newTotalTime >= timeGoal) {
                  sequenceIndex = (sequenceIndex + 1); // Allow it to go one past the end to show completion
              }
            }
          }
      }
      
      return { 
        ...state, 
        subjects,
        studyLog: [newLog, ...state.studyLog].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()), 
        streak, 
        lastStudiedDate,
        studySequence, 
        sequenceIndex 
      };
    }
    case 'UPDATE_STUDY_LOG': {
      const updatedLog = action.payload;
      const originalLog = state.studyLog.find(log => log.id === updatedLog.id);
      if (!originalLog) return state;

      const durationDifference = updatedLog.duration - originalLog.duration;
      let { studySequence } = state;

      if (studySequence && updatedLog.sequenceItemIndex !== undefined && updatedLog.sequenceItemIndex !== null && durationDifference !== 0) {
        const itemToUpdate = studySequence.sequence[updatedLog.sequenceItemIndex];
        if (itemToUpdate && itemToUpdate.subjectId === updatedLog.subjectId) {
          const newSequence = [...studySequence.sequence];
          newSequence[updatedLog.sequenceItemIndex] = {
            ...itemToUpdate,
            totalTimeStudied: Math.max(0, (itemToUpdate.totalTimeStudied || 0) + durationDifference)
          };
          studySequence = { ...studySequence, sequence: newSequence };
        }
      }

      return {
        ...state,
        studyLog: state.studyLog.map(log => log.id === updatedLog.id ? updatedLog : log),
        studySequence,
      };
    }
    case 'DELETE_STUDY_LOG': {
      const logIdToDelete = action.payload;
      const logToDelete = state.studyLog.find(log => log.id === logIdToDelete);
      if (!logToDelete) return state;

      let { studySequence } = state;
      if (studySequence && logToDelete.sequenceItemIndex !== undefined && logToDelete.sequenceItemIndex !== null) {
          const itemToUpdate = studySequence.sequence[logToDelete.sequenceItemIndex];
          if (itemToUpdate && itemToUpdate.subjectId === logToDelete.subjectId) {
             const newSequence = [...studySequence.sequence];
             newSequence[logToDelete.sequenceItemIndex] = {
              ...itemToUpdate,
              totalTimeStudied: Math.max(0, (itemToUpdate.totalTimeStudied || 0) - logToDelete.duration)
             };
             studySequence = { ...studySequence, sequence: newSequence };
          }
      }

      return {
        ...state,
        studyLog: state.studyLog.filter(log => log.id !== logIdToDelete),
        studySequence,
      };
    }
    case 'SAVE_STUDY_SEQUENCE': {
       const newSequence = action.payload;
       if (newSequence) {
        const isNew = !state.studySequence || state.studySequence.id !== newSequence.id;
        if(isNew) {
            newSequence.sequence = newSequence.sequence.map((item: StudySequenceItem) => ({ ...item, totalTimeStudied: 0 }));
        }
       }

       // Tentar preservar o sequenceIndex se o item atual ainda existir na mesma posição
       let newSequenceIndex = 0;
       if (!isNew && state.studySequence && state.sequenceIndex < newSequence.sequence.length) {
         const currentItem = state.studySequence.sequence[state.sequenceIndex];
         const newItemAtSameIndex = newSequence.sequence[state.sequenceIndex];
         if (currentItem && newItemAtSameIndex && currentItem.subjectId === newItemAtSameIndex.subjectId) {
           newSequenceIndex = state.sequenceIndex;
         }
       }

      return { ...state, studySequence: newSequence, sequenceIndex: newSequenceIndex };
    }
    case 'RESET_STUDY_SEQUENCE': {
      if (!state.studySequence) return state;
      const resetSequence = state.studySequence.sequence.map(item => ({
        ...item,
        totalTimeStudied: 0,
      }));
      return {
        ...state,
        studySequence: { ...state.studySequence, sequence: resetSequence },
        sequenceIndex: 0,
      };
    }
     case 'ADVANCE_SEQUENCE': {
      if (!state.studySequence) return state;
      const nextIndex = state.sequenceIndex + 1;
      return { ...state, sequenceIndex: nextIndex };
    }
    case 'UPDATE_POMODORO_SETTINGS': {
      return {
        ...state,
        pomodoroSettings: action.payload as PomodoroSettings
      };
    }
    case 'SAVE_TEMPLATE': {
      const { name } = action.payload;
      const templateSubjects: Omit<Subject, 'id'>[] = state.subjects.map(s => ({
        name: s.name,
        color: s.color,
        description: s.description,
        studyDuration: s.studyDuration,
        materialUrl: s.materialUrl,
        revisionProgress: 0, // Reset progress
        topics: s.topics.map((t: Topic) => ({
          name: t.name,
          order: t.order,
          isCompleted: false, // Reset completion
        })),
      }));
      const newTemplate: SubjectTemplate = {
        id: `template-${Date.now()}`,
        name,
        subjects: templateSubjects,
      };
      return {
        ...state,
        templates: [...state.templates, newTemplate],
      };
    }
    case 'LOAD_TEMPLATE': {
      const templateId = action.payload;
      const template = state.templates.find(t => t.id === templateId);
      if (!template) return state;
      const newSubjects: Subject[] = template.subjects.map(s => ({
        id: `subj-${Date.now()}-${Math.random()}`,
        ...s,
        topics: s.topics.map((t: any) => ({
          ...t,
          id: `topic-${Date.now()}-${Math.random()}`,
          subjectId: '', // Will be set below
        })),
      }));
      // Set subjectIds in topics
      newSubjects.forEach(s => {
        s.topics.forEach((t: Topic) => t.subjectId = s.id);
      });
      return {
        ...state,
        subjects: newSubjects,
      };
    }
    case 'DELETE_TEMPLATE': {
      const templateId = action.payload;
      return {
        ...state,
        templates: state.templates.filter(t => t.id !== templateId),
      };
    }
    default:
      return state;
  }
}

function cleanUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(v => cleanUndefined(v));
  }
  if (typeof obj === 'object') {
    const newObj: {[key: string]: any} = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        newObj[key] = cleanUndefined(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}


export function StudyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(studyReducer, initialState);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const isSaving = useRef(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const { pomodoroSettings } = state;

  const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
    status: 'idle',
    timeRemaining: pomodoroSettings?.tasks?.[0]?.duration || 0,
    currentCycle: 0,
    pomodorosCompletedToday: 0,
    key: 0,
    currentTaskIndex: 0,
  });

  // Effect to sync pomodoro state when settings change from context
  useEffect(() => {
    setPomodoroState(prev => ({
        ...prev,
        status: 'idle',
        timeRemaining: pomodoroSettings?.tasks?.[0]?.duration || 0,
        currentTaskIndex: 0,
        key: prev.key + 1,
    }));
  }, [pomodoroSettings]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      dispatch({ type: 'SET_STATE', payload: initialState });
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      // const userDocRef = doc(db, "userData", user.uid);
      try {
        // const docSnap = await getDoc(userDocRef);
        // if (docSnap.exists()) {
        //   const data = docSnap.data() as StudyData;
          dispatch({ type: 'SET_STATE', payload: initialState });
        // } else {
        //   // If document doesn't exist (new user), create it and set initial state
        //   const stateToSave = { ...initialState };
        //   // await setDoc(userDocRef, stateToSave);
        //   dispatch({ type: 'SET_STATE', payload: stateToSave });
        // }
      } catch (error: any) {
        console.error("Failed to load or create data in Firestore:", error);
        let description = "Verifique sua conexão e se o Firestore está ativado no console do Firebase. Usando dados locais por enquanto.";
        if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
          description = "Permissão negada. Verifique suas Regras de Segurança do Firestore no console do Firebase para permitir leitura e escrita para usuários autenticados.";
        }
        toast({ title: "Erro ao conectar com a nuvem", description, variant: "destructive", duration: 10000 });
        dispatch({ type: 'SET_STATE', payload: initialState });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, toast]);

  useEffect(() => {
    if (isLoading || isSaving.current || !user) return;

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(async () => {
      isSaving.current = true;
      try {
        // const userDocRef = doc(db, "userData", user.uid);
        const stateToSave = cleanUndefined(state);

        // await setDoc(userDocRef, stateToSave, { merge: true });
      } catch (error) {
        console.error("Failed to save data to Firestore:", error);
        toast({ title: "Erro ao salvar na nuvem", description: "Suas alterações podem não ter sido salvas. Verifique a conexão.", variant: "destructive" });
      } finally {
        isSaving.current = false;
      }
    }, 1500);

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [state, isLoading, toast, user]);

  const getAssociatedTopic = useCallback(() => {
    if (!pomodoroState.associatedItemId) return null;
    const topic = state.subjects
      .flatMap((s: any) => s.topics)
      .find((t: any) => t.id === pomodoroState.associatedItemId);
    return topic || null;
  }, [pomodoroState.associatedItemId, state.subjects]);
  
  const handlePomodoroStateTransition = useCallback((prevState: PomodoroState) => {
    if (!pomodoroSettings) return;

    const transition = () => {
      // FOCUS BLOCK LOGIC
      if (prevState.status === 'focus') {
        const currentTaskIndex = prevState.currentTaskIndex ?? 0;
        const nextTaskIndex = currentTaskIndex + 1;

        if (nextTaskIndex < (pomodoroSettings.tasks?.length || 0)) {
          // Move to the next sub-task
          const nextTask = pomodoroSettings.tasks[nextTaskIndex];
          toast({ title: `Próxima tarefa: ${nextTask.name}` });
          setPomodoroState(prev => ({
            ...prev,
            currentTaskIndex: nextTaskIndex,
            timeRemaining: nextTask.duration,
            key: prev.key + 1,
          }));
        } else {
          // Focus block finished, log time and start a break
          const topic = getAssociatedTopic();
          if (topic) {
            const totalFocusDuration = pomodoroSettings.tasks.reduce((sum: number, task: any) => sum + task.duration, 0);
            const sequenceItemIndex = state.studySequence ? state.studySequence.sequence.findIndex((item: any, index: number) => item.subjectId === topic.subjectId && index === state.sequenceIndex) : -1;
            dispatch({
              type: 'ADD_STUDY_LOG',
              payload: {
                duration: Math.floor(totalFocusDuration / 60),
                subjectId: topic.subjectId,
                topicId: topic.id,
                startPage: 0, endPage: 0, questionsTotal: 0, questionsCorrect: 0,
                source: 'pomodoro',
                sequenceItemIndex: sequenceItemIndex !== -1 ? sequenceItemIndex : undefined,
              }
            });
          }

          const newCycle = prevState.currentCycle + 1;
          const isLongBreak = newCycle > 0 && newCycle % pomodoroSettings.cyclesUntilLongBreak === 0;

          if (isLongBreak) {
            toast({ title: "Pausa longa!", description: "Você merece um bom descanso." });
            setPomodoroState(prev => ({
              ...prev,
              status: 'long_break',
              timeRemaining: pomodoroSettings.longBreakDuration,
              currentCycle: newCycle,
              pomodorosCompletedToday: prev.pomodorosCompletedToday + 1,
              key: prev.key + 1,
            }));
          } else {
            toast({ title: "Pausa curta!", description: "Respire fundo por alguns minutos." });
            setPomodoroState(prev => ({
              ...prev,
              status: 'short_break',
              timeRemaining: pomodoroSettings.shortBreakDuration,
              currentCycle: newCycle,
              pomodorosCompletedToday: prev.pomodorosCompletedToday + 1,
              key: prev.key + 1,
            }));
          }
        }
      } else if (prevState.status === 'short_break' || prevState.status === 'long_break') {
        // BREAK BLOCK LOGIC
        toast({ title: "De volta ao foco!", description: "Vamos para o próximo round." });
        const firstTask = pomodoroSettings.tasks?.[0];
        setPomodoroState(prev => ({
          ...prev,
          status: 'focus',
          timeRemaining: firstTask?.duration || 0,
          currentTaskIndex: 0,
          key: prev.key + 1,
        }));
      } else {
        // Fallback to idle
        setPomodoroState(prev => ({ ...prev, status: 'idle' }));
      }
    };
    
    transition();

  }, [pomodoroSettings, getAssociatedTopic, toast, state.studySequence, state.sequenceIndex]);

  // Pomodoro Timer Logic
  useEffect(() => {
    if (pomodoroState.status === 'paused' || pomodoroState.status === 'idle') {
      return;
    }

    const timer = setInterval(() => {
      setPomodoroState(prev => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timer); // Stop this interval immediately
          handlePomodoroStateTransition(prev);
          return prev; // Return previous state to avoid rendering with 0
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pomodoroState.status, pomodoroState.key, handlePomodoroStateTransition]);


  const startPomodoroForItem = useCallback((itemId: string, itemType: 'topic' | 'revision') => {
    const topic = state.subjects.flatMap(s => s.topics).find(t => t.id === itemId);
    if (topic) {
        const subject = state.subjects.find(s => s.id === topic.subjectId);
        const firstTask = pomodoroSettings?.tasks?.[0];
        if (subject && firstTask) {
            setPomodoroState(prev => ({
                ...prev,
                status: 'focus',
                timeRemaining: firstTask.duration,
                associatedItemId: itemId,
                associatedItemType: itemType,
                key: prev.key + 1,
                currentTaskIndex: 0,
                currentCycle: 0,
            }));
            setActiveTab('pomodoro');
            toast({
                title: "Foco no estudo iniciado!",
                description: `Matéria: ${subject.name}`,
            });
        } else {
            toast({ title: "Erro", description: "Configure pelo menos uma tarefa de foco nas configurações do Pomodoro.", variant: "destructive"});
        }
    }
  }, [state.subjects, pomodoroSettings, setActiveTab, toast]);
  
  const value = useMemo(() => ({
    data: state,
    dispatch,
    pomodoroState,
    setPomodoroState,
    activeTab,
    setActiveTab,
    startPomodoroForItem,
  }), [state, pomodoroState, activeTab, startPomodoroForItem]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="text-center">
            <p className="text-lg font-semibold">Carregando seus dados...</p>
            <p className="text-muted-foreground">Sincronizando com a nuvem.</p>
        </div>
      </div>
    );
  }

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
}
