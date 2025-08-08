// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, indexedDBLocalPersistence } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "estudaqui-pwa",
  "appId": "1:269023322689:web:678762d266322eda695cc0",
  "storageBucket": "estudaqui-pwa.firebasestorage.app",
  "apiKey": process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  "authDomain": "estudaqui-pwa.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "269023322689"
};

console.log('Firebase API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

// Set Firebase Authentication persistence to local (IndexedDB)
setPersistence(auth, indexedDBLocalPersistence)
  .then(() => {
    console.log('Firebase Auth persistence set to IndexedDB');
  })
  .catch((error) => {
    console.error('Error setting Firebase Auth persistence:', error);
  });
