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
  create: async ({
    name,
    condominium_ids,
    booking_advance_limit_days,
    period,
    availability,
  }: Omit<TResource, "id">) => {
    if (
      !name ||
      condominium_ids.length === 0 ||
      Object.keys(availability).length === 0
    ) {
      throw new Error("Dados obrigatórios ausentes.");
    }

    const payload = {
      name,
      condominium_ids,
      booking_advance_limit_days,
      period,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, Tables.Resources), payload);
    return { id: docRef.id, ...payload };
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
