import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// The configuration from firebase-applet-config.json
const firebaseConfig = {
  projectId: "noble-machine-7dzmz",
  appId: "1:399687523002:web:0327f82f3ae5202fb40083",
  apiKey: "AIzaSyCx__cvRc-zuyFpOiE16OIPDE6AuIpwPcE",
  authDomain: "noble-machine-7dzmz.firebaseapp.com",
  storageBucket: "noble-machine-7dzmz.firebasestorage.app",
  messagingSenderId: "399687523002",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-1f9f0706-cad1-4d67-94d8-0690809d943d");
