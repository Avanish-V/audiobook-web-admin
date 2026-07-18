import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase web config. These are publishable client keys, safe to commit.
 * Replace the placeholder values below with your project's config from:
 *   Firebase Console → Project Settings → Your apps → SDK setup and configuration
 *
 * You can also set them via Vite env vars (VITE_FIREBASE_*) if you prefer.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "YOUR_PROJECT.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "YOUR_PROJECT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "0000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:0000000000:web:xxxxxxxx",
};

export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

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
