
import { supabase } from '../../constants/Supabase';

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
  id?: string;
  user_id: string;
  settings: any; // JSONB field
  created_at?: string;
  updated_at?: string;
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
  id?: string;
  user_id: string;
  settings: any; // JSONB field containing { sequenceIndex: number, ... }
  created_at?: string;
  updated_at?: string;
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

  addSubject: async (subjectData: Omit<Subject, 'created_at' | 'updated_at'>) => {
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

  addTopic: async (topicData: Omit<Topic, 'created_at' | 'updated_at'>) => {
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

  addStudyLog: async (logData: Omit<StudyLog, 'created_at' | 'updated_at'>) => {
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

  // Study Sequence
  getStudySequence: async (userId: string) => {
    const { data, error } = await supabase
        .from('study_sequences')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows found"
    return data as StudySequence | null;
  },

  saveStudySequence: async (sequenceData: Omit<StudySequence, 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
        .from('study_sequences')
        .upsert(sequenceData)
        .select()
        .single();

    if (error) throw error;
    return data as StudySequence;
  },

  // Pomodoro Settings
  getPomodoroSettings: async (userId: string) => {
    const { data, error } = await supabase
        .from('pomodoro_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as PomodoroSetting | null;
  },

  savePomodoroSettings: async (settingsData: Omit<PomodoroSetting, 'created_at' | 'updated_at'>) => {
     const existing = await studyService.getPomodoroSettings(settingsData.user_id);

     if (existing) {
         const { data, error } = await supabase
             .from('pomodoro_settings')
             .update({ settings: settingsData.settings })
             .eq('id', existing.id)
             .select()
             .single();
         if (error) throw error;
         return data as PomodoroSetting;
     } else {
         const { data, error } = await supabase
             .from('pomodoro_settings')
             .insert(settingsData)
             .select()
             .single();
         if (error) throw error;
         return data as PomodoroSetting;
     }
  },

  // Templates
  getTemplates: async (userId: string) => {
      const { data, error } = await supabase
          .from('templates')
          .select('*')
          .eq('user_id', userId);

      if (error) throw error;
      return data as Template[];
  },

  addTemplate: async (templateData: Omit<Template, 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
          .from('templates')
          .insert([templateData])
          .select()
          .single();

      if (error) throw error;
      return data as Template;
  },

  deleteTemplate: async (id: string) => {
      const { error } = await supabase
          .from('templates')
          .delete()
          .eq('id', id);

      if (error) throw error;
      return true;
  },

  // Schedule Plans
  getSchedulePlans: async (userId: string) => {
      const { data, error } = await supabase
          .from('schedule_plans')
          .select('*')
          .eq('user_id', userId);

      if (error) throw error;
      return data as SchedulePlan[];
  },

  addSchedulePlan: async (planData: Omit<SchedulePlan, 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
          .from('schedule_plans')
          .insert([planData])
          .select()
          .single();

      if (error) throw error;
      return data as SchedulePlan;
  },

  deleteSchedulePlan: async (id: string) => {
      const { error } = await supabase
          .from('schedule_plans')
          .delete()
          .eq('id', id);

      if (error) throw error;
      return true;
  },

  // User Settings (for sequence index etc)
  getUserSettings: async (userId: string) => {
      const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserSetting | null;
  },

  saveUserSettings: async (settingsData: Omit<UserSetting, 'created_at' | 'updated_at'>) => {
     const existing = await studyService.getUserSettings(settingsData.user_id);

     if (existing) {
         const { data, error } = await supabase
             .from('user_settings')
             .update({ settings: settingsData.settings })
             .eq('id', existing.id)
             .select()
             .single();
         if (error) throw error;
         return data as UserSetting;
     } else {
         const { data, error } = await supabase
             .from('user_settings')
             .insert(settingsData)
             .select()
             .single();
         if (error) throw error;
         return data as UserSetting;
     }
  },

  // Helper to get all user data at once (for initial load)
  getAllUserData: async (userId: string) => {
      const [subjects, studyLogs, studySequence, pomodoroSettings, templates, schedulePlans, userSettings] = await Promise.all([
          studyService.getSubjects(userId),
          studyService.getStudyLogs(userId),
          studyService.getStudySequence(userId),
          studyService.getPomodoroSettings(userId),
          studyService.getTemplates(userId),
          studyService.getSchedulePlans(userId),
          studyService.getUserSettings(userId)
      ]);

      // Fetch topics for all subjects
      const subjectsWithTopics = await Promise.all(subjects.map(async (subject) => {
          const topics = await studyService.getTopics(subject.id);
          return { ...subject, topics };
      }));

      // Transform Schedule Plans to match frontend type
      // The Supabase type (SchedulePlan) has explicit columns: total_horas_semanais, etc.
      // The Frontend type expects: totalHorasSemanais (camelCase)
      // We need to map it here.
      const mappedSchedulePlans = schedulePlans.map((p: any) => ({
          id: p.id,
          name: p.name,
          createdAt: p.created_at,
          totalHorasSemanais: p.total_horas_semanais,
          duracaoSessao: p.duracao_sessao,
          subModoPomodoro: p.sub_modo_pomodoro,
          sessoesPorMateria: p.sessoes_por_materia
      }));

      return {
          subjects: subjectsWithTopics,
          studyLogs,
          studySequence,
          pomodoroSettings,
          templates,
          schedulePlans: mappedSchedulePlans,
          userSettings
      };
  }
};
