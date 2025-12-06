import React, { createContext, useContext, useReducer, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { StudyContextType, StudyData, Subject, Topic, PomodoroState, StudyLogEntry, StudySequenceItem, PomodoroSettings, SubjectTemplate, StudySequence, SchedulePlan } from '../types';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { useAuth } from './auth-context';
import { useAlert } from './alert-context';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';

// Helper for UUID generation in React Native if crypto.randomUUID is not available
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Advanced revision sequence matching web version
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
  cycleResetCount: 0,
};

const StudyContext = createContext<StudyContextType | undefined>(undefined);

function studyReducer(state: StudyData, action: any): StudyData {
  switch (action.type) {
    case 'SET_STATE':
      const loadedState = action.payload;
      if (!loadedState) return initialState;
      // Ensure studyLog and subjects are always arrays
      return { 
        ...initialState, 
        ...loadedState, 
        studyLog: loadedState.studyLog || [],
        subjects: loadedState.subjects || []
      };
    case 'ADD_SUBJECT': {
      const newSubject: Subject = {
        id: action.payload.id || generateUUID(),
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

      if (studySequence && newLog.sequenceItemIndex !== undefined && newLog.sequenceItemIndex !== null) {
        let itemToUpdate = studySequence.sequence[newLog.sequenceItemIndex];

        if (itemToUpdate && itemToUpdate.subjectId === newLog.subjectId) {
          const newTotalTime = (itemToUpdate.totalTimeStudied || 0) + newLog.duration;
          const newSequence = [...studySequence.sequence];
          newSequence[newLog.sequenceItemIndex] = { ...itemToUpdate, totalTimeStudied: newTotalTime };
          studySequence = { ...studySequence, sequence: newSequence };

          itemToUpdate = newSequence[newLog.sequenceItemIndex];

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
        cycleResetCount: state.cycleResetCount + 1,
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
        id: id || generateUUID(),
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
    case 'ADD_SCHEDULE_PLAN': {
      const newPlan: SchedulePlan = {
        id: action.payload.id || generateUUID(),
        name: action.payload.name,
        createdAt: action.payload.createdAt || new Date().toISOString(),
        totalHorasSemanais: action.payload.totalHorasSemanais,
        duracaoSessao: action.payload.duracaoSessao,
        subModoPomodoro: action.payload.subModoPomodoro,
        sessoesPorMateria: action.payload.sessoesPorMateria,
      };
      return {
        ...state,
        schedulePlans: [...state.schedulePlans, newPlan],
      };
    }
    case 'UPDATE_SCHEDULE_PLAN': {
      return {
        ...state,
        schedulePlans: state.schedulePlans.map(plan =>
          plan.id === action.payload.id ? { ...plan, ...action.payload.data } : plan
        ),
      };
    }
    case 'DELETE_SCHEDULE_PLAN': {
      return {
        ...state,
        schedulePlans: state.schedulePlans.filter(plan => plan.id !== action.payload),
      };
    }
    default:
      return state;
  }
}

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [state, originalDispatch] = useReducer(studyReducer, initialState);
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

  // --- FIRESTORE INTEGRATION ---

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      originalDispatch({ type: 'SET_STATE', payload: initialState });
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const uid = user.uid; 
        
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        
        let loadedState: Partial<StudyData> = {};

        if (userDoc.exists()) {
          const userData = userDoc.data();
          loadedState = {
            streak: userData.streak || 0,
            lastStudiedDate: userData.lastStudiedDate || null,
            pomodoroSettings: userData.pomodoroSettings || initialPomodoroSettings,
            sequenceIndex: userData.sequenceIndex || 0,
            cycleResetCount: userData.cycleResetCount || 0,
          };
        }

        const subjectsCol = collection(db, 'users', uid, 'subjects');
        const subjectsSnapshot = await getDocs(subjectsCol);
        loadedState.subjects = subjectsSnapshot.docs.map(d => d.data() as Subject);

        const logsCol = collection(db, 'users', uid, 'logs');
        const logsQuery = query(logsCol, orderBy('date', 'desc'));
        const logsSnapshot = await getDocs(logsQuery);
        loadedState.studyLog = logsSnapshot.docs.map(d => d.data() as StudyLogEntry);

        const sequenceDocRef = doc(db, 'users', uid, 'sequences', 'current');
        const sequenceDoc = await getDoc(sequenceDocRef);
        if (sequenceDoc.exists()) {
          loadedState.studySequence = sequenceDoc.data() as StudySequence;
        }

        const templatesCol = collection(db, 'users', uid, 'templates');
        const templatesSnapshot = await getDocs(templatesCol);
        loadedState.templates = templatesSnapshot.docs.map(d => d.data() as SubjectTemplate);

        const schedulesCol = collection(db, 'users', uid, 'schedules');
        const schedulesSnapshot = await getDocs(schedulesCol);
        loadedState.schedulePlans = schedulesSnapshot.docs.map(d => d.data() as SchedulePlan);

        originalDispatch({ type: 'SET_STATE', payload: loadedState });

      } catch (error) {
        console.error("Failed to load from Firestore:", error);
        showAlert({
          title: "Erro de Sincronização",
          message: "Não foi possível carregar seus dados.",
          variant: 'destructive',
          primaryButton: {
            text: "OK",
            action: () => {}
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const syncActionToFirestore = async (uid: string, action: any, newState: StudyData) => {
    try {
      switch (action.type) {
        case 'ADD_SUBJECT':
        case 'UPDATE_SUBJECT':
        case 'ADD_TOPIC':
        case 'TOGGLE_TOPIC_COMPLETED':
        case 'DELETE_TOPIC':
        case 'SET_REVISION_PROGRESS': {
           let subjectId = action.payload.id || action.payload.subjectId;
           const subject = newState.subjects.find(s => s.id === subjectId);
           if (subject) {
             await setDoc(doc(db, 'users', uid, 'subjects', subjectId), subject);
           }
           break;
        }
        case 'DELETE_SUBJECT': {
          await deleteDoc(doc(db, 'users', uid, 'subjects', action.payload));
          break;
        }
        case 'ADD_STUDY_LOG': {
          const newLog = newState.studyLog[0]; 
          if (newLog) {
             await setDoc(doc(db, 'users', uid, 'logs', newLog.id), newLog);
          }
          await setDoc(doc(db, 'users', uid), {
            streak: newState.streak,
            lastStudiedDate: newState.lastStudiedDate,
            sequenceIndex: newState.sequenceIndex,
          }, { merge: true });
          if (newState.studySequence) {
             await setDoc(doc(db, 'users', uid, 'sequences', 'current'), newState.studySequence);
          }
          break;
        }
        case 'DELETE_STUDY_LOG': {
          await deleteDoc(doc(db, 'users', uid, 'logs', action.payload));
           if (newState.studySequence) {
             await setDoc(doc(db, 'users', uid, 'sequences', 'current'), newState.studySequence);
          }
          break;
        }
        case 'SAVE_STUDY_SEQUENCE':
        case 'RESET_STUDY_SEQUENCE':
        case 'ADVANCE_SEQUENCE': {
           if (newState.studySequence) {
             await setDoc(doc(db, 'users', uid, 'sequences', 'current'), newState.studySequence);
           }
           await setDoc(doc(db, 'users', uid), {
             sequenceIndex: newState.sequenceIndex,
             cycleResetCount: newState.cycleResetCount
           }, { merge: true });
           break;
        }
        case 'UPDATE_POMODORO_SETTINGS': {
           await setDoc(doc(db, 'users', uid), { pomodoroSettings: newState.pomodoroSettings }, { merge: true });
           break;
        }
        case 'SAVE_TEMPLATE': {
          const template = newState.templates.find(t => t.name === action.payload.name);
          if (template) {
             await setDoc(doc(db, 'users', uid, 'templates', template.id), template);
          }
          break;
        }
        case 'ADD_SCHEDULE_PLAN':
        case 'UPDATE_SCHEDULE_PLAN': {
          const plan = newState.schedulePlans.find(p => p.id === action.payload.id);
          if (plan) {
             await setDoc(doc(db, 'users', uid, 'schedules', plan.id), plan);
          }
          break;
        }
        case 'DELETE_SCHEDULE_PLAN': {
          await deleteDoc(doc(db, 'users', uid, 'schedules', action.payload));
          break;
        }
        case 'DELETE_TEMPLATE': {
          await deleteDoc(doc(db, 'users', uid, 'templates', action.payload));
          break;
        }
      }
    } catch (error) {
      console.error("Error syncing to Firestore:", error);
    }
  };

  const dispatch = async (action: any) => {
    originalDispatch(action);
    if (user) {
       const predictedState = studyReducer(stateRef.current, action);
       syncActionToFirestore(user.uid, action, predictedState);
    }
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
    if (prevState.status === 'short_break' || prevState.status === 'long_break') {
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
    const effectiveTimeSpent = manualAdvanceTimeRef.current !== null
      ? manualAdvanceTimeRef.current
      : (() => {
          let calculatedTime = 0;
          if (prevState.originalDuration) {
            calculatedTime = prevState.originalDuration - prevState.timeRemaining;
          } else {
            const currentTask = prevState.currentTaskIndex !== undefined && pomodoroSettings.tasks?.[prevState.currentTaskIndex];
            if (currentTask) {
              calculatedTime = currentTask.duration - prevState.timeRemaining;
            } else {
              calculatedTime = (pomodoroSettings.tasks?.[0]?.duration || 1500) - prevState.timeRemaining;
            }
          }
          return calculatedTime;
        })();
    manualAdvanceTimeRef.current = null;
    const topic = getAssociatedTopic();
    manualRegistrationExpectedRef.current = true;
    setTransitionData({
      prevState,
      effectiveTimeSpent,
      topic
    });
    setShowTransitionDialog(true);
  }, [pomodoroSettings, getAssociatedTopic]);

  useEffect(() => {
    if (pomodoroState.status === 'paused' || pomodoroState.status === 'idle') {
      return;
    }
    const timer = setInterval(() => {
      setPomodoroState(prev => {
        if (prev.status === 'paused' || prev.status === 'idle') return prev;
        if (prev.timeRemaining <= 1) return { ...prev, timeRemaining: 0 };
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [pomodoroState.status, pomodoroState.key, handlePomodoroStateTransition]);

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
        const duration = customDuration || firstTask?.duration || 25 * 60;
        setPomodoroState(prev => ({
          ...prev,
          status: 'focus',
          timeRemaining: duration,
          associatedItemId: itemId,
          associatedItemType: itemType,
          key: prev.key + 1,
          currentTaskIndex: customDuration ? undefined : 0,
          isCustomDuration: !!customDuration,
          originalDuration: duration,
          currentCycle: 0,
        }));
        if (navigateToPomodoro) {
          setActiveTab('pomodoro');
        }
        showAlert({
          title: "Foco iniciado!",
          message: `Matéria: ${subject.name}`,
          variant: 'success',
          primaryButton: {
            text: "OK",
            action: () => {}
          }
        });
      } else {
        showAlert({
          title: "Erro",
          message: "Configure pelo menos uma tarefa de foco.",
          variant: 'destructive',
          primaryButton: {
            text: "OK",
            action: () => {}
          }
        });
      }
    }
  }, [state.subjects, pomodoroSettings, setActiveTab]);

  const pausePomodoroTimer = useCallback(() => {
    setPomodoroState(prev => {
      if (prev.status === 'paused' && prev.previousStatus) {
        return { ...prev, status: prev.previousStatus, previousStatus: undefined, key: prev.key + 1 };
      } else if (prev.status === 'focus' || prev.status === 'short_break' || prev.status === 'long_break') {
        return { ...prev, status: 'paused', previousStatus: prev.status };
      }
      return prev;
    });
  }, []);

  const advancePomodoroCycle = useCallback(() => {
    setPomodoroState(prev => {
      if (prev.status === 'idle') return prev;
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
                sequenceItemIndex: sequenceItemIndex !== -1 ? sequenceItemIndex : undefined,
              }
            });
          }
          const newCycle = prevState.currentCycle + 1;
          const isLongBreak = newCycle > 0 && pomodoroSettings?.cyclesUntilLongBreak && newCycle % pomodoroSettings.cyclesUntilLongBreak === 0;

          if (isLongBreak) {
            showAlert({
              title: "Pausa longa!",
              message: "Você merece um bom descanso.",
              variant: 'success',
              primaryButton: {
                text: "OK",
                action: () => {}
              }
            });
            setPomodoroState(prev => ({
              ...prev,
              status: 'long_break',
              timeRemaining: pomodoroSettings.longBreakDuration,
              currentCycle: newCycle,
              pomodorosCompletedToday: prev.pomodorosCompletedToday + 1,
              key: prev.key + 1,
            }));
          } else {
            showAlert({
              title: "Pausa curta!",
              message: "Respire fundo por alguns minutos.",
              variant: 'success',
              primaryButton: {
                text: "OK",
                action: () => {}
              }
            });
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
            showAlert({
              title: "Próxima tarefa",
              message: `${nextTask.name}`,
              variant: 'default',
              primaryButton: {
                text: "OK",
                action: () => {}
              }
            });
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
                  sequenceItemIndex: sequenceItemIndex !== -1 ? sequenceItemIndex : undefined,
                }
              });
            }

            const newCycle = prevState.currentCycle + 1;
            const isLongBreak = newCycle > 0 && newCycle % pomodoroSettings.cyclesUntilLongBreak === 0;

            if (isLongBreak) {
              showAlert({
                title: "Pausa longa!",
                message: "Você merece um bom descanso.",
                variant: 'success',
                primaryButton: {
                  text: "OK",
                  action: () => {}
                }
              });
              setPomodoroState(prev => ({
                ...prev,
                status: 'long_break',
                timeRemaining: pomodoroSettings.longBreakDuration,
                currentCycle: newCycle,
                pomodorosCompletedToday: prev.pomodorosCompletedToday + 1,
                key: prev.key + 1,
              }));
            } else {
              showAlert({
                title: "Pausa curta!",
                message: "Respire fundo por alguns minutos.",
                variant: 'success',
                primaryButton: {
                  text: "OK",
                  action: () => {}
                }
              });
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
  }, [pomodoroSettings, transitionData, state.studySequence, state.sequenceIndex, getAssociatedTopic, dispatch]);

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
    return null; // Or a Loading component
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
