import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {

  apiKey: "AIzaSyCnyOGIL6ex9UF4PUPE5z5-NFds08bnFz4",
  authDomain: "netirish-2ad84.firebaseapp.com",
  projectId: "netirish-2ad84",
  storageBucket: "netirish-2ad84.firebasestorage.app",
  messagingSenderId: "797364757227",
  appId: "1:797364757227:web:963e97eddf1af1bb3bd4ae",
  measurementId: "G-0Y65LC5MFB"

};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);