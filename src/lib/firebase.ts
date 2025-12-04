// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "estudaqui-pwa.firebaseapp.com",
  projectId: "estudaqui-pwa",
  storageBucket: "estudaqui-pwa.firebasestorage.app",
  messagingSenderId: "269023322689",
  appId: "1:269023322689:web:678762d266322eda695cc0",
  measurementId: "G-Z6XZ7N223Z"  // Added measurementId if needed
};

let app;
let db;
let auth;
let storage;

// Initialize Firebase only if the API key is present
if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} else {
  // Create mock objects when API key is not available
  console.warn('Firebase API key not found. Some features may be disabled.');
  app = null;
  db = null;
  auth = null;
  storage = null;
}

export { db, auth, storage };
