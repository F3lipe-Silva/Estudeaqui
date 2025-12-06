import { z } from 'zod';

// Subject Schema
export const subjectSchema = z.object({
  name: z.string().min(1, 'Nome da matéria é obrigatório'),
  color: z.string().min(1, 'Cor é obrigatória'),
  description: z.string().optional(),
  studyDuration: z.number().min(1, 'Duração deve ser maior que 0'),
  materialUrl: z.string().url().optional().or(z.literal('')),
  revisionProgress: z.number().min(0).max(100),
  topics: z.array(z.object({
    name: z.string().min(1, 'Nome do tópico é obrigatório'),
    order: z.number().min(0),
    description: z.string().optional(),
    isCompleted: z.boolean().default(false),
  })).default([]),
});

// Topic Schema
export const topicSchema = z.object({
  name: z.string().min(1, 'Nome do tópico é obrigatório'),
  description: z.string().optional(),
  order: z.number().min(0),
  isCompleted: z.boolean().default(false),
});

// Study Log Schema
export const studyLogSchema = z.object({
  subjectId: z.string().min(1, 'Selecione uma matéria'),
  topicId: z.string().min(1, 'Selecione um tópico'),
  duration: z.number().min(1, 'Duração deve ser maior que 0'),
  startPage: z.number().min(0),
  endPage: z.number().min(0),
  questionsTotal: z.number().min(0),
  questionsCorrect: z.number().min(0),
  source: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.questionsCorrect <= data.questionsTotal, {
  message: 'Questões corretas não podem ser maior que o total',
  path: ['questionsCorrect'],
}).refine((data) => data.endPage >= data.startPage, {
  message: 'Página final deve ser maior ou igual à inicial',
  path: ['endPage'],
});

// Pomodoro Settings Schema
export const pomodoroSettingsSchema = z.object({
  focusDuration: z.number().min(60, 'Duração mínima é 1 minuto'),
  shortBreakDuration: z.number().min(60, 'Duração mínima é 1 minuto'),
  longBreakDuration: z.number().min(60, 'Duração mínima é 1 minuto'),
  cyclesUntilLongBreak: z.number().min(1, 'Mínimo 1 ciclo'),
  autoStartBreaks: z.boolean().default(false),
  autoStartPomodoros: z.boolean().default(false),
  longBreakInterval: z.number().min(1, 'Mínimo 1').default(4),
});

// Study Sequence Schema
export const studySequenceSchema = z.object({
  name: z.string().min(1, 'Nome da sequência é obrigatório'),
  description: z.string().optional(),
  sequence: z.array(z.object({
    subjectId: z.string().min(1, 'ID da matéria é obrigatório'),
    duration: z.number().min(1, 'Duração deve ser maior que 0'),
    order: z.number().min(0),
  })).min(1, 'Adicione pelo menos uma matéria à sequência'),
});

// Template Schema
export const templateSchema = z.object({
  name: z.string().min(1, 'Nome do template é obrigatório'),
  description: z.string().optional(),
  subjects: z.array(subjectSchema.omit({ id: true, topics: z.array(z.object({
    id: z.string(),
    subjectId: z.string(),
    name: z.string(),
    order: z.number(),
    description: z.string().optional(),
    isCompleted: z.boolean(),
  })) })).min(1, 'Adicione pelo menos uma matéria'),
});

// User Settings Schema
export const userSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  notifications: z.object({
    studyReminders: z.boolean(),
    pomodoroNotifications: z.boolean(),
    dailyGoal: z.boolean(),
  }),
  pomodoro: pomodoroSettingsSchema,
  study: z.object({
    defaultSessionDuration: z.number().min(1),
    dailyGoalMinutes: z.number().min(0),
    weeklyGoalHours: z.number().min(0),
  }),
});

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

// Register Schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

// Export types
export type SubjectFormData = z.infer<typeof subjectSchema>;
export type TopicFormData = z.infer<typeof topicSchema>;
export type StudyLogFormData = z.infer<typeof studyLogSchema>;
export type PomodoroSettingsFormData = z.infer<typeof pomodoroSettingsSchema>;
export type StudySequenceFormData = z.infer<typeof studySequenceSchema>;
export type TemplateFormData = z.infer<typeof templateSchema>;
export type UserSettingsFormData = z.infer<typeof userSettingsSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;