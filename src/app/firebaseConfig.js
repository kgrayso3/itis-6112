// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDB9tnnj5et-kaUnlVNFgsVqvrcg6qi-3Y",
  authDomain: "itcs6112-3fd41.firebaseapp.com",
  projectId: "itcs6112-3fd41",
  storageBucket: "itcs6112-3fd41.firebasestorage.app",
  messagingSenderId: "1084092002637",
  appId: "1:1084092002637:web:36d1dd0914593962c6c704",
  measurementId: "G-ZBEXMD5CVF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const auth = getAuth(app);
export {db};
