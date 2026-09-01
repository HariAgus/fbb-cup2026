import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const defaultFirebaseConfig = {
  apiKey: "AIzaSyCuzSbizB8RU9tJgYD38HMFg9Yva3i-w2k",
  authDomain: "fbb-cup.firebaseapp.com",
  projectId: "fbb-cup",
  storageBucket: "fbb-cup.firebasestorage.app",
  messagingSenderId: "670859555990",
  appId: "1:670859555990:web:32d828d30354dbeaed7eb7",
  measurementId: "G-LTCK387VCN",
  collectionName: "fbb_badminton_tournaments",
  documentId: "cup2026"
};

// Singleton Firebase App Instance
let firebaseApp = null;

export const getFirebaseApp = (customConfig = null) => {
  const config = { ...defaultFirebaseConfig, ...(customConfig || {}) };
  if (!getApps().length) {
    firebaseApp = initializeApp(config);
  } else {
    firebaseApp = getApp();
  }
  return firebaseApp;
};

export const getFirebaseDb = (customConfig = null) => {
  const app = getFirebaseApp(customConfig);
  return getFirestore(app);
};

export const getFirebaseAuthInstance = (customConfig = null) => {
  const app = getFirebaseApp(customConfig);
  return getAuth(app);
};
