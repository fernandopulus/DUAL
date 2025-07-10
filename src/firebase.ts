// src/firebase.ts
import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "asistencia-23f59.firebaseapp.com",
  projectId: "asistencia-23f59",
  storageBucket: "asistencia-23f59.appspot.com",
  messagingSenderId: "515790247853",
  appId: "1:515790247853:web:d430ff9c9d904dbc1b3324",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
