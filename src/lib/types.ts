import type React from 'react';

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  order: number;
  description?: string;
  isCompleted: boolean;
  completionDate?: string; // ISO String
}

export interface Subject {
  id:string;
  name: string;
  color: string;
  topics: Topic[];
  description?: string;
  revisionProgress: number;
  studyDuration?: number; // Target study duration in minutes
  materialUrl?: string; // URL for study materials
}

export interface StudyLogEntry {
  id: string;
  subjectId: string;
  topicId: string;
  date: string; // ISO String
  duration: number; // minutes
  startPage: number;
  endPage: number;
  questionsTotal: number;
  questionsCorrect: number;
  source?: string; // e.g., 'A', 'B', 'C', 'D', 'site-questoes', 'pomodoro', 'manual'
  sequenceItemIndex?: number; // To link log entry to a specific sequence item
}

export interface PomodoroSubTask {
  id: string;
  name: string;
  duration: number; // in seconds
}

export interface PomodoroSettings {
  tasks: PomodoroSubTask[];
  shortBreakDuration: number; // seconds
  longBreakDuration: number; // seconds
  cyclesUntilLongBreak: number;
  alarmSound?: string; // URL or identifier for the alarm sound
}

export type PomodoroStatus = 'focus' | 'short_break' | 'long_break' | 'paused' | 'idle';

export interface PomodoroState {
  status: PomodoroStatus;
  timeRemaining: number;
  currentCycle: number;
  pomodorosCompletedToday: number;
  associatedItemId?: string; // Can be Topic or Revision
  associatedItemType?: 'topic' | 'revision';
  key: number;
  previousStatus?: PomodoroStatus; // To know what state to return to from pause
  pausedTime?: number; // To calculate time elapsed during pause
  currentTaskIndex?: number;
}

export interface StudySequenceItem {
  id: string; // Adicionado para permitir matérias duplicadas na sequência
  subjectId: string;
  totalTimeStudied?: number; // in minutes
}

export interface StudySequence {
  id: string;
  name: string;
  sequence: StudySequenceItem[];
}

export interface StudyData {
  subjects: Subject[];
  studyLog: StudyLogEntry[];
  lastStudiedDate: string | null;
  streak: number;
  studySequence: StudySequence | null; // O planejamento atualmente ativo
  savedStudySequences: StudySequence[]; // Coleção de planejamentos salvos
  sequenceIndex: number;
  pomodoroSettings: PomodoroSettings;
}

export interface StudyContextType {
  data: StudyData;
  dispatch: React.Dispatch<any>;
  pomodoroState: PomodoroState;
  setPomodoroState: React.Dispatch<React.SetStateAction<PomodoroState>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  startPomodoroForItem: (itemId: string, itemType: 'topic' | 'revision') => void;
  advancePomodoroState: () => void;
}
