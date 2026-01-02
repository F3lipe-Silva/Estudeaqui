'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';

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
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        setSession({
          user: {
            id: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || undefined,
          },
          expires_at: Number.MAX_SAFE_INTEGER,
        });
      } else {
        setSession(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;

      if (name) {
        await updateProfile(currentUser, { displayName: name });
        // Force reload to get updated display name
        await currentUser.reload();
      }

      // Session state will be updated by onAuthStateChanged
      
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Session state will be updated by onAuthStateChanged

      // Redirect to main application after successful sign in
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }

      return { data: { session: { user: userCredential.user } }, error: null };
    } catch (error: any) {
      console.error("SignIn Error:", error);
      return { data: null, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Session state will be updated by onAuthStateChanged
      return { data: {}, error: null };
    } catch (error: any) {
      console.error("Google SignIn Error:", error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Session state will be updated by onAuthStateChanged
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
      await sendPasswordResetEmail(auth, email);
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