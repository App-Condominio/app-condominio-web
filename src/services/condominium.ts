import { auth, db } from "@/config/firebaseClient";
import { uploadFile } from "@/utils/uploadFile";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export type TCondominuim = {
  name: string;
};

export type TFile = {
  name: string;
  url: string;
  type: string;
  size: number;
  condominium_id: string;
  created_at: string;
};

export type TNewsletter = {
  title: string;
  descriptio: string;
  url: string;
  condominium_id: string;
  created_at: string;
};

export const CondominiumService = {
  createOrUpdate: async (payload: TCondominuim, id: string) => {
    await setDoc(doc(db, "condominiums", id), payload);
  },

  createNewsletter: async (
    condominium_id: string,
    file: File,
    newsletter: { title: string; description: string }
  ) => {
    const url = await uploadFile(`${condominium_id}/images`, file);

    const newsletterPayload = {
      ...newsletter,
      url,
      condominium_id,
      created_at: new Date().toISOString(),
    };

    await addDoc(collection(db, "newsletter"), newsletterPayload);
  },

  listNewsletters: async (condominium_id: string) => {
    const filesCollection = collection(db, "newsletter");
    const q = query(
      filesCollection,
      where("condominium_id", "==", condominium_id)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as TNewsletter), // Map Firestore documents to an object
    }));
  },

  createFile: async (condominium_id: string, file: File) => {
    const url = await uploadFile(`${condominium_id}/files`, file);

    const fileMetadata: TFile = {
      name: file.name,
      type: file.type,
      size: file.size,
      url,
      condominium_id,
      created_at: new Date().toISOString(),
    };

    await addDoc(collection(db, "files"), fileMetadata);
  },

  listFiles: async (condominium_id: string) => {
    const filesCollection = collection(db, "files");
    const q = query(
      filesCollection,
      where("condominium_id", "==", condominium_id)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as TFile), // Map Firestore documents to an object
    }));
  },
};
