'use client';

import { useState, createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  session: { user: User } | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock storage for demo purposes
  const storeSession = (user: User | null) => {
    if (user) {
      localStorage.setItem('mock_user', JSON.stringify(user));
      setSession({ user });
    } else {
      localStorage.removeItem('mock_user');
      setSession(null);
    }
  };

  const signUp = async (email: string, password: string) => {
    // Mock signup implementation
    const mockUser: User = {
      id: `user_${Date.now()}`,
      email
    };

    storeSession(mockUser);
    setUser(mockUser);

    return { data: { user: mockUser }, error: null };
  };

  const signIn = async (email: string, password: string) => {
    // Mock sign in implementation
    const storedUser = localStorage.getItem('mock_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.email === email) {
        storeSession(parsedUser);
        setUser(parsedUser);
        return { data: { user: parsedUser }, error: null };
      }
    }

    // If no user found, create a mock user for demo
    const mockUser: User = {
      id: `user_${Date.now()}`,
      email
    };

    storeSession(mockUser);
    setUser(mockUser);

    return { data: { user: mockUser }, error: null };
  };

  const signInWithGoogle = async () => {
    // Mock Google sign in implementation
    const mockUser: User = {
      id: `google_user_${Date.now()}`,
      email: `mock_user_${Date.now()}@gmail.com`
    };

    storeSession(mockUser);
    setUser(mockUser);

    return { data: { user: mockUser }, error: null };
  };

  const signOut = async () => {
    storeSession(null);
    setUser(null);
    // Redirecionar para a página de login após o logout
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    // Mock password reset implementation
    console.log('Password reset requested for:', email);
    return { error: null };
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