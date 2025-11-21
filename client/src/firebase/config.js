import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJdrdypUFSW31n0z-RFLlrDZAqWmYezHs",
  authDomain: "pitchtrivia.firebaseapp.com",
  databaseURL: "https://pitchtrivia-default-rtdb.firebaseio.com",
  projectId: "pitchtrivia",
  storageBucket: "pitchtrivia.firebasestorage.app",
  messagingSenderId: "89822319138",
  appId: "1:89822319138:web:624419341c14041ec6b07b",
  measurementId: "G-8615QEX85K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const realtimeDb = getDatabase(app);
export default app;

