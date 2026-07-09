import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDxJu0QZDEj1jdtC9VjGNpDQy43x0QIpbs",
  authDomain: "meera-online-point.firebaseapp.com",
  projectId: "meera-online-point",
  storageBucket: "meera-online-point.firebasestorage.app",
  messagingSenderId: "660544825222",
  appId: "1:660544825222:web:5152625caf483b35a5ee07",
  measurementId: "G-KBMLGTX9EL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, deleteDoc, doc };