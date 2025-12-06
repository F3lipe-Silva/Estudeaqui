import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { router } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
  getAuth
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import type { Auth } from 'firebase/auth';

// Use the auth instance initialized in firebase.ts
const typedAuth: Auth = auth;

interface Session {
  user: {
    id: string;
    email: string;
  };
  expires_at: number;
}

interface AuthContextType {
  session: Session | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(typedAuth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        // Construct a session object compatible with the rest of the app
        setSession({
          user: {
            id: currentUser.uid,
            email: currentUser.email!,
          },
          expires_at: Number.MAX_SAFE_INTEGER, // Session managed by Firebase
        });
      } else {
        setSession(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(typedAuth, email, password);
      // Construct a session object compatible with the rest of the app
      const sessionData = {
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
        },
        expires_at: Number.MAX_SAFE_INTEGER, // Session managed by Firebase
      };

      // Set the session and user in the context
      setSession(sessionData);
      setUser(userCredential.user);

      // Redirect to main application after successful sign up
      if (typeof window !== 'undefined') {
        router.push('/(tabs)');
      }

      return { data: { user: userCredential.user }, error: null };
    } catch (error: any) {
      console.error("SignUp Error:", error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(typedAuth, email, password);
      // Construct a session object compatible with the rest of the app
      const sessionData = {
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
        },
        expires_at: Number.MAX_SAFE_INTEGER, // Session managed by Firebase
      };

      // Set the session and user in the context
      setSession(sessionData);
      setUser(userCredential.user);

      // Redirect to main application after successful sign in
      if (typeof window !== 'undefined') {
        router.push('/(tabs)');
      }

      return { data: { session: sessionData }, error: null };
    } catch (error: any) {
      console.error("SignIn Error:", error);
      return { data: null, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(typedAuth, provider);
      // Construct a session object compatible with the rest of the app
      const sessionData = {
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
        },
        expires_at: Number.MAX_SAFE_INTEGER, // Session managed by Firebase
      };

      // Set the session and user in the context
      setSession(sessionData);
      setUser(userCredential.user);

      // Redirect to main application after successful sign in
      if (typeof window !== 'undefined') {
        router.push('/(tabs)');
      }

      return { data: { session: sessionData }, error: null };
    } catch (error: any) {
      console.error("Google SignIn Error:", error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(typedAuth);
      setSession(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        router.push('/login');
      }
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(typedAuth, email);
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