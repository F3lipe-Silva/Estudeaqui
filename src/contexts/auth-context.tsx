
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logIn = async (email: string, password: string): Promise<any> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser({ uid: userCredential.user.uid, email: userCredential.user.email });
      router.push('/');
      return userCredential.user;
    } catch (error) {
      console.error("Login failed:", error);
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string): Promise<any> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser({ uid: userCredential.user.uid, email: userCredential.user.email });
      router.push('/');
      return userCredential.user;
    } catch (error) {
      console.error("Sign up failed:", error);
      setLoading(false);
      throw error;
    }
  };

  const logOut = async (): Promise<any> => {
    setLoading(true);
    try {
      await signOut(auth);
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
