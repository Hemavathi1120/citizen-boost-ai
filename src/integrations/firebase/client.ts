import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type UserCredential,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDFr72JOIrPj54ChDvU3Rk5pRNVs3dZJBI",
  authDomain: "schemesync-ai.firebaseapp.com",
  projectId: "schemesync-ai",
  storageBucket: "schemesync-ai.firebasestorage.app",
  messagingSenderId: "654066692796",
  appId: "1:654066692796:web:ce75a6340a0b6dbbf1d6b9",
  measurementId: "G-6C5VTMDJ38",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const firebaseAuth = getAuth(app);
export const firebaseGoogleProvider = new GoogleAuthProvider();

export async function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(firebaseAuth, email, password);
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(firebaseAuth, email, password);
}

export async function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(firebaseAuth, firebaseGoogleProvider);
}

export async function signOutFirebase(): Promise<void> {
  return signOut(firebaseAuth);
}
