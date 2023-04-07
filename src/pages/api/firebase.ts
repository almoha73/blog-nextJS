// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import{ getFirestore } from "@firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApBla-G0NhE2ealBXM6kca6D_SncqWh64",
  authDomain: "blog-d70e1.firebaseapp.com",
  projectId: "blog-d70e1",
  storageBucket: "blog-d70e1.appspot.com",
  messagingSenderId: "839978059674",
  appId: "1:839978059674:web:838775537173d4f7799c23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);