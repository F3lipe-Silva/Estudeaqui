import { useState, useEffect } from 'react';
import { DatabaseService, Course, Lesson, Progress, StudySubject, StudyLog } from '../lib/database';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const response = await DatabaseService.getCourses();
        setCourses(response.documents as unknown as Course[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return { courses, loading, error, refetch: () => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const response = await DatabaseService.getCourses();
        setCourses(response.documents as unknown as Course[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }};
}

export function useCourse(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    async function fetchCourse() {
      try {
        setLoading(true);
        const courseData = await DatabaseService.getCourse(courseId);
        setCourse(courseData as unknown as Course);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch course');
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId]);

  return { course, loading, error };
}

export function useLessons(courseId: string) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    async function fetchLessons() {
      try {
        setLoading(true);
        const response = await DatabaseService.getLessonsByCourse(courseId);
        setLessons(response.documents as unknown as Lesson[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch lessons');
      } finally {
        setLoading(false);
      }
    }

    fetchLessons();
  }, [courseId]);

  return { lessons, loading, error };
}

export function useUserProgress(userId: string, courseId?: string) {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchProgress() {
      try {
        setLoading(true);
        const response = await DatabaseService.getUserProgress(userId, courseId);
        setProgress(response.documents as unknown as Progress[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch progress');
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, [userId, courseId]);

  return { progress, loading, error };
}

export function useStudySubjects(userId: string) {
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchSubjects() {
      try {
        setLoading(true);
        const response = await DatabaseService.getStudySubjects(userId);
        setSubjects(response.documents as unknown as StudySubject[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch study subjects');
      } finally {
        setLoading(false);
      }
    }

    fetchSubjects();
  }, [userId]);

  return { subjects, loading, error };
}

export function useStudyLogs(userId: string) {
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchLogs() {
      try {
        setLoading(true);
        const response = await DatabaseService.getStudyLogs(userId);
        setLogs(response.documents as unknown as StudyLog[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch study logs');
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [userId]);

  return { logs, loading, error };
}
