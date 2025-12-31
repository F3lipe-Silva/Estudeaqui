'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { account } from '@/lib/appwrite';
import { ID } from 'appwrite';

interface Session {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  expires_at: number;
}

interface AuthContextType {
  session: Session | null;
  user: any | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        setSession({
          user: {
            id: currentUser.$id,
            email: currentUser.email,
            name: currentUser.name,
          },
          expires_at: Number.MAX_SAFE_INTEGER,
        });
      } else {
        setSession(null);
      }
    } catch (error) {
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      // Criar conta
      await account.create(ID.unique(), email, password, name || '');
      
      // Fazer login automaticamente
      const userCredential = await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      
      const sessionData = {
        user: {
          id: currentUser.$id,
          email: currentUser.email,
          name: currentUser.name,
        },
        expires_at: Number.MAX_SAFE_INTEGER,
      };

      setSession(sessionData);
      setUser(currentUser);

      // Redirect to main application after successful sign up
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }

      return { data: { user: currentUser }, error: null };
    } catch (error: any) {
      console.error("SignUp Error:", error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      
      const sessionData = {
        user: {
          id: currentUser.$id,
          email: currentUser.email,
          name: currentUser.name,
        },
        expires_at: Number.MAX_SAFE_INTEGER,
      };

      setSession(sessionData);
      setUser(currentUser);

      // Redirect to main application after successful sign in
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }

      return { data: { session: sessionData }, error: null };
    } catch (error: any) {
      console.error("SignIn Error:", error);
      return { data: null, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Appwrite OAuth2 para Google
      await account.createOAuth2Session('google' as any, 'http://localhost:3000', 'http://localhost:3000/login');
      
      // O redirecionamento será tratado pelo Appwrite
      return { data: null, error: null };
    } catch (error: any) {
      console.error("Google SignIn Error:", error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      await account.deleteSession('current');
      setSession(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await account.createRecovery(email, 'http://localhost:3000/reset-password');
      return { data: {}, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}