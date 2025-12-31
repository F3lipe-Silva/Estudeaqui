import { databases } from './appwrite';
import { APPWRITE_CONFIG } from './appwrite';

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

// Database service functions
export class DatabaseService {
  static async createUser(userData: Omit<User, '$id'>) {
    try {
      const response = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        'unique()',
        userData
      );
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getUser(userId: string) {
    try {
      const response = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        userId
      );
      return response;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  static async updateUser(userId: string, userData: Partial<User>) {
    try {
      const response = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        userId,
        userData
      );
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async getCourses(limit = 20, offset = 0) {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.courses,
        [
          `limit(${limit})`,
          `offset(${offset})`,
          'orderDesc("$createdAt")'
        ]
      );
      return response;
    } catch (error) {
      console.error('Error getting courses:', error);
      throw error;
    }
  }

  static async getCourse(courseId: string) {
    try {
      const response = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.courses,
        courseId
      );
      return response;
    } catch (error) {
      console.error('Error getting course:', error);
      return null;
    }
  }

  static async createCourse(courseData: Omit<Course, '$id'>) {
    try {
      const response = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.courses,
        'unique()',
        courseData
      );
      return response;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  static async getLessonsByCourse(courseId: string) {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.lessons,
        [
          `equal("courseId", "${courseId}")`,
          'orderAsc("order")'
        ]
      );
      return response;
    } catch (error) {
      console.error('Error getting lessons:', error);
      throw error;
    }
  }

  static async createLesson(lessonData: Omit<Lesson, '$id'>) {
    try {
      const response = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.lessons,
        'unique()',
        lessonData
      );
      return response;
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  }

  static async getUserProgress(userId: string, courseId?: string) {
    try {
      const queries = [`equal("userId", "${userId}")`];
      if (courseId) {
        queries.push(`equal("courseId", "${courseId}")`);
      }
      
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.progress,
        queries
      );
      return response;
    } catch (error) {
      console.error('Error getting progress:', error);
      throw error;
    }
  }

  static async updateProgress(progressId: string, progressData: Partial<Progress>) {
    try {
      const response = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.progress,
        progressId,
        progressData
      );
      return response;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  static async enrollUser(userId: string, courseId: string) {
    try {
      const response = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.enrollments,
        'unique()',
        {
          userId,
          courseId,
          status: 'active',
          progress: 0,
          enrolledAt: new Date().toISOString()
        }
      );
      return response;
    } catch (error) {
      console.error('Error enrolling user:', error);
      throw error;
    }
  }

  static async getUserEnrollments(userId: string) {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.enrollments,
        [`equal("userId", "${userId}")`]
      );
      return response;
    } catch (error) {
      console.error('Error getting enrollments:', error);
      throw error;
    }
  }

  static async getStudySubjects(userId: string) {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        'study_subjects',
        [`equal("userId", "${userId}")`]
      );
      return response;
    } catch (error) {
      console.error('Error getting study subjects:', error);
      throw error;
    }
  }

  static async createStudySubject(subjectData: Omit<StudySubject, '$id'>) {
    try {
      const response = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        'study_subjects',
        'unique()',
        subjectData
      );
      return response;
    } catch (error) {
      console.error('Error creating study subject:', error);
      throw error;
    }
  }

  static async createStudyLog(logData: Omit<StudyLog, '$id'>) {
    try {
      const response = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        'study_logs',
        'unique()',
        logData
      );
      return response;
    } catch (error) {
      console.error('Error creating study log:', error);
      throw error;
    }
  }

  static async getStudyLogs(userId: string, limit = 50) {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        'study_logs',
        [
          `equal("userId", "${userId}")`,
          `limit(${limit})`,
          'orderDesc("$createdAt")'
        ]
      );
      return response;
    } catch (error) {
      console.error('Error getting study logs:', error);
      throw error;
    }
  }
}

export default DatabaseService;
