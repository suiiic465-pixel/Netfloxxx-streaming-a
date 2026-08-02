import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigJson from '../../firebase-applet-config.json';

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || env.VITE_FIREBASE_API_KEY || '',
  authDomain: firebaseConfigJson.authDomain || env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: firebaseConfigJson.projectId || env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: firebaseConfigJson.storageBucket || env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: firebaseConfigJson.messagingSenderId || env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: firebaseConfigJson.appId || env.VITE_FIREBASE_APP_ID || '',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

export const db =
  firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
    : getFirestore(app);

export const storage = getStorage(app);
export { firebaseConfig };
