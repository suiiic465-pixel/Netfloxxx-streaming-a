import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigJson from '../../firebase-applet-config.json';

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId || '',
  appId: env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId || '',
};

// Prioritize custom VITE_FIREBASE_DATABASE_ID or default to '(default)' for custom env projects
const databaseId =
  env.VITE_FIREBASE_DATABASE_ID ||
  (env.VITE_FIREBASE_PROJECT_ID ? '(default)' : (firebaseConfigJson.firestoreDatabaseId || '(default)'));

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

export const db =
  databaseId && databaseId !== '(default)'
    ? getFirestore(app, databaseId)
    : getFirestore(app);

export const storage = getStorage(app);
export { firebaseConfig };
