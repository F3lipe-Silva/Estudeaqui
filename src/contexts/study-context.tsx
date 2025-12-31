"use client";

import React, { createContext, useContext, useReducer, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { StudyContextType, StudyData, Subject, Topic, PomodoroState, StudyLogEntry, StudySequenceItem, PomodoroSettings, SubjectTemplate, StudySequence, SchedulePlan } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { REVISION_SEQUENCE } from '@/components/revision-tab';
import { useAuth } from './auth-context';
import { useAppwrite } from './appwrite-context';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';

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
  const stateRef = useRef(state);

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
  const [transitionData, setTransitionData] = useState<{
    prevState: PomodoroState;
    effectiveTimeSpent: number;
    topic?: any;
  } | null>(null);
  const manualAdvanceTimeRef = useRef<number | null>(null);
  const manualRegistrationExpectedRef = useRef<boolean>(false);

  useEffect(() => {
    setPomodoroState(prev => {
      if (prev.status === 'idle') {
        return {
          ...prev,
          timeRemaining: pomodoroSettings?.tasks?.[0]?.duration || 0,
          currentTaskIndex: 0,
          key: prev.key + 1,
        };
      }
      return prev;
    });
  }, [pomodoroSettings]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // --- APPWRITE INTEGRATION ---

  // Load Data from Appwrite
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      originalDispatch({ type: 'SET_STATE', payload: initialState });
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const uid = user.$id;

        // Load subjects
        const subjectsResponse = await databases.listDocuments(
          'estudeaqui_db',
          'study_subjects',
          [Query.equal('userId', uid)]
        );

        // Load study logs
        const logsResponse = await databases.listDocuments(
          'estudeaqui_db',
          'study_logs',
          [
            Query.equal('userId', uid),
            Query.orderDesc('date')
          ]
        );

        // Load study sequences
        const sequencesResponse = await databases.listDocuments(
          'estudeaqui_db',
          'study_sequences',
          [Query.equal('userId', uid)]
        );

        // Load templates
        const templatesResponse = await databases.listDocuments(
          'estudeaqui_db',
          'study_templates',
          [Query.equal('userId', uid)]
        );

        // Transform data to match expected format
        const subjects = subjectsResponse.documents.map(doc => ({
          id: doc.id,
          name: doc.name,
          color: doc.color,
          description: doc.description || '',
          materialUrl: doc.materialUrl || '',
          studyDuration: 0, // Will be calculated from sequences
          revisionProgress: 0,
          topics: doc.topics ? JSON.parse(doc.topics) : [],
        }));

        const studyLog = logsResponse.documents.map((doc: any) => ({
          id: doc.id,
          subjectId: doc.subjectId,
          topicId: doc.id, // Using doc.id as topicId for now, should be stored properly
          date: doc.date,
          duration: doc.duration,
          startPage: 0,
          endPage: 0,
          questionsTotal: 0,
          questionsCorrect: 0,
          source: 'appwrite',
        }));

        const studySequence = sequencesResponse.documents.length > 0
          ? {
              id: sequencesResponse.documents[0].id,
              name: sequencesResponse.documents[0].name,
              sequence: sequencesResponse.documents[0].sequence ? JSON.parse(sequencesResponse.documents[0].sequence) : [],
            }
          : null;

        const templates = templatesResponse.documents.map(doc => ({
          id: doc.id,
          name: doc.name,
          description: doc.description || '',
          subjects: doc.subjects ? JSON.parse(doc.subjects) : [],
          settings: doc.settings ? JSON.parse(doc.settings) : {},
        }));

        // Calculate streaks and other derived data
        let streak = 0;
        let lastStudiedDate = null;

        if (studyLog.length > 0) {
          const sortedLogs = studyLog.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          const today = new Date();
          let currentDate = new Date(today);

          for (let i = 0; i < sortedLogs.length; i++) {
            const logDate = new Date(sortedLogs[i].date);
            if (isSameDay(currentDate, logDate)) {
              streak++;
              currentDate.setDate(currentDate.getDate() - 1);
            } else if (isSameDay(currentDate, subDays(logDate, 0))) {
              // Continue checking for consecutive days
              continue;
            } else {
              break;
            }
          }

          lastStudiedDate = sortedLogs[0].date;
        }

        const loadedState = {
          subjects,
          studyLog,
          lastStudiedDate,
          streak,
          studySequence,
          sequenceIndex: 0,
          pomodoroSettings: initialPomodoroSettings,
          templates,
          schedulePlans: [],
        };

        originalDispatch({ type: 'SET_STATE', payload: loadedState });

      } catch (error) {
        console.error("Failed to load from Appwrite:", error);
        toast({ title: "Erro de Carregamento", description: "Não foi possível carregar seus dados da nuvem.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, toast]);

  // Sync actions to Appwrite
  const syncToAppwrite = async (action: any, newState: StudyData) => {
    if (!user) return;

    try {
      const uid = user.$id;

      switch (action.type) {
        case 'ADD_SUBJECT': {
          const subject = newState.subjects.find(s => s.id === action.payload.id);
          if (subject) {
            const subjectData = {
              userId: uid,
              id: subject.id,
              name: subject.name,
              color: subject.color,
              description: subject.description || '',
              materialUrl: subject.materialUrl || '',
              topics: JSON.stringify(subject.topics),
            };

            await databases.createDocument(
              'estudeaqui_db',
              'study_subjects',
              subject.id, // Use subject.id as document ID
              subjectData
            );
          }
          break;
        }

        case 'UPDATE_SUBJECT':
        case 'ADD_TOPIC':
        case 'TOGGLE_TOPIC_COMPLETED':
        case 'DELETE_TOPIC': {
          const subject = newState.subjects.find(s => s.id === (action.payload.id || action.payload.subjectId));
          if (subject) {
            const subjectData = {
              userId: uid,
              name: subject.name,
              color: subject.color,
              description: subject.description || '',
              materialUrl: subject.materialUrl || '',
              topics: JSON.stringify(subject.topics),
            };

            // Try to update first, if it fails (document doesn't exist), create it
            try {
              await databases.updateDocument(
                'estudeaqui_db',
                'study_subjects',
                subject.id,
                subjectData
              );
            } catch (error) {
              // Document doesn't exist, create it
              await databases.createDocument(
                'estudeaqui_db',
                'study_subjects',
                subject.id,
                { ...subjectData, id: subject.id }
              );
            }
          }
          break;
        }

        case 'DELETE_SUBJECT': {
          const subjectId = action.payload;
          try {
            await databases.deleteDocument(
              'estudeaqui_db',
              'study_subjects',
              subjectId
            );
          } catch (error) {
            console.error("Error deleting subject from Appwrite:", error);
          }
          break;
        }

        case 'ADD_STUDY_LOG': {
          const newLog = newState.studyLog[0];
          if (newLog) {
            const logData = {
              userId: uid,
              id: newLog.id,
              subjectId: newLog.subjectId,
              date: newLog.date,
              duration: newLog.duration,
            };

            await databases.createDocument(
              'estudeaqui_db',
              'study_logs',
              newLog.id,
              logData
            );
          }
          break;
        }

        case 'SAVE_STUDY_SEQUENCE': {
          if (newState.studySequence) {
            const sequenceData = {
              userId: uid,
              name: newState.studySequence.name,
              sequence: JSON.stringify(newState.studySequence.sequence),
            };

            try {
              await databases.updateDocument(
                'estudeaqui_db',
                'study_sequences',
                newState.studySequence.id,
                sequenceData
              );
            } catch (error) {
              // Document doesn't exist, create it
              await databases.createDocument(
                'estudeaqui_db',
                'study_sequences',
                newState.studySequence.id,
                { ...sequenceData, id: newState.studySequence.id }
              );
            }
          }
          break;
        }

        case 'SAVE_TEMPLATE': {
          const template = newState.templates[newState.templates.length - 1];
          if (template) {
            const templateData = {
              userId: uid,
              id: template.id,
              name: template.name,
              subjects: JSON.stringify(template.subjects),
            };

            try {
              await databases.updateDocument(
                'estudeaqui_db',
                'study_templates',
                template.id,
                templateData
              );
            } catch (error) {
              // Document doesn't exist, create it
              await databases.createDocument(
                'estudeaqui_db',
                'study_templates',
                template.id,
                templateData
              );
            }
          }
          break;
        }
      }
    } catch (error) {
      console.error("Error syncing to Appwrite:", error);
      toast({ title: "Erro ao salvar", description: "Suas alterações podem não ter sido salvas na nuvem.", variant: "destructive" });
    }
  };

  const dispatch = async (action: any) => {
    originalDispatch(action);

    // Sync to Appwrite after state update
    const predictedState = studyReducer(stateRef.current, action);
    await syncToAppwrite(action, predictedState);
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

    // Set the manual registration flag to true before showing the dialog
    manualRegistrationExpectedRef.current = true;

    // Store transition data and show dialog
    setTransitionData({
      prevState,
      effectiveTimeSpent,
      topic
    });
    setShowTransitionDialog(true);

  }, [pomodoroSettings, getAssociatedTopic]);

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

  const advancePomodoroCycle = useCallback(() => {
    setPomodoroState(prev => {
      if (prev.status === 'idle') return prev;

      // Calculate effective time spent
      let effectiveTimeSpent = 0;
      if (prev.originalDuration) {
        effectiveTimeSpent = prev.originalDuration - prev.timeRemaining;
      } else {
        const currentTask = prev.currentTaskIndex !== undefined && pomodoroSettings?.tasks?.[prev.currentTaskIndex];
        if (currentTask) {
          effectiveTimeSpent = currentTask.duration - prev.timeRemaining;
        } else {
          effectiveTimeSpent = (pomodoroSettings?.tasks?.[0]?.duration || 1500) - prev.timeRemaining;
        }
      }

      manualAdvanceTimeRef.current = effectiveTimeSpent;
      return { ...prev, timeRemaining: 0, key: prev.key + 1 };
    });
  }, [pomodoroSettings]);

  const showPomodoroTransitionDialog = useCallback((show: boolean) => {
     setShowTransitionDialog(show);
  }, []);
  
  const resetManualRegistrationFlag = useCallback(() => {
    manualRegistrationExpectedRef.current = false;
  }, []);

  const skipToBreak = useCallback(() => {
    if (transitionData) {
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
    manualRegistrationExpectedRef.current = false;
    setShowTransitionDialog(false);
  }, [pomodoroSettings, transitionData]);

  const continueToBreak = useCallback(() => {
    if (transitionData) {
      const { prevState, effectiveTimeSpent, topic } = transitionData;

      if (prevState.status === 'focus') {
        if (prevState.isCustomDuration) {
          if (topic && !manualRegistrationExpectedRef.current) {
            const sequenceItemIndex = state.studySequence ? state.studySequence.sequence.findIndex((item: any, index: number) => item.subjectId === topic.subjectId && index === state.sequenceIndex) : -1;
            dispatch({
              type: 'ADD_STUDY_LOG',
              payload: {
                duration: Math.floor(effectiveTimeSpent / 60),
                subjectId: topic.subjectId,
                topicId: topic.id,
                startPage: 0, endPage: 0, questionsTotal: 0, questionsCorrect: 0,
                source: 'pomodoro',
                sequenceItemIndex: sequenceItemIndex !== -1 ? sequenceItemIndex : null,
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
                  sequenceItemIndex: sequenceItemIndex !== -1 ? sequenceItemIndex : null,
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
    manualRegistrationExpectedRef.current = false;
    setShowTransitionDialog(false);
  }, [pomodoroSettings, transitionData, state.studySequence, state.sequenceIndex, getAssociatedTopic, toast, dispatch]);


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
    setShowTransitionDialog: showPomodoroTransitionDialog,
  }), [state, pomodoroState, activeTab, startPomodoroForItem, pausePomodoroTimer, advancePomodoroCycle, skipToBreak, continueToBreak, resetManualRegistrationFlag, showTransitionDialog, showPomodoroTransitionDialog]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="text-center">
          <p className="text-lg font-semibold">Carregando seus dados...</p>
          <p className="text-muted-foreground">Carregando dados locais.</p>
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
