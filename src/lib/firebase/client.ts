import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  User,
  UserCredential,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Types
export type { User } from 'firebase/auth';

// Google Provider
const googleProvider = new GoogleAuthProvider();

// Firebase auth client functions
export const firebaseAuth = {
  // Get current user
  getCurrentUser: (): User | null => {
    return auth ? auth.currentUser : null;
  },

  // Sign up with email and password
  signUp: async (email: string, password: string): Promise<UserCredential> => {
    if (!auth) {
      throw new Error('Firebase auth is not initialized. Please set up your Firebase configuration.');
    }
    return await createUserWithEmailAndPassword(auth, email, password);
  },

  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<UserCredential> => {
    if (!auth) {
      throw new Error('Firebase auth is not initialized. Please set up your Firebase configuration.');
    }
    return await signInWithEmailAndPassword(auth, email, password);
  },

  // Sign in with Google
  signInWithGoogle: async (): Promise<UserCredential> => {
    if (!auth) {
      throw new Error('Firebase auth is not initialized. Please set up your Firebase configuration.');
    }
    return await signInWithPopup(auth, googleProvider);
  },

  // Sign out
  signOut: async (): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase auth is not initialized. Please set up your Firebase configuration.');
    }
    return await signOut(auth);
  },

  // Reset password
  resetPassword: async (email: string): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase auth is not initialized. Please set up your Firebase configuration.');
    }
    return await sendPasswordResetEmail(auth, email);
  },

  // Get current session (user + token)
  getSession: async () => {
    if (auth && auth.currentUser) {
      const user = auth.currentUser;
      const idToken = await user.getIdToken();
      return {
        data: {
          session: {
            user: user,
            provider_token: idToken
          }
        }
      };
    }
    return { data: { session: null } };
  },

  // Get session (for compatibility with existing code)
  getAuthState: () => {
    return new Promise<{ data: { session: any } }>((resolve) => {
      if (!auth) {
        resolve({ data: { session: null } });
        return;
      }
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        resolve({
          data: {
            session: user ? { user } : null
          }
        });
        unsubscribe();
      });
    });
  },

  // Listen for auth state changes
  onAuthStateChange: (callback: (event: any, session: any) => void) => {
    if (!auth) {
      // Return a mock subscription that does nothing
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      callback('SIGNED_IN', user ? { user } : null);
    });

    return {
      data: {
        subscription: {
          unsubscribe
        }
      }
    };
  }
};