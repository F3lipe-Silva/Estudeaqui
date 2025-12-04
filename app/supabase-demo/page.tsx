'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import FirebaseDemo from '@/components/supabase-demo';
import { studyService } from '@/lib/firebase/study-service';

export default function FirebasePage() {
  const { user, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
    } catch (error: any) {
      setMessage(error.error_description || error.message);
    }
  };

  const handleSignOut = async () => {
    setMessage('');
    try {
      await signOut();
    } catch (error: any) {
      setMessage(error.error_description || error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Firebase Integration - Estudeaqui</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Authentication</h2>
        
        {user ? (
          <div>
            <div className="mb-4">
              <p className="font-medium">Signed in as: {user.email}</p>
              <p className="text-sm text-gray-600">User ID: {user.uid}</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Sign In
            </button>
          </form>
        )}
        
        {message && (
          <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded">
            {message}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Study Data Management</h2>
        
        {user ? (
          <FirebaseDemo />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Please sign in to access your study data</p>
            <p className="text-sm text-gray-500">
              Once authenticated, you'll be able to manage your subjects, topics, and study logs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}