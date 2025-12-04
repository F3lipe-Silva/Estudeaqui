// src/models/StudyModels.ts
import { ObjectId } from 'mongodb';

// Modelo para Tópico
export interface Topic {
  _id?: ObjectId;
  id?: string;
  subjectId: string;
  name: string;
  order: number;
  description?: string;
  isCompleted: boolean;
  completionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Modelo para Matéria
export interface Subject {
  _id?: ObjectId;
  id?: string;
  userId: string; // Referência ao usuário dono da matéria
  name: string;
  color: string;
  description?: string;
  studyDuration?: number; // Duração de estudo em minutos
  materialUrl?: string;
  revisionProgress: number; // Progresso na revisão (0-100)
  peso?: number; // Peso da matéria (0-10)
  nivelConhecimento?: 'iniciante' | 'intermediario' | 'avancado';
  horasSemanais?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Modelo para Tópico de Template
export interface TopicTemplate extends Omit<Topic, '_id' | 'id' | 'subjectId' | 'completionDate' | 'createdAt' | 'updatedAt'> { }

// Modelo para Template de Matéria
export interface SubjectTemplate {
  _id?: ObjectId;
  id?: string;
  userId: string; // Referência ao usuário dono do template
  name: string;
  subjects: (Omit<Subject, '_id' | 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'topics'> & { topics: TopicTemplate[] })[];
  createdAt: Date;
  updatedAt: Date;
}

// Modelo para Registro de Estudo
export interface StudyLogEntry {
  _id?: ObjectId;
  id?: string;
  userId: string; // Referência ao usuário que fez o registro
  subjectId: string; // Referência à matéria
  topicId?: string; // Referência ao tópico (opcional)
  date: Date; // Data do registro
  duration: number; // Duração em minutos
  startPage: number;
  endPage: number;
  questionsTotal: number;
  questionsCorrect: number;
  source?: string; // Origem do estudo ('A', 'B', 'C', 'D', 'site-questoes', 'pomodoro', 'manual')
  sequenceItemIndex?: number; // Para vincular o registro a um item de sequência específico
  createdAt: Date;
  updatedAt: Date;
}

// Modelo para Tarefa Pomodoro
export interface PomodoroSubTask {
  id: string;
  name: string;
  duration: number; // em segundos
}

// Modelo para Configurações Pomodoro
export interface PomodoroSettings {
  _id?: ObjectId;
  userId: string; // Referência ao usuário dono das configurações
  tasks: PomodoroSubTask[];
  shortBreakDuration: number; // segundos
  longBreakDuration: number; // segundos
  cyclesUntilLongBreak: number;
  createdAt: Date;
  updatedAt: Date;
}

// Modelo para Item de Sequência de Estudo
export interface StudySequenceItem {
  subjectId: string;
  totalTimeStudied?: number; // em minutos
}

// Modelo para Sequência de Estudo
export interface StudySequence {
  _id?: ObjectId;
  id?: string;
  userId: string; // Referência ao usuário dono da sequência
  name: string;
  sequence: StudySequenceItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Modelo para Plano de Agendamento
export interface SchedulePlan {
  _id?: ObjectId;
  id?: string;
  userId: string; // Referência ao usuário dono do plano
  name: string;
  totalHorasSemanais: number;
  duracaoSessao: number; // em minutos
  subModoPomodoro: 'automatico' | 'manual';
  sessoesPorMateria: { [subjectId: string]: number };
  createdAt: Date;
  updatedAt: Date;
}

// Modelo para Configurações do Usuário
export interface UserSettings {
  _id?: ObjectId;
  userId: string; // Referência ao usuário dono das configurações
  settings: {
    sequenceIndex?: number;
    activeTab?: string;
    [key: string]: any; // Permitir outras configurações personalizadas
  };
  createdAt: Date;
  updatedAt: Date;
}