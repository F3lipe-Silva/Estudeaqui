
"use client";

import React, { createContext, useContext, useReducer, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { StudyContextType, StudyData, Subject, Topic, PomodoroState, StudyLogEntry, StudySequenceItem, PomodoroSettings, StudySequence } from '@/lib/types';
import { INITIAL_SUBJECTS } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { REVISION_SEQUENCE } from '@/components/revision-tab';
import { useAuth } from './auth-context';
import { supabase } from '@/lib/supabase'; // Importar supabase
import { generateUUID } from '@/lib/utils'; // Importar generateUUID

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
  subjects: [], // Inicializa vazio, será carregado do Supabase
  studyLog: [], // Inicializa vazio, será carregado do Supabase
  lastStudiedDate: null,
  streak: 0,
  studySequence: null, // Inicializa nulo, será carregado do Supabase
  sequenceIndex: 0,
  savedStudySequences: [], // Inicializa vazio, será carregado do Supabase
  pomodoroSettings: initialPomodoroSettings, // Pode ser carregado ou usar default
};

const StudyContext = createContext<StudyContextType | undefined>(undefined);

function studyReducer(state: StudyData, action: any): StudyData {
  switch (action.type) {
    case 'SET_STATE':
      let loadedState = action.payload;
      if (!loadedState) return initialState;
      if (!loadedState.studyLog) {
        loadedState.studyLog = [];
      }
      // Garante que todos os itens da sequência carregada tenham um ID único
      if (loadedState.studySequence && loadedState.studySequence.sequence) {
        loadedState.studySequence.sequence = loadedState.studySequence.sequence.map((item: StudySequenceItem) => ({
          ...item,
          id: item.id || generateUUID()
        }));
      }
      // Garante que savedStudySequences seja um array e que todos os itens tenham ID
      if (!loadedState.savedStudySequences) {
        loadedState.savedStudySequences = [];
      } else {
        loadedState.savedStudySequences = loadedState.savedStudySequences.map((seq: StudySequence) => ({
          ...seq,
          sequence: seq.sequence.map((item: StudySequenceItem) => ({
            ...item,
            id: item.id || generateUUID()
          }))
        }));
      }
      return { ...initialState, ...loadedState };
    case 'ADD_SUBJECT': {
      const newSubject: Subject = {
        id: action.payload.id || generateUUID(), // Use provided ID or generate new
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
      const { subjectId, name, id } = action.payload;
      const subjects = state.subjects.map(s => {
        if (s.id === subjectId) {
          const newTopic: Topic = {
            id: id || generateUUID(),
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
    case 'UPDATE_TOPIC': {
     const { subjectId, topicId, data } = action.payload;
     return {
       ...state,
       subjects: state.subjects.map(s => {
         if (s.id === subjectId) {
           return {
             ...s,
             topics: s.topics.map(t =>
               t.id === topicId
                 ? { ...t, ...data }
                 : t
             ),
           };
         }
         return s;
       }),
     };
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
        id: logData.id || generateUUID(),
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
            // Quando uma nova sequência é criada, garanta que cada item tenha um ID único
            newSequence.sequence = newSequence.sequence.map((item: StudySequenceItem) => ({
              ...item,
              id: item.id || generateUUID(),
              totalTimeStudied: 0
            }));
        } else {
          // Se a sequência existente está sendo atualizada, apenas zere o totalTimeStudied se for o caso
          newSequence.sequence = newSequence.sequence.map((item: StudySequenceItem) => ({
            ...item,
            id: item.id || generateUUID() // Garante ID para itens existentes sem ID
          }));
        }
       }
      return { ...state, studySequence: newSequence, sequenceIndex: 0 };
    }
    case 'SAVE_AS_NEW_SEQUENCE': {
      const { name, sequence, id } = action.payload;
      const newSavedSequence: StudySequence = {
        id: id || generateUUID(),
        name: name,
        sequence: sequence.map((item: StudySequenceItem) => ({ ...item, id: item.id || generateUUID() })),
      };
      return {
        ...state,
        savedStudySequences: [...state.savedStudySequences, newSavedSequence],
      };
    }
    case 'LOAD_SAVED_SEQUENCE': {
      const sequenceIdToLoad = action.payload;
      const sequenceToLoad = state.savedStudySequences.find(s => s.id === sequenceIdToLoad);
      if (!sequenceToLoad) return state;
      return {
        ...state,
        studySequence: { ...sequenceToLoad, sequence: sequenceToLoad.sequence.map(item => ({ ...item, totalTimeStudied: 0 })) }, // Resetar progresso ao carregar
        sequenceIndex: 0,
      };
    }
    case 'DELETE_SAVED_SEQUENCE': {
      const sequenceIdToDelete = action.payload;
      return {
        ...state,
        savedStudySequences: state.savedStudySequences.filter(s => s.id !== sequenceIdToDelete),
      };
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
    default:
      return state;
  }
}


function camelToSnakeCase(key: string): string {
  return key.replace(/([A-Z])/g, "_$1").toLowerCase();
}

function snakeToCamelCase(key: string): string {
  return key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function toSnakeCaseKeys(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(v => toSnakeCaseKeys(v));
  }
  if (typeof obj === 'object') {
    const newObj: {[key: string]: any} = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        const newKey = camelToSnakeCase(key);
        newObj[newKey] = toSnakeCaseKeys(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

function toCamelCaseKeys(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCaseKeys(v));
  }
  if (typeof obj === 'object') {
    const newObj: {[key: string]: any} = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        const newKey = snakeToCamelCase(key);
        newObj[newKey] = toCamelCaseKeys(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}


function cleanUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(v => cleanUndefinedValues(v));
  }
  if (typeof obj === 'object') {
    const newObj: {[key: string]: any} = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        newObj[key] = cleanUndefinedValues(obj[key]);
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

  // Effect to save data to Supabase whenever state changes
  useEffect(() => {
    if (!user || isLoading) return;

    // Clear any existing timeout to prevent multiple saves in quick succession
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    // Set a new timeout to debounce saves
    saveTimeout.current = setTimeout(async () => {
      if (isSaving.current) return; // Prevent re-entry if already saving
      isSaving.current = true;

      try {
        // Save Subjects
        for (const subject of state.subjects) {
          const subjectToSave = { ...subject, topics: undefined }; // Remove a propriedade topics
          const { error } = await supabase
            .from('subjects')
            .upsert({ ...toSnakeCaseKeys(subjectToSave), user_id: user.uid })
            .eq('id', subject.id);
          if (error) throw error;
        }

        // Save Topics
        for (const subject of state.subjects) {
          for (const topic of subject.topics) {
            const { error } = await supabase
              .from('topics')
              .upsert({ ...toSnakeCaseKeys(topic), user_id: user.uid, subject_id: subject.id })
              .eq('id', topic.id);
            if (error) throw error;
          }
        }

        // Save Study Log
        for (const logEntry of state.studyLog) {
          const { error } = await supabase
            .from('study_log')
            .upsert({ ...toSnakeCaseKeys(logEntry), user_id: user.uid })
            .eq('id', logEntry.id);
          if (error) throw error;
        }

        // Save Study Sequences (active and saved)
        const allSequencesToSave = [];
        if (state.studySequence) {
          allSequencesToSave.push({ ...toSnakeCaseKeys(state.studySequence), user_id: user.uid });
        }
        for (const savedSeq of state.savedStudySequences) {
          allSequencesToSave.push({ ...toSnakeCaseKeys(savedSeq), user_id: user.uid });
        }

        for (const seq of allSequencesToSave) {
          const { error } = await supabase
            .from('study_sequences')
            .upsert(seq)
            .eq('id', seq.id);
          if (error) throw error;
        }

        // Save Pomodoro Settings
        const pomodoroSettingsToSave = {
          user_id: user.uid,
          tasks: state.pomodoroSettings.tasks, // tasks é JSONB, não converter chaves internas
          short_break_duration: state.pomodoroSettings.shortBreakDuration,
          long_break_duration: state.pomodoroSettings.longBreakDuration,
          cycles_until_long_break: state.pomodoroSettings.cyclesUntilLongBreak,
          alarm_sound: state.pomodoroSettings.alarmSound,
        };
        console.log("Objeto pomodoro_settings sendo salvo:", pomodoroSettingsToSave);
        const { error: settingsError } = await supabase
          .from('pomodoro_settings')
          .upsert(pomodoroSettingsToSave)
          .eq('user_id', user.uid); // Assuming one settings per user
        if (settingsError) throw settingsError;

        // toast({ title: "Dados salvos com sucesso!" });
      } catch (error: any) {
        console.error("Erro ao salvar dados no Supabase:", error, JSON.stringify(error));
        toast({
          title: "Erro ao salvar dados",
          description: `Não foi possível salvar seus dados no Supabase. Detalhes: ${error.message || JSON.stringify(error)}`,
          variant: "destructive",
        });
      } finally {
        isSaving.current = false;
      }
    }, 2000); // Debounce time: 2 seconds

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [state, user, isLoading, toast]); // Depende do estado e do usuário

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
    if (user) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          // Fetch subjects
          const { data: subjectsData, error: subjectsError } = await supabase
            .from('subjects')
            .select('*')
            .eq('user_id', user.uid);
          if (subjectsError) throw subjectsError;

          // Fetch topics
          const { data: topicsData, error: topicsError } = await supabase
            .from('topics')
            .select('*')
            .eq('user_id', user.uid);
          if (topicsError) throw topicsError;

          // Fetch study_log
          const { data: studyLogData, error: studyLogError } = await supabase
            .from('study_log')
            .select('*')
            .eq('user_id', user.uid);
          if (studyLogError) throw studyLogError;

          // Fetch study_sequences
          const { data: studySequencesData, error: studySequencesError } = await supabase
            .from('study_sequences')
            .select('*')
            .eq('user_id', user.uid);
          if (studySequencesError) throw studySequencesError;

          // Fetch pomodoro_settings
          const { data: pomodoroSettingsData, error: pomodoroSettingsError } = await supabase
            .from('pomodoro_settings')
            .select('*')
            .eq('user_id', user.uid)
            .single(); // Assuming one settings per user
          if (pomodoroSettingsError && pomodoroSettingsError.code !== 'PGRST116') throw pomodoroSettingsError; // PGRST116 means no rows found
          console.log("Objeto pomodoro_settings carregado:", pomodoroSettingsData);

          const subjectsWithTopics = toCamelCaseKeys(subjectsData || []).map((subject: Subject) => ({
            ...subject,
            topics: toCamelCaseKeys(topicsData || []).filter((topic: Topic) => topic.subjectId === subject.id)
          }));

          const loadedState: StudyData = {
            ...initialState, // Keep default structure for non-DB fields
            subjects: subjectsWithTopics,
            studyLog: toCamelCaseKeys(studyLogData || []),
            studySequence: toCamelCaseKeys(studySequencesData?.[0] || null), // Assuming only one active sequence
            savedStudySequences: toCamelCaseKeys(studySequencesData?.slice(1) || []), // Rest are saved
            pomodoroSettings: pomodoroSettingsData ? {
              tasks: pomodoroSettingsData.tasks, // tasks é JSONB, não converter chaves internas
              shortBreakDuration: pomodoroSettingsData.short_break_duration,
              longBreakDuration: pomodoroSettingsData.long_break_duration,
              cyclesUntilLongBreak: pomodoroSettingsData.cycles_until_long_break,
              alarmSound: pomodoroSettingsData.alarm_sound,
            } : initialPomodoroSettings,
          };

          dispatch({ type: 'SET_STATE', payload: loadedState });
        } catch (error) {
          console.error("Erro ao carregar dados do Supabase:", error);
          toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar seus dados do Supabase.",
            variant: "destructive",
          });
          // Fallback to initial state if loading fails
          dispatch({ type: 'SET_STATE', payload: initialState });
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    } else {
      // If no user, reset to initial state and stop loading
      dispatch({ type: 'SET_STATE', payload: initialState });
      setIsLoading(false);
    }
  }, [user]); // Depende do objeto user do useAuth

  const getAssociatedTopic = useCallback(() => {
    if (!pomodoroState.associatedItemId) return null;
    const topic = state.subjects
      .flatMap(s => s.topics)
      .find(t => t.id === pomodoroState.associatedItemId);
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
            const totalFocusDuration = pomodoroSettings.tasks.reduce((sum, task) => sum + task.duration, 0);
            const sequenceItemIndex = state.studySequence ? state.studySequence.sequence.findIndex((item, index) => item.subjectId === topic.subjectId && index === state.sequenceIndex) : -1;
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
        // Se o tempo está prestes a acabar, apenas defina como 0 e deixe o próximo useEffect lidar com a transição
        if (prev.timeRemaining <= 1) {
          clearInterval(timer); // Para o timer quando o tempo chega a 0
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pomodoroState.status, pomodoroState.key]); // handlePomodoroStateTransition removido daqui

  // Removido useEffect para transição automática. A transição será manual agora.

  const advancePomodoroState = useCallback(() => {
    handlePomodoroStateTransition(pomodoroState);
  }, [pomodoroState, handlePomodoroStateTransition]);


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
    advancePomodoroState, // Expor a nova função
  }), [state, pomodoroState, activeTab, startPomodoroForItem, advancePomodoroState]);
  
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
