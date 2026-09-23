import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAhIDuofT5rZ09kJ0OFrhViPPNgmRl6X4g",
  authDomain: "yarn-catalog.firebaseapp.com",
  projectId: "yarn-catalog",
  storageBucket: "yarn-catalog.firebasestorage.app",
  messagingSenderId: "645329309231",
  appId: "1:645329309231:web:764f02a05cc448ec62c0da"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
