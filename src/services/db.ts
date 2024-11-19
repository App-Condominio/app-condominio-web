// services/authService.js
import { db } from "@/config/firebaseClient";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";

export const DBService = {
  // Create or Update (Upsert)
  upsert: async ({
    table,
    id,
    payload,
  }: {
    table: string;
    id: string;
    payload: any;
  }) => {
    await setDoc(doc(db, table, id), payload);
  },

  // Read (Get a single document by ID)
  read: async ({ table, id }: { table: string; id: string }) => {
    const docRef = doc(db, table, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error("Document does not exist");
    }
  },

  // Read all documents in a collection
  readAll: async ({ table }: { table: string }) => {
    const collectionRef = collection(db, table);
    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  // Update (Update specific fields in a document)
  update: async ({
    table,
    id,
    payload,
  }: {
    table: string;
    id: string;
    payload: any;
  }) => {
    const docRef = doc(db, table, id);
    await updateDoc(docRef, payload);
  },

  // Delete (Remove a document)
  delete: async ({ table, id }: { table: string; id: string }) => {
    const docRef = doc(db, table, id);
    await deleteDoc(docRef);
  },
};
