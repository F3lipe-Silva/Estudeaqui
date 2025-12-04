// Example usage of Supabase integration with authentication in the Estudeaqui app

import { studyService, Subject, Topic, StudyLog } from '@/lib/supabase/study-service';
import { useAuth } from '@/contexts/auth-context';

// Example of how to use the study service in a React component
export const useStudyManager = () => {
  const { user } = useAuth();

  // Function to get current user's subjects
  const getUserSubjects = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    return await studyService.getSubjects(user.id);
  };

  // Function to add a new subject for the current user
  const addSubjectForUser = async (subjectData: Omit<Subject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    return await studyService.addSubject({
      ...subjectData,
      user_id: user.id
    });
  };

  // Function to get topics for a specific subject
  const getSubjectTopics = async (subjectId: string) => {
    return await studyService.getTopics(subjectId);
  };

  // Function to add a new topic to a subject
  const addTopicToSubject = async (topicData: Omit<Topic, 'id' | 'created_at' | 'updated_at'>) => {
    return await studyService.addTopic(topicData);
  };

  // Function to get study logs for the current user
  const getUserStudyLogs = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    return await studyService.getStudyLogs(user.id);
  };

  // Function to add a study log for the current user
  const addStudyLogForUser = async (logData: Omit<StudyLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    return await studyService.addStudyLog({
      ...logData,
      user_id: user.id
    });
  };

  return {
    getUserSubjects,
    addSubjectForUser,
    getSubjectTopics,
    addTopicToSubject,
    getUserStudyLogs,
    addStudyLogForUser,
  };
};

// Example of a function that can be used in server components
// (This would be used in pages with server-side rendering)
export const getServerUserSubjects = async (userId: string) => {
  // Note: This requires the server-side Supabase client with service role key
  // which has more privileges than the client-side client
  return await studyService.getSubjects(userId);
};

// Example of calculating study statistics
export const calculateStudyStats = (studyLogs: StudyLog[]) => {
  if (!studyLogs || studyLogs.length === 0) {
    return {
      totalHours: 0,
      totalSessions: 0,
      totalPages: 0,
      totalQuestions: 0,
      accuracy: 0,
    };
  }

  const totalDuration = studyLogs.reduce((sum, log) => sum + log.duration, 0);
  const totalPages = studyLogs.reduce((sum, log) => sum + (log.end_page || 0) - (log.start_page || 0), 0);
  const totalQuestions = studyLogs.reduce((sum, log) => sum + (log.questions_total || 0), 0);
  const correctQuestions = studyLogs.reduce((sum, log) => sum + (log.questions_correct || 0), 0);

  const accuracy = totalQuestions > 0 ? (correctQuestions / totalQuestions) * 100 : 0;

  return {
    totalHours: Math.round((totalDuration / 60) * 100) / 100, // convert minutes to hours
    totalSessions: studyLogs.length,
    totalPages,
    totalQuestions,
    accuracy: Math.round(accuracy * 100) / 100,
  };
};