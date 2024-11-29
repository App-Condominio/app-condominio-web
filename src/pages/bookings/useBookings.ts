import { useState, useEffect } from "react";
import { where } from "firebase/firestore";
import { DBService } from "@/services/db";
import { BookingService, TBooking } from "@/services/booking";
import { TEvent } from "@/services/event";
import { useAuthListener } from "@/hooks/useAuth";

import { SelectChangeEvent } from "@mui/material";
import { Tables } from "@/constants";
import { formatDate } from "@/utils/formatDate";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

type User = {
  id: string;
  name: string;
};

type Resource = {
  id: string;
  name: string;
  period: "daily" | "hourly";
  booking_advance_limit_days: number | null;
  availability: {
    [dayOfWeek: string]: {
      start: string;
      end: string;
    };
  };
};

type Booking = Omit<TBooking, "date"> & {
  date: string;
  title: string;
  start: string;
};

export function useBookings() {
  const authUser = useAuthListener();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const [isLoadingModalInfo, setIsLoadingModalInfo] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [events, setEvents] = useState<TEvent[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [timeSlot, setTimeSlot] = useState("");

  const isResourceHourly = selectedResource?.period === "hourly";

  const getHourFromTime = (time: string) => Number(time.split(":")[0]);

  const handleDateSelect = async (selectionInfo: { start: Date }) => {
    if (dayjs(selectionInfo.start).isBefore(dayjs(), "day")) return;

    setSelectedDate(selectionInfo.start);
    setOpenModal(true);
    setIsLoadingModalInfo(true);

    try {
      const allUsers = await DBService.readAll({
        table: Tables.Users,
        queries: [where("condominium_id", "==", authUser!.uid)],
      });

      const allResources = (await DBService.readAll({
        table: Tables.Resources,
        queries: [where("condominium_ids", "array-contains", authUser!.uid)],
      })) as Resource[];

      const allEvents = (await DBService.readAll({
        table: Tables.Events,
        queries: [
          where("condominium_id", "==", authUser!.uid),
          where("date", "==", formatDate(selectionInfo.start)),
        ],
      })) as TEvent[];

      const validResources = allResources.filter((resource) => {
        const event = allEvents.find((event) =>
          event.resource_ids.includes(resource.id)
        );

        if (event && event.status === "closed" && event.type === "daily") {
          return false;
        }

        if (
          resource?.booking_advance_limit_days &&
          dayjs(selectionInfo.start).diff(dayjs(), "day") >
            resource.booking_advance_limit_days
        ) {
          return false;
        }

        return true;
      });

      setUsers(allUsers as User[]);
      setResources(validResources);
      setEvents(allEvents);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoadingModalInfo(false);
    }
  };

  const handleSelectResource = (e: SelectChangeEvent<string>) => {
    const selected = resources.find(({ id }) => id === e.target.value) || null;
    setSelectedResource(selected);
    generateTimeSlots(selected);
  };

  const generateTimeSlots = (selectedResource: Resource | null) => {
    if (!selectedResource || !selectedDate) {
      setTimeSlots([]);
      return;
    }

    let hasResourceOpenEvent = false;
    let temporaryOpenStartTime = "";
    let temporaryOpenEndTime = "";
    let temporaryCloseEndTime = "";

    for (const event of events) {
      const { start_time, end_time, status, type } = event;

      if (status === "open" && type === "daily" && start_time && end_time) {
        hasResourceOpenEvent = true;
        temporaryOpenStartTime = start_time;
        temporaryOpenEndTime = end_time;
        break;
      }

      if (status === "closed" && type === "hourly" && end_time) {
        temporaryCloseEndTime = end_time;
      }
    }

    const weekDay = selectedDate.toLocaleString("en-US", { weekday: "long" });
    const resourceSchedule = selectedResource.availability[weekDay];

    if (!resourceSchedule && !hasResourceOpenEvent) {
      setTimeSlots([]);
      return;
    }

    const timeSlots: string[] = [];
    const startHour = getHourFromTime(
      resourceSchedule?.start ?? temporaryOpenStartTime
    );
    const endHour = getHourFromTime(
      resourceSchedule?.end ?? temporaryOpenEndTime
    );
    const currentHour = dayjs().hour();
    const now = dayjs().startOf("day");
    const bookingDate = dayjs(selectedDate).startOf("day");

    for (let slot = startHour; slot < endHour; slot++) {
      if (temporaryCloseEndTime) {
        const eventEndHour = getHourFromTime(temporaryCloseEndTime);
        if (slot < eventEndHour) continue;
      }

      if (bookingDate.isSame(now) && slot <= currentHour) continue;

      timeSlots.push(`${slot.toString().padStart(2, "0")}:00`);
    }

    const slotsAlreadyFilled = bookings
      .filter(
        (booking) =>
          booking.resource_id === selectedResource.id &&
          dayjs(booking.date).isSame(bookingDate, "day")
      )
      .map((booking) => booking.start_time);

    setTimeSlots(
      timeSlots.filter((time) => !slotsAlreadyFilled.includes(time))
    );
  };

  const handleAddBooking = async () => {
    if (
      !selectedUser ||
      !selectedResource ||
      !selectedDate ||
      (isResourceHourly && !timeSlot)
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const payload = {
        condominium_id: authUser!.uid,
        user_id: selectedUser.id,
        user_name: selectedUser.name,
        resource_id: selectedResource.id,
        date: selectedDate,
        start_time: isResourceHourly ? timeSlot : null,
        end_time: isResourceHourly
          ? `${getHourFromTime(timeSlot) + 1}:00`
          : null,
      };

      const message = await BookingService.create(payload);
      const formattedDate = formatDate(payload.date);
      alert(message.message);
      setBookings((prev) => [
        ...prev,
        {
          id: uuidv4(),
          ...payload,
          date: formattedDate,
          title: payload.user_name,
          start: formattedDate,
        },
      ]);

      resetModalInfo();
    } catch (error) {
      console.error("Error creating booking:", error);
    }
  };

  const resetModalInfo = () => {
    setOpenModal(false);
    setSelectedUser(null);
    setSelectedResource(null);
    setTimeSlot("");
  };

  useEffect(() => {
    if (!authUser?.uid) return;

    const getBookings = async () => {
      try {
        const allBookings = (await DBService.readAll({
          table: Tables.Bookings,
          queries: [where("condominium_id", "==", authUser.uid)],
        })) as Booking[];

        const formattedBookings = allBookings.map((booking) => ({
          ...booking,
          title: booking.user_name,
          start: booking.date,
        }));

        setBookings(formattedBookings);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    getBookings();
  }, [authUser]);

  return {
    bookings,
    openModal,
    isLoadingModalInfo,
    resetModalInfo,
    users,
    selectedUser,
    setSelectedUser,
    resources,
    selectedResource,
    handleSelectResource,
    isResourceHourly,
    timeSlots,
    timeSlot,
    setTimeSlot,
    handleDateSelect,
    handleAddBooking,
  };
}
