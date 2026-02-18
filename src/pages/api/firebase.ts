// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqhSwnswhGINwF4Z9sPMBJalUQvM2-svU",
  authDomain: "brainblog-fb180.firebaseapp.com",
  projectId: "brainblog-fb180",
  storageBucket: "brainblog-fb180.firebasestorage.app",
  messagingSenderId: "332162790914",
  appId: "1:332162790914:web:9b77632eb6517bc2db991b",
  measurementId: "G-SP1F1MEDLV"
};

// Initialize Firebase (check if already initialized for Next.js HMR)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);