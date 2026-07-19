/**
 * Public Firebase project metadata. The API key is read securely on the server
 * from GOOGLE_API_KEY so it is not embedded in the browser bundle.
 */
export const firebaseProjectConfig = {
  authDomain: "techie-bro-5e36c.firebaseapp.com",
  databaseURL: "https://techie-bro-5e36c-default-rtdb.firebaseio.com",
  projectId: "techie-bro-5e36c",
  storageBucket: "techie-bro-5e36c.firebasestorage.app",
  messagingSenderId: "672290482822",
  appId: "1:672290482822:web:bbce74536cd1c01eb0bf07",
  measurementId: "G-DMTJB9QDH5",
};

export const isFirebaseConfigured = Boolean(firebaseProjectConfig.projectId);
