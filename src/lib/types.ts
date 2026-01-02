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
  id: string;
  name: string;
  color: string;
  description?: string;
  studyDuration?: number;
  materialUrl?: string;
  revisionProgress: number;
  topics: Topic[];
  peso?: number;
  nivelConhecimento?: 'iniciante' | 'intermediario' | 'avancado';
  horasSemanais?: number;
}

export interface TopicTemplate extends Omit<Topic, 'id' | 'subjectId' | 'completionDate'> { }

export interface SubjectTemplate {
  id: string;
  name: string;
  subjects: (Omit<Subject, 'id' | 'topics'> & { topics: TopicTemplate[] })[];
}

export interface StudyLogEntry {
  id: string;
  subjectId: string;
  subjectName?: string;
  subjectColor?: string;
  topicId: string;
  topicName?: string;
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
  isCustomDuration?: boolean; // Whether this session is using a custom duration
  originalDuration?: number; // Original duration for this session (used for custom durations)
}

export interface StudySequenceItem {
  subjectId: string;
  totalTimeStudied?: number; // in minutes
}

export interface StudySequence {
  id: string;
  name: string;
  sequence: StudySequenceItem[];
  restartCount?: number;
}

export interface SchedulePlan {
  id: string;
  name: string;
  createdAt: string; // ISO String
  totalHorasSemanais: number;
  duracaoSessao: number; // in minutes
  subModoPomodoro: 'automatico' | 'manual';
  sessoesPorMateria: { [subjectId: string]: number };
}

export interface StudyData {
  subjects: Subject[];
  studyLog: StudyLogEntry[];
  lastStudiedDate: string | null;
  streak: number;
  studySequence: StudySequence | null;
  sequenceIndex: number;
  pomodoroSettings: PomodoroSettings;
  templates: SubjectTemplate[];
  schedulePlans: SchedulePlan[];
}

export interface StudyContextType {
  data: StudyData;
  dispatch: React.Dispatch<any>;
  pomodoroState: PomodoroState;
  setPomodoroState: React.Dispatch<React.SetStateAction<PomodoroState>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  startPomodoroForItem: (itemId: string, itemType: 'topic' | 'revision', navigateToPomodoro?: boolean, customDuration?: number) => void;
  pausePomodoroTimer: () => void;
  advancePomodoroCycle: () => void;
  skipToBreak: () => void;
  continueToBreak: () => void;
  resetManualRegistrationFlag: () => void;
  showTransitionDialog: boolean;
  setShowTransitionDialog: (show: boolean) => void;
}
