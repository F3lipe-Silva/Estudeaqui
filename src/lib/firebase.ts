import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDWzaCn_AX01k30J2lP0GY_Xn5CE8AFn9M",
  authDomain: "estudeaqui-b287c.firebaseapp.com",
  projectId: "estudeaqui-b287c",
  storageBucket: "estudeaqui-b287c.firebasestorage.app",
  messagingSenderId: "379928009944",
  appId: "1:379928009944:web:2d0f0bef6895e92fa10bad",
  measurementId: "G-C2XV5JFQBC"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
