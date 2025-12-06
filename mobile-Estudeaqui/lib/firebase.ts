import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import { firebaseConfig } from '@/constants/firebase-config';

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

try {
  if (getApps().length > 0) {
    app = getApp();
    auth = getAuth(app);
  } else {
    app = initializeApp(firebaseConfig);
    
    if (Platform.OS === 'web') {
      auth = getAuth(app);
    } else {
      try {
        // Dynamically require getReactNativePersistence to avoid Web bundling issues
        const { getReactNativePersistence } = require('firebase/auth');
        auth = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage)
        });
      } catch (e) {
        console.warn("Failed to initialize Auth with persistence, falling back to default:", e);
        auth = getAuth(app);
      }
    }
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw error;
}

export const db = getFirestore(app);
export { auth };