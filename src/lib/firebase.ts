// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "estudeaqui-fb6e7",
  "appId": "1:1072254243948:web:b21c3757f547df4185b449",
  "storageBucket": "estudeaqui-fb6e7.firebasestorage.app",
  "apiKey": process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  "authDomain": "estudeaqui-fb6e7.firebaseapp.com",
  "measurementId": "G-B5Y9CQHR05",
  "messagingSenderId": "1072254243948"
};

console.log('Firebase API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
