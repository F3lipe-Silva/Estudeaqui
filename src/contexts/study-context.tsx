"use client";

import React, { createContext, useContext, useReducer, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { StudyContextType, StudyData, Subject, Topic, PomodoroState, StudyLogEntry, StudySequenceItem, PomodoroSettings, SubjectTemplate, StudySequence } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { REVISION_SEQUENCE } from '@/components/revision-tab';
import { useAuth } from './auth-context';

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
  subjects: [],
  studyLog: [],
  lastStudiedDate: null,
  streak: 0,
  studySequence: null,
  sequenceIndex: 0,
  pomodoroSettings: initialPomodoroSettings,
  templates: [],
  schedulePlans: [],
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
        id: action.payload.id || crypto.randomUUID(),
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
            id: id || crypto.randomUUID(),
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
        id: logData.id || crypto.randomUUID(),
        date: logData.date || today.toISOString(),
      };

      const lastDate = state.lastStudiedDate ? parseISO(state.lastStudiedDate) : null;
      const logDate = parseISO(newLog.date);

      if (!lastDate || !isSameDay(lastDate, logDate)) {
        const yesterday = subDays(logDate, 1);
        if (lastDate && isSameDay(lastDate, yesterday)) {
          streak = state.streak + 1;
        } else if (!lastDate || !isSameDay(lastDate, logDate)) {
          if (lastDate && !isSameDay(lastDate, logDate)) {
            streak = 1;
          } else if (!lastDate) {
            streak = 1;
          }
        }
        lastStudiedDate = newLog.date;
      }

      // Update study sequence progress
      if (studySequence && newLog.sequenceItemIndex !== undefined && newLog.sequenceItemIndex !== null) {
        let itemToUpdate = studySequence.sequence[newLog.sequenceItemIndex];

        if (itemToUpdate && itemToUpdate.subjectId === newLog.subjectId) {
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
              sequenceIndex = (sequenceIndex + 1);
            }
          }
        }
      }

      return {
        ...state,
        subjects,
        studyLog: [newLog, ...state.studyLog].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
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
      let isNew = false;
      if (newSequence) {
        isNew = !state.studySequence || state.studySequence.id !== newSequence.id;
        if (isNew) {
          newSequence.sequence = newSequence.sequence.map((item: StudySequenceItem) => ({ ...item, totalTimeStudied: 0 }));
        }
      }

      let newSequenceIndex = 0;
      if (newSequence && !isNew && state.studySequence && state.sequenceIndex < newSequence.sequence.length) {
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
      const { name, id } = action.payload;
      const templateSubjects: SubjectTemplate['subjects'] = state.subjects.map(s => ({
        name: s.name,
        color: s.color,
        description: s.description,
        studyDuration: s.studyDuration,
        materialUrl: s.materialUrl,
        revisionProgress: 0,
        topics: s.topics.map((t: Topic) => ({
          name: t.name,
          order: t.order,
          isCompleted: false,
        })),
      }));
      const newTemplate: SubjectTemplate = {
        id: id || crypto.randomUUID(),
        name,
        subjects: templateSubjects,
      };
      return {
        ...state,
        templates: [...state.templates, newTemplate],
      };
    }
    case 'LOAD_TEMPLATE_SUCCESS': {
      return {
        ...state,
        subjects: action.payload.subjects,
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

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, originalDispatch] = useReducer(studyReducer, initialState);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  const { pomodoroSettings } = state;

  const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
    status: 'idle',
    timeRemaining: pomodoroSettings?.tasks?.[0]?.duration || 0,
    currentCycle: 0,
    pomodorosCompletedToday: 0,
    key: 0,
    currentTaskIndex: 0,
  });

  // State for transition dialog
  const [showTransitionDialog, setShowTransitionDialog] = useState(false);
  const [transitionAction, setTransitionAction] = useState<'continue' | 'skip' | null>(null);
  const [transitionData, setTransitionData] = useState<{
    prevState: PomodoroState;
    effectiveTimeSpent: number;
    topic?: any;
  } | null>(null);

  // Ref to store effective time spent for manual advance
  const manualAdvanceTimeRef = useRef<number | null>(null);

  // Ref to track if manual registration is expected
  const manualRegistrationExpectedRef = useRef<boolean>(false);

  useEffect(() => {
    setPomodoroState(prev => {
      // Only update the initial time if we're in idle state (not running)
      // If we're in any active state (focus, short_break, long_break, paused), keep the current time
      if (prev.status === 'idle') {
        return {
          ...prev,
          timeRemaining: pomodoroSettings?.tasks?.[0]?.duration || 0,
          currentTaskIndex: 0,
          key: prev.key + 1,
        };
      }
      // For active sessions, preserve the current settings to avoid mid-session changes
      return prev;
    });
  }, [pomodoroSettings]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      originalDispatch({ type: 'SET_STATE', payload: initialState });
      return;
    }

    const loadData = () => {
      setIsLoading(true);
      try {
        const key = `estudeaqui_user_data_${user.id}`;
        const savedData = localStorage.getItem(key);

        if (savedData) {
          const parsedData = JSON.parse(savedData);
          // Remove the metadata we added when saving
          const { lastSaved, ...stateData } = parsedData;
          originalDispatch({
            type: 'SET_STATE',
            payload: stateData as StudyData
          });
        } else {
          // If no data in localStorage, initialize with empty state
          originalDispatch({ type: 'SET_STATE', payload: initialState });
        }

      } catch (error) {
        console.error("Failed to load from localStorage:", error);
        // If there's an error loading, continue with empty state
        originalDispatch({ type: 'SET_STATE', payload: initialState });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Function to save state to localStorage
  const saveStateToLocalStorage = useCallback((stateToSave: StudyData) => {
    if (user) {
      try {
        const key = `estudeaqui_user_data_${user.id}`;
        const dataToSave = {
          ...stateToSave,
          lastSaved: new Date().toISOString()
        };
        localStorage.setItem(key, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Failed to save to localStorage", error);
      }
    }
  }, [user]);

  const dispatch = (action: any) => {
    originalDispatch(action);

    // Save updated state to localStorage after state update
    setTimeout(() => {
      saveStateToLocalStorage(stateRef.current);
    }, 0);
  };

  const getAssociatedTopic = useCallback(() => {
    if (!pomodoroState.associatedItemId) return null;
    const topic = state.subjects
      .flatMap((s: any) => s.topics)
      .find((t: any) => t.id === pomodoroState.associatedItemId);
    return topic || null;
  }, [pomodoroState.associatedItemId, state.subjects]);

  const handlePomodoroStateTransition = useCallback((prevState: PomodoroState) => {
    if (!pomodoroSettings) return;

    // For break periods (short_break, long_break), transition directly without showing dialog
    if (prevState.status === 'short_break' || prevState.status === 'long_break') {
      // Handle break transitions directly
      const firstTask = pomodoroSettings.tasks?.[0];
      setPomodoroState(prev => ({
        ...prev,
        status: 'focus',
        timeRemaining: firstTask?.duration || 0,
        currentTaskIndex: 0,
        key: prev.key + 1,
      }));
      return;
    }

    // For focus periods, calculate effective time spent and show transition dialog
    // Use the manual advance time if it was set, otherwise calculate normally
    const effectiveTimeSpent = manualAdvanceTimeRef.current !== null
      ? manualAdvanceTimeRef.current
      : (() => {
          let calculatedTime = 0;
          if (prevState.originalDuration) {
            // For custom duration sessions
            calculatedTime = prevState.originalDuration - prevState.timeRemaining;
          } else {
            // For task-based sessions
            const currentTask = prevState.currentTaskIndex !== undefined && pomodoroSettings.tasks?.[prevState.currentTaskIndex];
            if (currentTask) {
              calculatedTime = currentTask.duration - prevState.timeRemaining;
            } else {
              calculatedTime = (pomodoroSettings.tasks?.[0]?.duration || 1500) - prevState.timeRemaining; // default to 25 mins
            }
          }
          return calculatedTime;
        })();

    // Reset the ref after using it
    manualAdvanceTimeRef.current = null;

    const topic = getAssociatedTopic();

    // Capture current state values to avoid stale closure issues
    const currentStudySequence = state.studySequence;
    const currentSequenceIndex = state.sequenceIndex;

    // Set the manual registration flag to true before showing the dialog
    manualRegistrationExpectedRef.current = true;

    // Store transition data and show dialog
    setTransitionData({
      prevState,
      effectiveTimeSpent,
      topic
    });
    setShowTransitionDialog(true);

  }, [pomodoroSettings, getAssociatedTopic, state.studySequence, state.sequenceIndex]);

  useEffect(() => {
    // Only run timer if status is focus or break (not paused or idle)
    if (pomodoroState.status === 'paused' || pomodoroState.status === 'idle') {
      return; // Clean up any existing interval when entering paused/idle state
    }

    const timer = setInterval(() => {
      setPomodoroState(prev => {
        // Check again inside the interval to ensure we should still be running
        if (prev.status === 'paused' || prev.status === 'idle') {
          return prev; // Don't update time if we're paused or idle
        }

        if (prev.timeRemaining <= 1) {
          // Don't immediately transition here - just return a state that will trigger
          // the transition in the next render cycle to avoid race conditions
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    // Cleanup function will be called when dependencies change (like when status changes to 'paused')
    return () => clearInterval(timer);
  }, [pomodoroState.status, pomodoroState.key, handlePomodoroStateTransition]);

  // Separate effect to handle transitions when time reaches 0
  useEffect(() => {
    if (pomodoroState.timeRemaining <= 0 &&
        pomodoroState.status !== 'idle' &&
        pomodoroState.status !== 'paused') {
      handlePomodoroStateTransition(pomodoroState);
    }
  }, [pomodoroState.timeRemaining, pomodoroState.status, handlePomodoroStateTransition]);


  const startPomodoroForItem = useCallback((itemId: string, itemType: 'topic' | 'revision', navigateToPomodoro = false, customDuration?: number) => {
    const topic = state.subjects.flatMap(s => s.topics).find(t => t.id === itemId);
    if (topic) {
      const subject = state.subjects.find(s => s.id === topic.subjectId);
      const firstTask = pomodoroSettings?.tasks?.[0];
      if (subject && (firstTask || customDuration)) {
        const duration = customDuration || firstTask?.duration || 25 * 60; // Default to 25 minutes if no task and no custom duration
        setPomodoroState(prev => ({
          ...prev,
          status: 'focus',
          timeRemaining: duration,
          associatedItemId: itemId,
          associatedItemType: itemType,
          key: prev.key + 1,
          currentTaskIndex: customDuration ? undefined : 0, // For custom duration, we might not use task indices
          isCustomDuration: !!customDuration,
          originalDuration: duration,
          currentCycle: 0,
        }));
        if (navigateToPomodoro) {
          setActiveTab('pomodoro');
        }
        toast({
          title: "Foco no estudo iniciado!",
          description: `Matéria: ${subject.name}`,
        });
      } else {
        toast({ title: "Erro", description: "Configure pelo menos uma tarefa de foco nas configurações do Pomodoro.", variant: "destructive" });
      }
    }
  }, [state.subjects, pomodoroSettings, setActiveTab, toast]);

  const pausePomodoroTimer = useCallback(() => {
    setPomodoroState(prev => {
      if (prev.status === 'paused' && prev.previousStatus) {
        // Resume from paused state - go back to the previous status and increment key to restart timer
        return { ...prev, status: prev.previousStatus, previousStatus: undefined, key: prev.key + 1 };
      } else if (prev.status === 'focus' || prev.status === 'short_break' || prev.status === 'long_break') {
        // Pause from any running state
        return { ...prev, status: 'paused', previousStatus: prev.status };
      }
      return prev;
    });
  }, []);

  // Function to show transition dialog
  const showPomodoroTransitionDialog = useCallback((actualTimeSpent: number, topicId?: string, subjectId?: string) => {
    setShowTransitionDialog(true);
  }, []);

  // Function to reset the manual registration flag
  const resetManualRegistrationFlag = useCallback(() => {
    manualRegistrationExpectedRef.current = false;
  }, []);

  // Functions to handle transition dialog actions
  const skipToBreak = useCallback(() => {
    if (transitionData) {
      const { prevState } = transitionData;
      // Skip transition and go directly to break or next phase
      setPomodoroState(prev => {
        if (prev.status === 'focus') {
          const newCycle = prev.currentCycle + 1;
          const isLongBreak = newCycle > 0 && pomodoroSettings?.cyclesUntilLongBreak && newCycle % pomodoroSettings.cyclesUntilLongBreak === 0;

          return {
            ...prev,
            status: isLongBreak ? 'long_break' : 'short_break',
            timeRemaining: isLongBreak ? pomodoroSettings?.longBreakDuration || 900 : pomodoroSettings?.shortBreakDuration || 300,
            currentCycle: newCycle,
            pomodorosCompletedToday: prev.pomodorosCompletedToday + 1,
            key: prev.key + 1
          };
        } else if (prev.status === 'short_break' || prev.status === 'long_break') {
          // Go back to focus
          const firstTask = pomodoroSettings?.tasks?.[0];
          return {
            ...prev,
            status: 'focus',
            timeRemaining: firstTask?.duration || 0,
            currentTaskIndex: 0,
            key: prev.key + 1
          };
        }
        return prev;
      });
    }
    // Reset the manual registration flag when skipping
    manualRegistrationExpectedRef.current = false;
    setShowTransitionDialog(false);
  }, [pomodoroSettings, transitionData]);

  const continueToBreak = useCallback(() => {
    if (transitionData) {
      const { prevState, effectiveTimeSpent, topic } = transitionData;

      // Execute the transition logic based on the stored data
      if (prevState.status === 'focus') {
        // Check if this is a custom duration session
        if (prevState.isCustomDuration) {
          // For custom duration sessions, go straight to break after one session
          // Only register automatically if manual registration is not expected
          if (topic && !manualRegistrationExpectedRef.current) {
            const sequenceItemIndex = state.studySequence ? state.studySequence.sequence.findIndex((item: any, index: number) => item.subjectId === topic.subjectId && index === state.sequenceIndex) : -1;
            dispatch({
              type: 'ADD_STUDY_LOG',
              payload: {
                duration: Math.floor(effectiveTimeSpent / 60), // Use actual time spent
                subjectId: topic.subjectId,
                topicId: topic.id,
                startPage: 0, endPage: 0, questionsTotal: 0, questionsCorrect: 0,
                source: 'pomodoro',
                sequenceItemIndex: sequenceItemIndex !== -1 ? sequenceItemIndex : undefined,
              }
            });
          }

          const newCycle = prevState.currentCycle + 1;
          const isLongBreak = newCycle > 0 && pomodoroSettings?.cyclesUntilLongBreak && newCycle % pomodoroSettings.cyclesUntilLongBreak === 0;

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
        } else {
          // For normal task-based sessions, follow the existing logic
          const currentTaskIndex = prevState.currentTaskIndex ?? 0;
          const nextTaskIndex = currentTaskIndex + 1;

          if (nextTaskIndex < (pomodoroSettings.tasks?.length || 0)) {
            const nextTask = pomodoroSettings.tasks[nextTaskIndex];
            toast({ title: `Próxima tarefa: ${nextTask.name}` });
            setPomodoroState(prev => ({
              ...prev,
              currentTaskIndex: nextTaskIndex,
              timeRemaining: nextTask.duration,
              key: prev.key + 1,
            }));
          } else {
            // Only register automatically if manual registration is not expected
            const topic = getAssociatedTopic();
            if (topic && !manualRegistrationExpectedRef.current) {
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
        }
      } else if (prevState.status === 'short_break' || prevState.status === 'long_break') {
        // For breaks, transition directly to focus without showing dialog
        const firstTask = pomodoroSettings.tasks?.[0];
        setPomodoroState(prev => ({
          ...prev,
          status: 'focus',
          timeRemaining: firstTask?.duration || 0,
          currentTaskIndex: 0,
          key: prev.key + 1,
        }));
      } else {
        setPomodoroState(prev => ({ ...prev, status: 'idle' }));
      }
    }
    // Reset the manual registration flag after completing the transition
    manualRegistrationExpectedRef.current = false;
    setShowTransitionDialog(false);
  }, [pomodoroSettings, transitionData, state.studySequence, state.sequenceIndex, getAssociatedTopic, toast, dispatch]);

  const advancePomodoroCycle = useCallback(() => {
    setPomodoroState(prev => {
      if (prev.status === 'idle') return prev;

      // Calculate effective time spent: total task time - remaining time
      let effectiveTimeSpent = 0;
      if (prev.originalDuration) {
        // For custom duration sessions
        effectiveTimeSpent = prev.originalDuration - prev.timeRemaining;
      } else {
        // For task-based sessions
        const currentTask = prev.currentTaskIndex !== undefined && pomodoroSettings?.tasks?.[prev.currentTaskIndex];
        if (currentTask) {
          effectiveTimeSpent = currentTask.duration - prev.timeRemaining;
        } else {
          effectiveTimeSpent = (pomodoroSettings?.tasks?.[0]?.duration || 1500) - prev.timeRemaining; // default to 25 mins
        }
      }

      // Store the effective time spent in the ref for use in handlePomodoroStateTransition
      manualAdvanceTimeRef.current = effectiveTimeSpent;

      // Set time to 0 to trigger the transition effect
      return { ...prev, timeRemaining: 0, key: prev.key + 1 };
    });
  }, [pomodoroSettings]);

  const value = useMemo(() => ({
    data: state,
    dispatch,
    pomodoroState,
    setPomodoroState,
    activeTab,
    setActiveTab,
    startPomodoroForItem,
    pausePomodoroTimer,
    advancePomodoroCycle,
    skipToBreak,
    continueToBreak,
    resetManualRegistrationFlag,
    showTransitionDialog,
    setShowTransitionDialog,
  }), [state, pomodoroState, activeTab, startPomodoroForItem, pausePomodoroTimer, advancePomodoroCycle, skipToBreak, continueToBreak, resetManualRegistrationFlag, showTransitionDialog, setShowTransitionDialog]);

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
