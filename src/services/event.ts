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

export type TEvent = {
  id: string;
  condominium_id: string;
  resource_ids: string[];
  type: "daily" | "hourly";
  status: "closed" | "open";
  date: string; // Data do evento (formato: "YYYY-MM-DD")
  start_time?: string | null; // Horário de início (formato: "HH:mm", obrigatório para eventos "hourly")
  end_time?: string | null; // Horário de término (formato: "HH:mm", obrigatório para eventos "hourly")
  created_at: string; // Data de criação do evento (formato ISO 8601)
  updated_at?: string | null; // Data da última atualização (formato ISO 8601, opcional)
};

export const EventService = {
  create: async (event: TEvent) => {
    // considerar evento como diário
    // se tiver mais de um dia criar um evento para cada dia
    // tipos de eventos aceitos ->
    // closed - daily
    // closed - hourly (precisa ter start_time e end_time)
    // open - daily (precisa ter start_time e end_time, pois será em um dia que não está no schedule)
    const eventRef = await addDoc(collection(db, Tables.Events), event);
    return eventRef;
  },

  list: async (condominiumId: string) => {
    const eventsQuery = query(
      collection(db, Tables.Events),
      where("condominium_id", "==", condominiumId)
    );

    const snapshot = await getDocs(eventsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  update: async (eventId: string, updatedData: TEvent) => {
    const eventDoc = doc(db, Tables.Events, eventId);
    await updateDoc(eventDoc, updatedData);
    return updatedData;
  },

  delete: async (eventId: string) => {
    const eventDoc = doc(db, Tables.Events, eventId);
    await deleteDoc(eventDoc);
    return { success: true, id: eventId };
  },
};
