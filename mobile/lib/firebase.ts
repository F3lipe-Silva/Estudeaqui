import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBYourRealApiKeyHereReplaceWithYourActualKey", // Replace with your actual Firebase API key
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "estudaqui-pwa.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "estudaqui-pwa",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "estudaqui-pwa.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "269023322689",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:269023322689:web:678762d266322eda695cc0",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX" // Optional: add your measurement ID if you're using Firebase Analytics
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with React Native Persistence
const auth = !getApps().length
  ? initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  : getAuth(app);

const db = getFirestore(app);

export { auth, db };
