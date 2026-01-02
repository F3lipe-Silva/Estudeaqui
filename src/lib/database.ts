import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentData,
  Timestamp
} from 'firebase/firestore';

export interface User {
  $id?: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  level?: string;
  preferences?: string;
}

export interface Course {
  $id?: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  level: string;
  instructor?: string;
  instructorId?: string;
  tags?: string;
  requirements?: string;
  objectives?: string;
}

export interface Lesson {
  $id?: string;
  title: string;
  description: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: string;
  courseId: string;
  order: number;
  type?: string;
  free?: boolean;
  resources?: string;
  transcript?: string;
}

export interface Progress {
  $id?: string;
  userId: string;
  courseId: string;
  lessonId?: string;
  completed?: boolean;
  watchTime?: number;
  totalTime?: number;
  percentage?: number;
  lastPosition?: string;
  notes?: string;
  status?: string;
}

export interface Enrollment {
  $id?: string;
  userId: string;
  courseId: string;
  status?: string;
  progress?: number;
  enrolledAt?: string;
  completedAt?: string;
  certificateId?: string;
  finalGrade?: number;
}

export interface StudySubject {
  $id?: string;
  userId: string;
  id: string;
  name: string;
  color: string;
  description?: string;
  materialUrl?: string;
  topics?: string;
}

export interface StudyLog {
  $id?: string;
  userId: string;
  id: string;
  subjectId: string;
  date: string;
  duration: number;
  notes?: string;
}

const mapDoc = (docSnap: DocumentData): any => {
  const data = docSnap.data();
  return {
    ...data,
    $id: docSnap.id,
    $createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    $updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
  };
};

// Database service functions
export class DatabaseService {
  static async createUser(userData: Omit<User, '$id'>) {
    try {
      const now = new Date();
      // Using addDoc to generate a unique ID, matching 'unique()' behavior
      const docRef = await addDoc(collection(db, 'users'), {
        ...userData,
        createdAt: now,
        updatedAt: now
      });
      const newDoc = await getDoc(docRef);
      return mapDoc(newDoc);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getUser(userId: string) {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return mapDoc(docSnap);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  static async updateUser(userId: string, userData: Partial<User>) {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        ...userData,
        updatedAt: new Date()
      });
      const updatedDoc = await getDoc(docRef);
      return mapDoc(updatedDoc);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async getCourses(limitCount = 20, offset = 0) {
    try {
      // Offset is not directly supported in Firestore in the same way. 
      // For now, we ignore offset or implement simple pagination later if needed.
      const q = query(
        collection(db, 'courses'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return { documents: querySnapshot.docs.map(mapDoc), total: querySnapshot.size };
    } catch (error) {
      console.error('Error getting courses:', error);
      throw error;
    }
  }

  static async getCourse(courseId: string) {
    try {
      const docRef = doc(db, 'courses', courseId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return mapDoc(docSnap);
    } catch (error) {
      console.error('Error getting course:', error);
      return null;
    }
  }

  static async createCourse(courseData: Omit<Course, '$id'>) {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'courses'), {
        ...courseData,
        createdAt: now,
        updatedAt: now
      });
      const newDoc = await getDoc(docRef);
      return mapDoc(newDoc);
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  static async getLessonsByCourse(courseId: string) {
    try {
      const q = query(
        collection(db, 'lessons'),
        where('courseId', '==', courseId),
        orderBy('order', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return { documents: querySnapshot.docs.map(mapDoc), total: querySnapshot.size };
    } catch (error) {
      console.error('Error getting lessons:', error);
      throw error;
    }
  }

  static async createLesson(lessonData: Omit<Lesson, '$id'>) {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'lessons'), {
        ...lessonData,
        createdAt: now,
        updatedAt: now
      });
      const newDoc = await getDoc(docRef);
      return mapDoc(newDoc);
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  }

  static async getUserProgress(userId: string, courseId?: string) {
    try {
      const constraints = [where('userId', '==', userId)];
      if (courseId) {
        constraints.push(where('courseId', '==', courseId));
      }
      
      const q = query(collection(db, 'progress'), ...constraints);
      const querySnapshot = await getDocs(q);
      return { documents: querySnapshot.docs.map(mapDoc), total: querySnapshot.size };
    } catch (error) {
      console.error('Error getting progress:', error);
      throw error;
    }
  }

  static async updateProgress(progressId: string, progressData: Partial<Progress>) {
    try {
      const docRef = doc(db, 'progress', progressId);
      await updateDoc(docRef, {
        ...progressData,
        updatedAt: new Date()
      });
      const updatedDoc = await getDoc(docRef);
      return mapDoc(updatedDoc);
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  static async enrollUser(userId: string, courseId: string) {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'enrollments'), {
        userId,
        courseId,
        status: 'active',
        progress: 0,
        enrolledAt: now.toISOString(),
        createdAt: now,
        updatedAt: now
      });
      const newDoc = await getDoc(docRef);
      return mapDoc(newDoc);
    } catch (error) {
      console.error('Error enrolling user:', error);
      throw error;
    }
  }

  static async getUserEnrollments(userId: string) {
    try {
      const q = query(collection(db, 'enrollments'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return { documents: querySnapshot.docs.map(mapDoc), total: querySnapshot.size };
    } catch (error) {
      console.error('Error getting enrollments:', error);
      throw error;
    }
  }

  static async getStudySubjects(userId: string) {
    try {
      const q = query(collection(db, 'study_subjects'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return { documents: querySnapshot.docs.map(mapDoc), total: querySnapshot.size };
    } catch (error) {
      console.error('Error getting study subjects:', error);
      throw error;
    }
  }

  static async createStudySubject(subjectData: Omit<StudySubject, '$id'>) {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'study_subjects'), {
        ...subjectData,
        createdAt: now,
        updatedAt: now
      });
      const newDoc = await getDoc(docRef);
      return mapDoc(newDoc);
    } catch (error) {
      console.error('Error creating study subject:', error);
      throw error;
    }
  }

  static async createStudyLog(logData: Omit<StudyLog, '$id'>) {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'study_logs'), {
        ...logData,
        createdAt: now,
        updatedAt: now
      });
      const newDoc = await getDoc(docRef);
      return mapDoc(newDoc);
    } catch (error) {
      console.error('Error creating study log:', error);
      throw error;
    }
  }

  static async getStudyLogs(userId: string, limitCount = 50) {
    try {
      const q = query(
        collection(db, 'study_logs'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return { documents: querySnapshot.docs.map(mapDoc), total: querySnapshot.size };
    } catch (error) {
      console.error('Error getting study logs:', error);
      throw error;
    }
  }
}

export default DatabaseService;
