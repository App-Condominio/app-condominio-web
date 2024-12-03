// services/resource.ts
import { db } from "@/config/firebaseClient";
import { Tables } from "@/constants";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { DBService } from "./db";

export type TResource = {
  id: string;
  name: string;
  condominium_ids: string[];
  booking_advance_limit_days?: number;
  period: "hourly" | "daily";
  availability: {
    [day: string]: {
      start: string;
      end: string;
    };
  };
  created_at: string;
  updated_at?: string;
};

export const ResourceService = {
  // Cria um novo recurso
  create: async (resource: Omit<TResource, "id">) => {
    if (
      !resource.name ||
      resource.condominium_ids.length === 0 ||
      Object.keys(resource.availability).length === 0
    ) {
      throw new Error("Dados obrigatórios ausentes.");
    }

    const newResource = {
      ...resource,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, Tables.Resources), newResource);
    return { id: docRef.id, ...newResource };
  },

  list: async (condominiumId: string) => {
    const resourcesQuery = query(
      collection(db, Tables.Resources),
      where("condominium_ids", "array-contains", condominiumId)
    );

    const snapshot = await getDocs(resourcesQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TResource[];
  },

  update: async (resourceId: string, updatedData: Partial<TResource>) => {
    const resourceDoc = doc(db, Tables.Resources, resourceId);
    await updateDoc(resourceDoc, {
      ...updatedData,
      updated_at: new Date().toISOString(),
    });

    return { id: resourceId, ...updatedData };
  },

  delete: async (resourceId: string) => {
    const resourceDoc = doc(db, Tables.Resources, resourceId);
    await deleteDoc(resourceDoc);
    return { success: true, id: resourceId };
  },

  getById: async (resourceId: string) => {
    return await DBService.read({ table: Tables.Resources, id: resourceId });
  },
};
