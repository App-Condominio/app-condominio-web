// services/authService.js
import { auth, db } from "@/config/firebaseClient";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const CondominiumService = {
  createOrUpdate: async (payload, id: string) => {
    await setDoc(doc(db, "condominiums", id), payload);
  },

  signUp: (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  resetPassword: (email: string) => {
    return sendPasswordResetEmail(auth, email);
  },
};
