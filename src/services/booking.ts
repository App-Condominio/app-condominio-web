import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { db } from "@/config/firebaseClient";
import { Tables } from "@/constants";
import dayjs from "dayjs";
import { formatDate } from "@/utils/formatDate";

export type TBooking = {
  id?: string;
  condominium_id: string;
  user_id: string;
  user_name: string;
  resource_id: string;
  date: Date;
  start_time: string | null;
  end_time: string | null;
};

export const BookingService = {
  create: async ({
    condominium_id,
    resource_id,
    user_id,
    user_name,
    date,
    start_time,
    end_time,
  }: TBooking) => {
    if (!condominium_id || !resource_id || !user_id || !user_name || !date) {
      throw new Error("Dados obrigatórios ausentes.");
    }

    if (start_time && end_time && start_time >= end_time) {
      throw new Error(
        "Horário de início deve ser anterior ao horário de término."
      );
    }

    const now = dayjs().startOf("day");
    const bookingDate = dayjs(date).startOf("day");
    const bookingDateString = formatDate(date);
    const currentHour = dayjs().hour();

    if (bookingDate.isBefore(now)) {
      throw new Error(
        "Data do agendamento deve ser igual ou posterior à data atual."
      );
    }

    const condominiumDoc = await getDoc(
      doc(db, Tables.Condominiums, condominium_id)
    );
    const condominiumData = condominiumDoc.data();
    if (!condominiumData) {
      throw new Error("Condomínio não encontrado ou sem dados.");
    }

    const resourceDoc = await getDoc(doc(db, Tables.Resources, resource_id));
    const resourceData = resourceDoc.data();
    if (!resourceData) {
      throw new Error("Recurso não encontrado ou sem dados.");
    }

    const {
      availability: resourceAvailability,
      period: resourcePeriod,
      booking_advance_limit_days,
    } = resourceData;

    if (start_time && resourcePeriod === "hourly" && bookingDate.isSame(now)) {
      const bookingHour = Number(start_time.split(":")[0]);

      if (bookingHour <= currentHour) {
        throw new Error(
          "O horário da reserva não pode ser anterior ao horário atual."
        );
      }
    }

    if (booking_advance_limit_days) {
      const maxBookingDate = now.add(booking_advance_limit_days, "day");
      if (bookingDate.isAfter(maxBookingDate)) {
        throw new Error(
          `Este recurso só pode ser reservado com até ${booking_advance_limit_days} dias de antecedência.`
        );
      }
    }

    const resourceEventsSnapshot = await getDocs(
      query(
        collection(db, Tables.Events),
        where("condominium_id", "==", condominium_id),
        where("resource_ids", "array-contains", resource_id),
        where("date", "==", bookingDateString)
      )
    );

    let hasResourceClosedEvent = false;
    let hasResourceOpenEvent = false;
    let temporaryOpenStartTime = "";
    let temporaryOpenEndTime = "";
    let temporaryCloseEndTime: string | null = null;

    for (const event of resourceEventsSnapshot.docs) {
      const {
        start_time: eventStartTime,
        end_time: eventEndTime,
        status,
        type,
      } = event.data();

      if (status === "closed" && type === "daily") {
        hasResourceClosedEvent = true;
        break;
      }

      if (
        status === "open" &&
        type === "daily" &&
        eventStartTime &&
        eventEndTime
      ) {
        hasResourceOpenEvent = true;
        temporaryOpenStartTime = eventStartTime;
        temporaryOpenEndTime = eventEndTime;
        break;
      }

      if (status === "closed" && type === "hourly" && eventEndTime) {
        temporaryCloseEndTime = eventEndTime;
      }
    }

    if (hasResourceClosedEvent && !hasResourceOpenEvent) {
      throw new Error(
        "O recurso está fechado neste dia por causa de um evento."
      );
    }

    const weekDay = date.toLocaleString("en-US", { weekday: "long" });
    const resourceSchedule = resourceAvailability[weekDay];

    if (!resourceSchedule && !hasResourceOpenEvent) {
      throw new Error("O recurso está fechado nesse dia.");
    }

    if (resourcePeriod === "hourly" && start_time && end_time) {
      const startHour = resourceSchedule?.start ?? temporaryOpenStartTime;
      const endHour = resourceSchedule?.end ?? temporaryOpenEndTime;

      if (start_time < startHour || start_time >= endHour) {
        throw new Error("Horário fora do funcionamento do recurso.");
      }
    }

    const activeBookings = await getDocs(
      query(
        collection(db, Tables.Bookings),
        where("condominium_id", "==", condominium_id),
        where("resource_id", "==", resource_id),
        where("date", ">=", formatDate(new Date()))
      )
    );

    for (const booking of activeBookings.docs) {
      const {
        user_id: activeBookingUserId,
        date: activeBookingDate,
        start_time: activeBookingStartTime,
        end_time: activeBookingEndTime,
      } = booking.data();

      if (resourcePeriod === "daily") {
        if (activeBookingUserId === user_id) {
          throw new Error(
            "Não é possível ter mais de um agendamento ativo para este recurso."
          );
        }

        if (activeBookingDate === bookingDateString) {
          throw new Error("Já existe um agendamento para este dia.");
        }
      }

      if (resourcePeriod === "hourly") {
        const bookingEndHour = Number(activeBookingEndTime.split(":")[0]);

        if (activeBookingUserId === user_id && bookingEndHour >= currentHour) {
          throw new Error(
            "Não é possível ter mais de um agendamento ativo para este recurso."
          );
        }

        if (
          activeBookingDate === bookingDateString &&
          activeBookingStartTime === start_time &&
          activeBookingEndTime === end_time
        ) {
          throw new Error("Já existe um agendamento para este horário.");
        }
      }
    }

    await addDoc(collection(db, Tables.Bookings), {
      condominium_id,
      resource_id,
      user_id,
      user_name,
      date: bookingDateString,
      start_time,
      end_time,
    });

    return {
      success: true,
      message:
        resourcePeriod === "daily" && temporaryCloseEndTime
          ? `Agendamento criado com sucesso. O recurso estará disponível a partir das ${temporaryCloseEndTime}.`
          : "Agendamento criado com sucesso.",
    };
  },
};
