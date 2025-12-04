import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  serverTimestamp,
  FirestoreError
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Type definitions matching your existing Supabase schema
// Internal interface used by the Firebase service (with snake_case properties matching Firestore)
interface InternalSubject {
  id: string;
  user_id: string;
  name: string;
  color: string;
  description?: string;
  study_duration?: number;
  material_url?: string;
  revision_progress?: number;
  created_at?: string;
  updated_at?: string;
}

interface InternalTopic {
  id: string;
  subject_id: string;
  name: string;
  order: number;
  is_completed: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface InternalStudyLog {
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
  created_at?: string;
  updated_at?: string;
}

interface InternalStudySequence {
  id: string;
  user_id: string;
  name: string;
  sequence: any; // JSON field
  created_at?: string;
  updated_at?: string;
}

interface InternalPomodoroSetting {
  id?: string;
  user_id: string;
  settings: any; // JSON field
  created_at?: string;
  updated_at?: string;
}

interface InternalTemplate {
  id: string;
  user_id: string;
  name: string;
  subjects: any; // JSON field
  created_at?: string;
  updated_at?: string;
}

interface InternalSchedulePlan {
  id: string;
  user_id: string;
  name: string;
  total_horas_semanais: number;
  duracao_sessao: number;
  sub_modo_pomodoro: string;
  sessoes_por_materia: any; // JSON field
  created_at?: string;
  updated_at?: string;
}

interface InternalUserSetting {
  id?: string;
  user_id: string;
  settings: any; // JSON field containing { sequenceIndex: number, ... }
  created_at?: string;
  updated_at?: string;
}

// Export the external interfaces that match the app's expected camelCase format
export interface Subject {
  id: string;
  user_id: string;
  name: string;
  color: string;
  description?: string;
  studyDuration?: number;
  materialUrl?: string;
  revisionProgress?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  order: number;
  isCompleted: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface StudySequence {
  id: string;
  user_id: string;
  name: string;
  sequence: any; // JSON field
  created_at?: string;
  updated_at?: string;
}

export interface PomodoroSetting {
  id?: string;
  user_id: string;
  settings: any; // JSON field
  created_at?: string;
  updated_at?: string;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  subjects: any; // JSON field
  created_at?: string;
  updated_at?: string;
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

export interface UserSetting {
  id?: string;
  user_id: string;
  settings: any; // JSON field containing { sequenceIndex: number, ... }
  created_at?: string;
  updated_at?: string;
}

// Helper functions to convert between Firestore document and object with proper field mapping
const docToObj = (doc: any) => {
  const data = doc.data();
  return { id: doc.id, ...data };
};

// Function to convert snake_case to camelCase for objects from Firestore
const snakeToCamel = (obj: any): any => {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date || obj instanceof File) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    (acc as any)[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {} as any);
};

// Function to convert camelCase to snake_case for objects to Firestore
const camelToSnake = (obj: any): any => {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date || obj instanceof File) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    (acc as any)[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {} as any);
};

// Firebase operations for study management
export const studyService = {
  // Subjects operations
  getSubjects: async (userId: string): Promise<Subject[]> => {
    try {
      const q = query(
        collection(db, 'subjects'),
        where('user_id', '==', userId),
        orderBy('name')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => snakeToCamel({ id: doc.id, ...doc.data() })) as Subject[];
    } catch (error) {
      console.error('Error getting subjects:', error);
      throw error;
    }
  },

  addSubject: async (subjectData: Omit<Subject, 'id' | 'created_at' | 'updated_at'>): Promise<Subject> => {
    try {
      const docRef = await addDoc(collection(db, 'subjects'), {
        ...camelToSnake(subjectData),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      const docSnap = await getDoc(docRef);
      return snakeToCamel({ id: docSnap.id, ...docSnap.data() }) as Subject;
    } catch (error) {
      console.error('Error adding subject:', error);
      throw error;
    }
  },

  updateSubject: async (id: string, updates: Partial<Omit<Subject, 'id' | 'user_id' | 'created_at'>>) => {
    try {
      const subjectDoc = doc(db, 'subjects', id);
      await updateDoc(subjectDoc, {
        ...camelToSnake(updates),
        updated_at: serverTimestamp()
      });
      const docSnap = await getDoc(subjectDoc);
      return snakeToCamel({ id: docSnap.id, ...docSnap.data() }) as Subject;
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  },

  deleteSubject: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'subjects', id));
      return true;
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  },

  // Topics operations (stored as subcollection of subjects)
  getTopics: async (subjectId: string): Promise<Topic[]> => {
    try {
      const q = query(
        collection(db, `subjects/${subjectId}/topics`),
        orderBy('order')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => snakeToCamel({ id: doc.id, ...doc.data() })) as Topic[];
    } catch (error) {
      console.error('Error getting topics:', error);
      throw error;
    }
  },

  addTopic: async (topicData: Omit<Topic, 'id' | 'created_at' | 'updated_at'>): Promise<Topic> => {
    try {
      const { subjectId, ...topicWithoutSubjectId } = topicData;
      const docRef = await addDoc(collection(db, `subjects/${subjectId}/topics`), {
        ...camelToSnake(topicWithoutSubjectId),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      const docSnap = await getDoc(docRef);
      return snakeToCamel({ id: docSnap.id, subject_id: subjectId, ...docSnap.data() }) as Topic;
    } catch (error) {
      console.error('Error adding topic:', error);
      throw error;
    }
  },

  updateTopic: async (id: string, updates: Partial<Omit<Topic, 'id' | 'created_at'>>, subjectId: string) => {
    try {
      const topicDoc = doc(db, `subjects/${subjectId}/topics`, id);
      await updateDoc(topicDoc, {
        ...camelToSnake(updates),
        updated_at: serverTimestamp()
      });
      const docSnap = await getDoc(topicDoc);
      return snakeToCamel({ id: docSnap.id, subject_id: subjectId, ...docSnap.data() }) as Topic;
    } catch (error) {
      console.error('Error updating topic:', error);
      throw error;
    }
  },

  deleteTopic: async (id: string, subjectId: string) => {
    try {
      await deleteDoc(doc(db, `subjects/${subjectId}/topics`, id));
      return true;
    } catch (error) {
      console.error('Error deleting topic:', error);
      throw error;
    }
  },

  // Study logs operations
  getStudyLogs: async (userId: string): Promise<StudyLog[]> => {
    try {
      const q = query(
        collection(db, 'study_logs'),
        where('user_id', '==', userId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => snakeToCamel({ id: doc.id, ...doc.data() })) as StudyLog[];
    } catch (error) {
      console.error('Error getting study logs:', error);
      throw error;
    }
  },

  addStudyLog: async (logData: Omit<StudyLog, 'id' | 'created_at' | 'updated_at'>): Promise<StudyLog> => {
    try {
      const docRef = await addDoc(collection(db, 'study_logs'), {
        ...camelToSnake(logData),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      const docSnap = await getDoc(docRef);
      return snakeToCamel({ id: docSnap.id, ...docSnap.data() }) as StudyLog;
    } catch (error) {
      console.error('Error adding study log:', error);
      throw error;
    }
  },

  updateStudyLog: async (id: string, updates: Partial<Omit<StudyLog, 'id' | 'user_id' | 'created_at'>>) => {
    try {
      const logDoc = doc(db, 'study_logs', id);
      await updateDoc(logDoc, {
        ...camelToSnake(updates),
        updated_at: serverTimestamp()
      });
      const docSnap = await getDoc(logDoc);
      return snakeToCamel({ id: docSnap.id, ...docSnap.data() }) as StudyLog;
    } catch (error) {
      console.error('Error updating study log:', error);
      throw error;
    }
  },

  deleteStudyLog: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'study_logs', id));
      return true;
    } catch (error) {
      console.error('Error deleting study log:', error);
      throw error;
    }
  },

  // Study Sequence
  getStudySequence: async (userId: string): Promise<StudySequence | null> => {
    try {
      const q = query(
        collection(db, 'study_sequences'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return snakeToCamel({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() }) as StudySequence;
    } catch (error) {
      console.error('Error getting study sequence:', error);
      throw error;
    }
  },

  saveStudySequence: async (sequenceData: Omit<StudySequence, 'created_at' | 'updated_at'>): Promise<StudySequence> => {
    try {
      let docRef;
      if (sequenceData.id) {
        // Update existing document
        docRef = doc(db, 'study_sequences', sequenceData.id);
        await updateDoc(docRef, {
          ...camelToSnake(sequenceData),
          updated_at: serverTimestamp()
        });
      } else {
        // Create new document
        docRef = await addDoc(collection(db, 'study_sequences'), {
          ...camelToSnake(sequenceData),
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
      }
      const docSnap = await getDoc(docRef);
      return snakeToCamel({ id: docSnap.id, ...docSnap.data() }) as StudySequence;
    } catch (error) {
      console.error('Error saving study sequence:', error);
      throw error;
    }
  },

  // Pomodoro Settings
  getPomodoroSettings: async (userId: string): Promise<PomodoroSetting | null> => {
    try {
      const q = query(
        collection(db, 'pomodoro_settings'),
        where('user_id', '==', userId),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return snakeToCamel({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() }) as PomodoroSetting;
    } catch (error) {
      console.error('Error getting pomodoro settings:', error);
      throw error;
    }
  },

  savePomodoroSettings: async (settingsData: Omit<PomodoroSetting, 'created_at' | 'updated_at'>): Promise<PomodoroSetting> => {
    try {
      let docRef;
      if (settingsData.id) {
        // Update existing document
        docRef = doc(db, 'pomodoro_settings', settingsData.id);
        await updateDoc(docRef, {
          settings: settingsData.settings
        });
      } else {
        // Create new document
        docRef = await addDoc(collection(db, 'pomodoro_settings'), {
          ...camelToSnake(settingsData),
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
      }
      const docSnap = await getDoc(docRef);
      return snakeToCamel({ id: docSnap.id, ...docSnap.data() }) as PomodoroSetting;
    } catch (error) {
      console.error('Error saving pomodoro settings:', error);
      throw error;
    }
  },

  // Templates
  getTemplates: async (userId: string): Promise<Template[]> => {
    try {
      const q = query(
        collection(db, 'templates'),
        where('user_id', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => snakeToCamel({ id: doc.id, ...doc.data() })) as Template[];
    } catch (error) {
      console.error('Error getting templates:', error);
      throw error;
    }
  },

  addTemplate: async (templateData: Omit<Template, 'id' | 'created_at' | 'updated_at'>): Promise<Template> => {
    try {
      const docRef = await addDoc(collection(db, 'templates'), {
        ...camelToSnake(templateData),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      const docSnap = await getDoc(docRef);
      return snakeToCamel({ id: docSnap.id, ...docSnap.data() }) as Template;
    } catch (error) {
      console.error('Error adding template:', error);
      throw error;
    }
  },

  deleteTemplate: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'templates', id));
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  // Schedule Plans
  getSchedulePlans: async (userId: string): Promise<SchedulePlan[]> => {
    try {
      const q = query(
        collection(db, 'schedule_plans'),
        where('user_id', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => snakeToCamel({ id: doc.id, ...doc.data() })) as SchedulePlan[];
    } catch (error) {
      console.error('Error getting schedule plans:', error);
      throw error;
    }
  },

  addSchedulePlan: async (planData: Omit<SchedulePlan, 'id' | 'created_at' | 'updated_at'>): Promise<SchedulePlan> => {
    try {
      const docRef = await addDoc(collection(db, 'schedule_plans'), {
        ...camelToSnake(planData),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      const docSnap = await getDoc(docRef);
      return snakeToCamel({ id: docSnap.id, ...docSnap.data() }) as SchedulePlan;
    } catch (error) {
      console.error('Error adding schedule plan:', error);
      throw error;
    }
  },

  deleteSchedulePlan: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'schedule_plans', id));
      return true;
    } catch (error) {
      console.error('Error deleting schedule plan:', error);
      throw error;
    }
  },

  // User Settings (for sequence index etc)
  getUserSettings: async (userId: string): Promise<UserSetting | null> => {
    try {
      const q = query(
        collection(db, 'user_settings'),
        where('user_id', '==', userId),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return snakeToCamel({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() }) as UserSetting;
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  },

  saveUserSettings: async (settingsData: Omit<UserSetting, 'created_at' | 'updated_at'>): Promise<UserSetting> => {
    try {
      let docRef;
      if (settingsData.id) {
        // Update existing document
        docRef = doc(db, 'user_settings', settingsData.id);
        await updateDoc(docRef, {
          settings: settingsData.settings
        });
      } else {
        // Create new document
        docRef = await addDoc(collection(db, 'user_settings'), {
          ...camelToSnake(settingsData),
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
      }
      const docSnap = await getDoc(docRef);
      return snakeToCamel({ id: docSnap.id, ...docSnap.data() }) as UserSetting;
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  },

  // Helper to get all user data at once (for initial load)
  getAllUserData: async (userId: string) => {
    try {
      const [
        subjects,
        studyLogs,
        studySequence,
        pomodoroSettings,
        templates,
        schedulePlans,
        userSettings
      ] = await Promise.all([
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

      return {
        subjects: subjectsWithTopics,
        studyLogs,
        studySequence,
        pomodoroSettings,
        templates,
        schedulePlans,
        userSettings
      };
    } catch (error) {
      console.error('Error getting all user data:', error);
      throw error;
    }
  }
};