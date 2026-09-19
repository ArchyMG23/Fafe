import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// Configuration uses environment variables for both local dev and production
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

// Diagnostic de configuration
console.info('--- DIAGNOSTIC FIREBASE ---');
console.info('Configuration source: Variables d\'environnement (import.meta.env)');
console.info('Project ID:', firebaseConfig.projectId ? 'défini' : 'MANQUANT');
console.info('Firestore DB ID:', firebaseConfig.firestoreDatabaseId || '(default)');
Object.entries(firebaseConfig).forEach(([key, value]) => {
  if (key !== 'projectId' && key !== 'firestoreDatabaseId') {
    console.info(`${key}: ${value ? 'défini' : 'MANQUANT'}`);
  }
});
console.info('---------------------------');

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const storage = getStorage(app);

// Prevent indefinite hangs: default maxUploadRetryTime is 600,000ms (10 mins).
// Set strict 10s maximum retry time for Storage network operations.
try {
  storage.maxUploadRetryTime = 10000;
  storage.maxOperationRetryTime = 10000;
} catch (e) {
  // Ignored if unsupported in specific environment
}

// Connection test helper
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    return { ok: true };
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline mode. Checking network connection...');
    }
    return { ok: false, error: error?.message || String(error) };
  }
}


