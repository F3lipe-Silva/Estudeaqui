import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logIn: (credentials: any) => Promise<any>;
  signUp: (credentials: any) => Promise<any>;
  logOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to the sign-in page.
      // router.replace('/login'); // In Expo Router, we handle this slightly differently usually, or use a Layout guard.
      // For now, we'll let the UI handle the redirect or use this simple logic.
      // Note: It's better to protect routes in the layout.
    } else if (user && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  const logIn = async (credentials: any): Promise<any> => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (credentials: any): Promise<any> => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logOut = async (): Promise<any> => {
    setLoading(true);
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout failed", error);
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
