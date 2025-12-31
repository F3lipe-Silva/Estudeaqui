'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { account, APPWRITE_CONFIG } from '@/lib/appwrite';
import { ID } from 'appwrite';

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser as User);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser as User);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      await account.create(ID.unique(), email, password, name);
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await account.updatePrefs(data.preferences || {});
      setUser(prev => prev ? { ...prev, ...updatedUser } : null);
    } catch (error) {
      throw error;
    }
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
