// Firebase Configuration
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAy6tgecNMR5awweVWMTQxBEhnVPQ5bCwA",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "estudeaqui-fb6e7.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "estudeaqui-fb6e7",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "estudeaqui-fb6e7.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1072254243948",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:1072254243948:web:b21c3757f547df4185b449",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-B5Y9CQHR05"
};

// API Configuration
export const apiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.0.12:3000"
};