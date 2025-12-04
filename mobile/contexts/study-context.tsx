import React, { createContext, useContext, useReducer, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { StudyContextType, StudyData, Subject, Topic, PomodoroState, StudyLogEntry, StudySequenceItem, PomodoroSettings, SubjectTemplate, StudySequence } from '../lib/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { subDays, isSameDay, parseISO } from 'date-fns';
import { Alert } from 'react-native';

export const REVISION_SEQUENCE = [0,1,0,2,1,3,2,4,3,0,5,4,1,6,5,2,7,6,3,8,7,4,0,9,8,5,1,10,9,6,2,11,10,7,3,12,11,8,4,13,12,9,5,14,13,10,6,15,14,11,7,16,15,12,8,17,16,13,9,18,17,15,11,19,18,15,11,20,19,16,12,21,20,17,13,21,20,17,13,22,21,18,14,22,21,18,14,23,22,19,15];

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
          id: action.payload.id || Math.random().toString(36).substr(2, 9),
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
              id: id || Math.random().toString(36).substr(2, 9),
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
          id: logData.id || Math.random().toString(36).substr(2, 9),
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

        // Insert the new log in the correct position based on date (newest first)
        // Find the correct position to insert the new log
        const newStudyLog = [...state.studyLog];
        let insertIndex = 0;
        const newLogDate = parseISO(newLog.date).getTime();

        for (let i = 0; i < newStudyLog.length; i++) {
          if (parseISO(newStudyLog[i].date).getTime() < newLogDate) {
            insertIndex = i;
            break;
          }
          insertIndex = i + 1;
        }

        newStudyLog.splice(insertIndex, 0, newLog);

        return {
          ...state,
          subjects,
          studyLog: newStudyLog,
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
          id: id || Math.random().toString(36).substr(2, 9),
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
  // Simplified Auth: Using local storage for user data
  const user = { id: 'local-user' }; // Placeholder

  const [state, originalDispatch] = useReducer(studyReducer, initialState);
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

  // Refs to avoid stale closures
  const manualAdvanceTimeRef = useRef<number | null>(null);
  const manualRegistrationExpectedRef = useRef<boolean>(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (!user) {
      setIsLoading(false);
      originalDispatch({ type: 'SET_STATE', payload: initialState });
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const key = `estudeaqui_user_data_${user.id}`;
        const savedData = await AsyncStorage.getItem(key);

        if (savedData) {
          const parsedData = JSON.parse(savedData);
          const { lastSaved, ...stateData } = parsedData;
          originalDispatch({
            type: 'SET_STATE',
            payload: stateData as StudyData
          });
        } else {
          originalDispatch({ type: 'SET_STATE', payload: initialState });
        }

      } catch (error) {
        console.error("Failed to load from AsyncStorage:", error);
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

  const saveStateToStorage = useCallback(async (stateToSave: StudyData) => {
    if (user) {
      try {
        const key = `estudeaqui_user_data_${user.id}`;
        const dataToSave = {
          ...stateToSave,
          lastSaved: new Date().toISOString()
        };
        await AsyncStorage.setItem(key, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Failed to save to AsyncStorage", error);
      }
    }
  }, [user]);

  const dispatch = (action: any) => {
    originalDispatch(action);
    // Debounce saves to avoid excessive AsyncStorage operations
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    // Use a longer debounce time to reduce the frequency of saves
    saveTimeoutRef.current = setTimeout(() => {
      saveStateToStorage(stateRef.current);
    }, 1000); // 1000ms debounce to reduce frequent saves even more
  };

  // Batch dispatch function to handle multiple related updates efficiently
  const batchDispatch = (actions: any[]) => {
    actions.forEach(action => originalDispatch(action));
    // Only save once after all actions are processed
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveStateToStorage(stateRef.current);
    }, 1000);
  };

  // ... (Pomodoro logic would go here, simplified for brevity as the user asked for structure first)
  // I am including empty functions to satisfy the context interface

  const startPomodoroForItem = useCallback((itemId: string, itemType: 'topic' | 'revision', navigateToPomodoro = false, customDuration?: number) => {
      // simplified
      Alert.alert("Pomodoro", "Feature not fully implemented in mobile context yet");
  }, []);

  const pausePomodoroTimer = useCallback(() => {}, []);
  const advancePomodoroCycle = useCallback(() => {}, []);
  const skipToBreak = useCallback(() => {}, []);
  const continueToBreak = useCallback(() => {}, []);
  const resetManualRegistrationFlag = useCallback(() => {}, []);


  const value = useMemo(() => ({
    data: state,
    dispatch,
    batchDispatch,
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

  // Cleanup function to clear timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
      return null; // Or a loading spinner
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