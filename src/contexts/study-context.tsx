"use client";

import React, { createContext, useContext, useReducer, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { StudyContextType, StudyData, Subject, Topic, PomodoroState, StudyLogEntry, StudySequenceItem, PomodoroSettings, SubjectTemplate, StudySequence, SchedulePlan } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { REVISION_SEQUENCE } from '@/components/revision-tab';
import { useAuth } from './auth-context';
import { createClient } from '@/lib/supabase/client';

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
    case 'SET_SCHEDULE_PLANS': {
      return { ...state, schedulePlans: action.payload };
    }
    case 'ADD_SCHEDULE_PLAN': {
      return { ...state, schedulePlans: [...state.schedulePlans, action.payload] };
    }
    case 'DELETE_SCHEDULE_PLAN': {
      return { ...state, schedulePlans: state.schedulePlans.filter(p => p.id !== action.payload) };
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
  const supabase = createClient();

  const { pomodoroSettings } = state;

  const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
    status: 'idle',
    timeRemaining: pomodoroSettings?.tasks?.[0]?.duration || 0,
    currentCycle: 0,
    pomodorosCompletedToday: 0,
    key: 0,
    currentTaskIndex: 0,
  });

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
      originalDispatch({ type: 'SET_STATE', payload: initialState });
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [
          subjectsRes,
          logsRes,
          sequenceRes,
          settingsRes,
          templatesRes,
          schedulePlansRes
        ] = await Promise.all([
          supabase.from('subjects').select('*, topics(*)').order('created_at'),
          supabase.from('study_logs').select('*').order('date', { ascending: false }),
          supabase.from('study_sequences').select('*').order('created_at', { ascending: false }).limit(1).single(),
          supabase.from('pomodoro_settings').select('*').single(),
          supabase.from('templates').select('*').order('created_at'),
          supabase.from('schedule_plans').select('*').order('created_at', { ascending: false })
        ]);

        if (subjectsRes.error) throw subjectsRes.error;

        const subjects: Subject[] = subjectsRes.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          color: s.color,
          description: s.description,
          studyDuration: s.study_duration,
          materialUrl: s.material_url,
          revisionProgress: s.revision_progress,
          topics: s.topics.map((t: any) => ({
            id: t.id,
            subjectId: t.subject_id,
            name: t.name,
            order: t.order,
            isCompleted: t.is_completed,
            description: t.description
          })).sort((a: any, b: any) => a.order - b.order)
        }));

        const studyLog: StudyLogEntry[] = (logsRes.data || []).map((l: any) => ({
          id: l.id,
          subjectId: l.subject_id,
          topicId: l.topic_id,
          date: l.date,
          duration: l.duration,
          startPage: l.start_page,
          endPage: l.end_page,
          questionsTotal: l.questions_total,
          questionsCorrect: l.questions_correct,
          source: l.source,
          sequenceItemIndex: l.sequence_item_index
        }));

        let studySequence: StudySequence | null = null;
        if (sequenceRes.data) {
          studySequence = {
            id: sequenceRes.data.id,
            name: sequenceRes.data.name,
            sequence: sequenceRes.data.sequence
          };
        }

        let settings = initialPomodoroSettings;
        if (settingsRes.data?.settings) {
          settings = settingsRes.data.settings;
        }

        const templates: SubjectTemplate[] = (templatesRes.data || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          subjects: t.subjects
        }));

        const schedulePlans: SchedulePlan[] = (schedulePlansRes.data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          createdAt: p.created_at,
          totalHorasSemanais: p.total_horas_semanais,
          duracaoSessao: p.duracao_sessao,
          subModoPomodoro: p.sub_modo_pomodoro,
          sessoesPorMateria: p.sessoes_por_materia
        }));

        let streak = 0;
        let lastStudiedDate = null;
        if (studyLog.length > 0) {
          lastStudiedDate = studyLog[0].date;
        }

        originalDispatch({
          type: 'SET_STATE',
          payload: {
            subjects,
            studyLog,
            lastStudiedDate,
            streak,
            studySequence,
            sequenceIndex: 0,
            pomodoroSettings: settings,
            templates,
            schedulePlans
          }
        });

      } catch (error: any) {
        console.error("Failed to load data from Supabase:", error);
        toast({ title: "Erro ao carregar dados", description: "Não foi possível carregar seus dados da nuvem.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, toast, supabase]);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const dispatch = async (action: any) => {
    originalDispatch(action);

    if (!user) return;

    try {
      switch (action.type) {
        case 'ADD_SUBJECT': {
          const { id, name, color, description, studyDuration, materialUrl } = action.payload;
          await supabase.from('subjects').insert({
            id,
            user_id: user.id,
            name,
            color,
            description,
            study_duration: studyDuration,
            material_url: materialUrl,
            revision_progress: 0
          });
          break;
        }
        case 'UPDATE_SUBJECT': {
          const { id, data } = action.payload;
          const updateData: any = {};
          if (data.name) updateData.name = data.name;
          if (data.color) updateData.color = data.color;
          if (data.description) updateData.description = data.description;
          if (data.studyDuration) updateData.study_duration = data.studyDuration;
          if (data.materialUrl) updateData.material_url = data.materialUrl;
          if (data.revisionProgress !== undefined) updateData.revision_progress = data.revisionProgress;

          await supabase.from('subjects').update(updateData).eq('id', id);
          break;
        }
        case 'DELETE_SUBJECT': {
          await supabase.from('subjects').delete().eq('id', action.payload);
          break;
        }
        case 'ADD_TOPIC': {
          const { id, subjectId, name } = action.payload;
          const { count } = await supabase.from('topics').select('*', { count: 'exact', head: true }).eq('subject_id', subjectId);
          const order = count || 0;

          await supabase.from('topics').insert({
            id,
            subject_id: subjectId,
            name,
            order,
            is_completed: false
          });
          break;
        }
        case 'TOGGLE_TOPIC_COMPLETED': {
          const { topicId } = action.payload;
          const { data } = await supabase.from('topics').select('is_completed').eq('id', topicId).single();
          if (data) {
            await supabase.from('topics').update({ is_completed: !data.is_completed }).eq('id', topicId);
          }
          break;
        }
        case 'DELETE_TOPIC': {
          await supabase.from('topics').delete().eq('id', action.payload.topicId);
          break;
        }
        case 'SET_REVISION_PROGRESS': {
          const { subjectId, progress } = action.payload;
          await supabase.from('subjects').update({ revision_progress: progress }).eq('id', subjectId);
          break;
        }
        case 'ADD_STUDY_LOG': {
          const log = action.payload;
          await supabase.from('study_logs').insert({
            id: log.id,
            user_id: user.id,
            subject_id: log.subjectId,
            topic_id: log.topicId,
            date: log.date,
            duration: log.duration,
            start_page: log.startPage,
            end_page: log.endPage,
            questions_total: log.questionsTotal,
            questions_correct: log.questionsCorrect,
            source: log.source,
            sequence_item_index: log.sequenceItemIndex
          });
          break;
        }
        case 'UPDATE_STUDY_LOG': {
          const log = action.payload;
          await supabase.from('study_logs').update({
            duration: log.duration,
            start_page: log.startPage,
            end_page: log.endPage,
            questions_total: log.questionsTotal,
            questions_correct: log.questionsCorrect,
          }).eq('id', log.id);
          break;
        }
        case 'DELETE_STUDY_LOG': {
          await supabase.from('study_logs').delete().eq('id', action.payload);
          break;
        }
        case 'SAVE_STUDY_SEQUENCE': {
          const sequence = action.payload;
          await supabase.from('study_sequences').insert({
            id: sequence.id,
            user_id: user.id,
            name: sequence.name,
            sequence: sequence.sequence
          });
          break;
        }
        case 'UPDATE_POMODORO_SETTINGS': {
          const settings = action.payload;
          await supabase.from('pomodoro_settings').upsert({
            user_id: user.id,
            settings
          });
          break;
        }
        case 'SAVE_TEMPLATE': {
          const { id, name } = action.payload;
          const currentSubjects = stateRef.current.subjects;
          const templateSubjects = currentSubjects.map(s => ({
            name: s.name,
            color: s.color,
            description: s.description,
            studyDuration: s.studyDuration,
            materialUrl: s.materialUrl,
            revisionProgress: 0,
            topics: s.topics.map(t => ({
              name: t.name,
              order: t.order,
              isCompleted: false
            }))
          }));

          await supabase.from('templates').insert({
            id,
            user_id: user.id,
            name,
            subjects: templateSubjects
          });
          break;
        }
        case 'LOAD_TEMPLATE': {
          const templateId = action.payload;
          const template = stateRef.current.templates.find(t => t.id === templateId);
          if (!template) return;

          await supabase.from('subjects').delete().eq('user_id', user.id);

          const newSubjects: Subject[] = [];

          for (const s of template.subjects) {
            const subjectId = crypto.randomUUID();
            const { error: subjError } = await supabase.from('subjects').insert({
              id: subjectId,
              user_id: user.id,
              name: s.name,
              color: s.color,
              description: s.description,
              study_duration: s.studyDuration,
              material_url: s.materialUrl,
              revision_progress: 0
            });

            if (subjError) throw subjError;

            const newTopics: Topic[] = [];
            for (const t of s.topics) {
              const topicId = crypto.randomUUID();
              await supabase.from('topics').insert({
                id: topicId,
                subject_id: subjectId,
                name: t.name,
                order: t.order,
                is_completed: false
              });
              newTopics.push({
                id: topicId,
                subjectId,
                name: t.name,
                order: t.order,
                isCompleted: false
              });
            }

            newSubjects.push({
              id: subjectId,
              name: s.name,
              color: s.color,
              description: s.description,
              studyDuration: s.studyDuration,
              materialUrl: s.materialUrl,
              revisionProgress: 0,
              topics: newTopics
            });
          }

          originalDispatch({ type: 'LOAD_TEMPLATE_SUCCESS', payload: { subjects: newSubjects } });
          break;
        }
        case 'DELETE_TEMPLATE': {
          await supabase.from('templates').delete().eq('id', action.payload);
          break;
        }
        case 'ADD_SCHEDULE_PLAN': {
          const plan = action.payload;
          await supabase.from('schedule_plans').insert({
            id: plan.id,
            user_id: user.id,
            name: plan.name,
            created_at: plan.createdAt,
            total_horas_semanais: plan.totalHorasSemanais,
            duracao_sessao: plan.duracaoSessao,
            sub_modo_pomodoro: plan.subModoPomodoro,
            sessoes_por_materia: plan.sessoesPorMateria
          });
          break;
        }
        case 'DELETE_SCHEDULE_PLAN': {
          await supabase.from('schedule_plans').delete().eq('id', action.payload);
          break;
        }
      }
    } catch (error) {
      console.error("Supabase sync error", error);
      toast({ title: "Erro de sincronização", description: "Falha ao salvar dados na nuvem.", variant: "destructive" });
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

    const transition = () => {
      if (prevState.status === 'focus') {
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
        setPomodoroState(prev => ({ ...prev, status: 'idle' }));
      }
    };

    transition();

  }, [pomodoroSettings, getAssociatedTopic, toast, state.studySequence, state.sequenceIndex]);

  useEffect(() => {
    if (pomodoroState.status === 'paused' || pomodoroState.status === 'idle') {
      return;
    }

    const timer = setInterval(() => {
      setPomodoroState(prev => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timer);
          handlePomodoroStateTransition(prev);
          return prev;
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
        toast({ title: "Erro", description: "Configure pelo menos uma tarefa de foco nas configurações do Pomodoro.", variant: "destructive" });
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
