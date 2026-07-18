import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase web config. These are publishable client keys, safe to commit.
 */
const firebaseConfig = {
  apiKey: "AIzaSyD-placeholder", // overridden below via env if provided
  authDomain: "techie-bro-5e36c.firebaseapp.com",
  databaseURL: "https://techie-bro-5e36c-default-rtdb.firebaseio.com",
  projectId: "techie-bro-5e36c",
  storageBucket: "techie-bro-5e36c.firebasestorage.app",
  messagingSenderId: "672290482822",
  appId: "1:672290482822:web:bbce74536cd1c01eb0bf07",
  measurementId: "G-DMTJB9QDH5",
};

// Prefer env-provided apiKey when available (VITE_FIREBASE_API_KEY).
const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
if (envApiKey) firebaseConfig.apiKey = envApiKey;

export const isFirebaseConfigured = firebaseConfig.apiKey !== "AIzaSyD-placeholder";

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

export function getDb(): Firestore {
  if (typeof window === "undefined") {
    throw new Error("Firestore is only available in the browser.");
  }
  if (!app) {
    app = getApps()[0] ?? initializeApp(firebaseConfig);
  }
  if (!dbInstance) {
    dbInstance = getFirestore(app);
  }
  return dbInstance;
}
