import { auth } from "@/config/firebaseClient";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
} from "firebase/auth";

export const AuthService = {
  signIn: (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  signUp: (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  resetPassword: (email: string) => {
    return sendPasswordResetEmail(auth, email);
  },

  signOut: () => {
    return firebaseSignOut(auth);
  },
};
