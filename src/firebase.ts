// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// ...otros imports

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYJ8aGffq3DoTyx-MKHDLqKTzqJVIrdws",
  authDomain: "dualgrade.firebaseapp.com",
  projectId: "dualgrade",
  storageBucket: "dualgrade.appspot.com", // ← CORREGIDO AQUÍ
  messagingSenderId: "588826913037",
  appId: "1:588826913037:web:65d0b141a93b8c6233a844"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);