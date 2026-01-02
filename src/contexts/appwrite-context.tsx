'use client';

import React, { createContext, useContext } from 'react';
import { useAuth } from './auth-context';

export interface User {
  $id: string;
  email: string;
  name: string;
  preferences?: Record<string, any>;
}

interface AppwriteContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AppwriteContext = createContext<AppwriteContextType | undefined>(undefined);

export function AppwriteProvider({ children }: { children: React.ReactNode }) {
  const { user: firebaseUser, loading, signIn, signUp, signOut } = useAuth();

  const user: User | null = firebaseUser ? {
    $id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || '',
    preferences: {}
  } : null;

  const login = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const register = async (email: string, password: string, name: string) => {
    await signUp(email, password, name);
  };

  const logout = async () => {
    await signOut();
  };

  const updateProfile = async (data: Partial<User>) => {
    console.warn("updateProfile not fully implemented in Firebase migration yet");
    // Implementation would involve updateProfile from firebase/auth or updating a user document
  };

  return (
    <AppwriteContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AppwriteContext.Provider>
  );
}

export function useAppwrite() {
  const context = useContext(AppwriteContext);
  if (context === undefined) {
    throw new Error('useAppwrite must be used within an AppwriteProvider');
  }
  return context;
}
