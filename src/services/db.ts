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
  query,
  QueryFieldFilterConstraint,
  addDoc,
} from "firebase/firestore";

export const DBService = {
  create: async <T>({
    table,
    payload,
  }: {
    table: string;
    payload: { [x: string]: T };
  }) => {
    await addDoc(collection(db, table), payload);
  },

  // Update (Update specific fields in a document)
  update: async <T>({
    table,
    id,
    payload,
  }: {
    table: string;
    id: string;
    payload: { [x: string]: T };
  }) => {
    const docRef = doc(db, table, id);
    await updateDoc(docRef, payload);
  },

  // Create or Update (Upsert)
  upsert: async <T>({
    table,
    id,
    payload,
  }: {
    table: string;
    id: string;
    payload: { [x: string]: T };
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

  // Read all documents in a collection according to the specified constraint
  readAll: async ({
    table,
    q,
  }: {
    table: string;
    q: QueryFieldFilterConstraint;
  }) => {
    const collectionRef = collection(db, table);
    const collectionQuery = query(collectionRef, q);
    const querySnapshot = await getDocs(collectionQuery);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Delete (Remove a document)
  delete: async ({ table, id }: { table: string; id: string }) => {
    const docRef = doc(db, table, id);
    await deleteDoc(docRef);
  },
};
