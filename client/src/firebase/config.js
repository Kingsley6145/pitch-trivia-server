import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAJdrdypUFSW31n0z-RFLlrDZAqWmYezHs",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "pitchtrivia.firebaseapp.com",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://pitchtrivia-default-rtdb.firebaseio.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "pitchtrivia",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "pitchtrivia.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "89822319138",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:89822319138:web:624419341c14041ec6b07b",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-8615QEX85K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const realtimeDb = getDatabase(app);
export default app;

