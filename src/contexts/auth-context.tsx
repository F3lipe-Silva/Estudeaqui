'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type User = {
  uid: string;
  email?: string | null;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  logOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({ uid: session.user.id, email: session.user.email });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logIn = async (email: string, password: string): Promise<any> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setUser({ uid: data.user?.id || '', email: data.user?.email });
      router.push('/');
      return data.user;
    } catch (error) {
      console.error("Login failed:", error);
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string): Promise<any> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setUser({ uid: data.user?.id || '', email: data.user?.email });
      router.push('/');
      return data.user;
    } catch (error) {
      console.error("Sign up failed:", error);
      setLoading(false);
      throw error;
    }
  };

  const logOut = async (): Promise<any> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      router.push('/login');
      return true;
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      logIn,
      signUp,
      logOut
    }}>
      {children}
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
