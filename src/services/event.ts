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
  id?: string;
  condominium_id: string;
  resource_ids: string[];
  type: "daily" | "hourly";
  status: "closed" | "open";
  date: string | string[]; // Data(s) do evento (formato: "YYYY-MM-DD")
  start_time?: string | null; // Horário de início (formato: "HH:mm", obrigatório para eventos "hourly")
  end_time?: string | null; // Horário de término (formato: "HH:mm", obrigatório para eventos "hourly")
  created_at: string; // Data de criação do evento (formato ISO 8601)
  updated_at?: string | null; // Data da última atualização (formato ISO 8601, opcional)
};

const validateEvent = (event: TEvent) => {
  if (event.type === "hourly" && (!event.start_time || !event.end_time)) {
    throw new Error("Eventos 'hourly' precisam de 'start_time' e 'end_time'.");
  }

  if (
    event.status === "open" &&
    event.type === "daily" &&
    (!event.start_time || !event.end_time)
  ) {
    throw new Error(
      "Eventos 'open - daily' precisam de 'start_time' e 'end_time'."
    );
  }

  if (event.resource_ids.length === 0) {
    throw new Error("O evento deve estar associado a pelo menos um recurso.");
  }
};

export const EventService = {
  create: async (event: TEvent) => {
    validateEvent(event);

    // Se for um evento "daily" com múltiplas datas, cria eventos para cada dia
    const eventDates = Array.isArray(event.date) ? event.date : [event.date];
    const createdEvents = [];

    for (const date of eventDates) {
      const newEvent = {
        condominium_id: event.condominium_id,
        resource_ids: event.resource_ids,
        type: event.type,
        status: event.status,
        start_time: event.start_time,
        end_time: event.end_time,
        date,
        created_at: new Date().toISOString(),
        update_at: new Date().toISOString(),
      };

      const eventRef = await addDoc(collection(db, Tables.Events), newEvent);
      createdEvents.push({ id: eventRef.id, ...newEvent });
    }

    return createdEvents;
  },

  list: async (condominiumId: string, resourceId?: string) => {
    let eventsQuery = query(
      collection(db, Tables.Events),
      where("condominium_id", "==", condominiumId)
    );

    if (resourceId) {
      eventsQuery = query(
        eventsQuery,
        where("resource_ids", "array-contains", resourceId)
      );
    }

    const snapshot = await getDocs(eventsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  update: async (eventId: string, updatedData: Partial<TEvent>) => {
    validateEvent({ ...updatedData, id: eventId } as TEvent);

    const eventDoc = doc(db, Tables.Events, eventId);
    await updateDoc(eventDoc, {
      ...updatedData,
      updated_at: new Date().toISOString(),
    });

    return { id: eventId, ...updatedData };
  },

  delete: async (eventId: string) => {
    const eventDoc = doc(db, Tables.Events, eventId);
    await deleteDoc(eventDoc);
    return { success: true, id: eventId };
  },
};
