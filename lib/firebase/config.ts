import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAnVCQFygCCHWBLp-MuSyyBEAEBjais9ME",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sca-kdev.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sca-kdev",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sca-kdev.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "821121151258",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:821121151258:web:fee75a8bdc32652d653ca3",
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider configured for kiit.ac.in domain prompt
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: "kiit.ac.in",
  prompt: "select_account",
});

export default app;