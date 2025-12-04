'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { studyService } from '@/lib/supabase/study-service';

export default function SupabaseDemo() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      // Replace with an actual user ID for demonstration
      // In a real app, you would get this from the authenticated user
      const userId = '00000000-0000-0000-0000-000000000000'; // Placeholder ID
      
      const data = await studyService.getSubjects(userId);
      setSubjects(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching subjects');
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDemoSubject = async () => {
    try {
      // This is just for demo purposes - you'll need an actual authenticated user ID
      const userId = '00000000-0000-0000-0000-000000000000'; // Placeholder ID
      
      await studyService.addSubject({
        user_id: userId,
        name: 'Demo Subject',
        color: '#3b82f6',
        description: 'This is a demo subject created from the frontend'
      });
      
      // Refresh the list
      fetchSubjects();
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding subject');
      console.error('Error adding subject:', err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Supabase Demo - Study Management</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {loading ? (
        <p>Loading subjects...</p>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="mb-4">Fetched {subjects.length} subjects from Supabase</p>
            <button 
              onClick={handleAddDemoSubject}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Demo Subject
            </button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {subjects.map(subject => (
              <div key={subject.id} className="border-b pb-2 p-2">
                <div className="font-medium">{subject.name}</div>
                <div className="text-sm text-gray-600">
                  ID: {subject.id.substring(0, 8)}... | 
                  Color: {subject.color} | 
                  Created: {new Date(subject.created_at).toLocaleDateString()}
                </div>
                {subject.description && (
                  <div className="text-sm mt-1">{subject.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
        <h3 className="font-medium mb-2">Database Schema Information</h3>
        <p className="text-sm">
          Your Supabase project "Estudeaqui" contains tables for a complete study management system:
        </p>
        <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
          <li><strong>subjects</strong> - Study subjects with colors and descriptions</li>
          <li><strong>topics</strong> - Topics within subjects with completion tracking</li>
          <li><strong>study_logs</strong> - Detailed logs of study sessions</li>
          <li><strong>study_sequences</strong> - Custom study sequences</li>
          <li><strong>pomodoro_settings</strong> - Pomodoro timer configurations</li>
          <li><strong>templates</strong> - Study plan templates</li>
          <li><strong>schedule_plans</strong> - Weekly study schedules</li>
          <li><strong>user_settings</strong> - User preferences</li>
        </ul>
        <p className="text-xs mt-3 text-gray-600">
          Note: To interact with real data, you'll need to authenticate users and use their actual user IDs.
        </p>
      </div>
    </div>
  );
}