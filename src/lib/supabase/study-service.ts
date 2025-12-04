import { supabase } from '@/lib/supabase/client';

// Type definitions matching your existing Supabase schema
export interface Subject {
  id: string;
  user_id: string;
  name: string;
  color: string;
  description?: string;
  study_duration?: number;
  material_url?: string;
  revision_progress?: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  order: number;
  is_completed: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface StudyLog {
  id: string;
  user_id: string;
  subject_id: string;
  topic_id?: string;
  date: string; // timestamp with time zone
  duration: number; // in minutes
  start_page?: number;
  end_page?: number;
  questions_total?: number;
  questions_correct?: number;
  source?: string;
  sequence_item_index?: number;
  created_at: string;
  updated_at: string;
}

export interface StudySequence {
  id: string;
  user_id: string;
  name: string;
  sequence: any; // JSONB field
  created_at: string;
  updated_at: string;
}

export interface PomodoroSetting {
  user_id: string;
  settings: any; // JSONB field
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  subjects: any; // JSONB field
  created_at: string;
  updated_at: string;
}

export interface SchedulePlan {
  id: string;
  user_id: string;
  name: string;
  total_horas_semanais: number;
  duracao_sessao: number;
  sub_modo_pomodoro: string;
  sessoes_por_materia: any; // JSONB field
  created_at: string;
  updated_at: string;
}

export interface UserSetting {
  user_id: string;
  settings: any; // JSONB field
  created_at: string;
  updated_at: string;
}

// Supabase operations for study management
export const studyService = {
  // Subjects operations
  getSubjects: async (userId: string) => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    return data as Subject[];
  },

  addSubject: async (subjectData: Omit<Subject, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('subjects')
      .insert([subjectData])
      .select()
      .single();

    if (error) throw error;
    return data as Subject;
  },

  updateSubject: async (id: string, updates: Partial<Omit<Subject, 'id' | 'user_id' | 'created_at'>>) => {
    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Subject;
  },

  deleteSubject: async (id: string) => {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Topics operations
  getTopics: async (subjectId: string) => {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', subjectId)
      .order('order');

    if (error) throw error;
    return data as Topic[];
  },

  addTopic: async (topicData: Omit<Topic, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('topics')
      .insert([topicData])
      .select()
      .single();

    if (error) throw error;
    return data as Topic;
  },

  updateTopic: async (id: string, updates: Partial<Omit<Topic, 'id' | 'created_at'>>) => {
    const { data, error } = await supabase
      .from('topics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Topic;
  },

  deleteTopic: async (id: string) => {
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Study logs operations
  getStudyLogs: async (userId: string) => {
    const { data, error } = await supabase
      .from('study_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as StudyLog[];
  },

  addStudyLog: async (logData: Omit<StudyLog, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('study_logs')
      .insert([logData])
      .select()
      .single();

    if (error) throw error;
    return data as StudyLog;
  },

  updateStudyLog: async (id: string, updates: Partial<Omit<StudyLog, 'id' | 'user_id' | 'created_at'>>) => {
    const { data, error } = await supabase
      .from('study_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as StudyLog;
  },

  deleteStudyLog: async (id: string) => {
    const { error } = await supabase
      .from('study_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Get study logs for a specific subject
  getStudyLogsForSubject: async (subjectId: string) => {
    const { data, error } = await supabase
      .from('study_logs')
      .select('*')
      .eq('subject_id', subjectId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as StudyLog[];
  },

  // Get study logs for a specific topic
  getStudyLogsForTopic: async (topicId: string) => {
    const { data, error } = await supabase
      .from('study_logs')
      .select('*')
      .eq('topic_id', topicId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as StudyLog[];
  },
};