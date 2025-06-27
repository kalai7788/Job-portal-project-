// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAurnqMaF_wnJpdQqCN4WNyak3MD51fjbU",
  authDomain: "job-portal-dbe62.firebaseapp.com",
  projectId: "job-portal-dbe62",
  storageBucket: "job-portal-dbe62.firebasestorage.app",
  messagingSenderId: "206406241827",
  appId: "1:206406241827:web:17e07a3d197630507f6b96",
  measurementId: "G-PYHT0E5J41"
};
const app = initializeApp(firebaseConfig);



const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // 👈 Make sure this line is present

export { auth, db, storage }; // 👈 Include storage in exports
