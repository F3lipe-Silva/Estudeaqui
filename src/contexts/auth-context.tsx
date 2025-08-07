
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Mock User type to avoid breaking other parts of the app
type User = {
  uid: string;
  email?: string;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logIn: (p: any) => Promise<any>;
  signUp: (p: any) => Promise<any>;
  logOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Simulate checking for a user session
  useEffect(() => {
    const checkSession = () => {
      // In a real app, you'd check localStorage, a cookie, or make an API call
      // For this mock, we'll just assume the user is logged out initially.
      setUser(null);
      setLoading(false);
    };
    checkSession();
  }, []);

  const logIn = async (credentials: any): Promise<any> => {
    setLoading(true);
    // Simulate API call
    return new Promise(resolve => {
        setTimeout(() => {
            const mockUser = { uid: 'mock-user-123', email: credentials.email || 'user@google.com' };
            setUser(mockUser);
            setLoading(false);
            router.push('/');
            resolve(mockUser);
        }, 1000);
    });
  };

  const logOut = async (): Promise<any> => {
    setLoading(true);
    // Simulate API call
     return new Promise(resolve => {
        setTimeout(() => {
            setUser(null);
            setLoading(false);
            router.push('/login');
            resolve(true);
        }, 500);
    });
  };

  const signUp = async (credentials: any): Promise<any> => {
    // This is a mock. In a real app, this would create a new user.
    return logIn(credentials);
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
