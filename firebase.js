import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxJu0QZDEj1jdtC9VjGNpDQy43x0QIpbs",
  authDomain: "meera-online-point.firebaseapp.com",
  projectId: "meera-online-point",
  storageBucket: "meera-online-point.firebasestorage.app",
  messagingSenderId: "660544825222",
  appId: "1:660544825222:web:5152625caf483b35a5ee07",
  measurementId: "G-KBMLGTX9EL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
const auth = getAuth(app);

// Firestore Database
const db = getFirestore(app);

// Export everything needed by the website and admin panel
export {
  app,
  auth,
  db,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
};
