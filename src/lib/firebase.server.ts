import { firebaseProjectConfig } from "./firebase";

export function getFirebaseRestConfig() {
  const apiKey = process.env.GOOGLE_API_KEY?.trim();

  if (!apiKey || apiKey.startsWith("@secret:")) {
    throw new Error("GOOGLE_API_KEY is not configured for Firebase access.");
  }

  return {
    ...firebaseProjectConfig,
    apiKey,
  };
}