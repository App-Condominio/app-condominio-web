import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
} from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import { useBookings } from "./useBookings";
import dayjs from "dayjs";

export default function BookingCalendar() {
  const {
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
  } = useBookings();

  return (
    <Box sx={{ p: 3 }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable
        select={handleDateSelect}
        events={bookings}
        dayCellClassNames={({ date }) =>
          dayjs(date).isBefore(dayjs(), "day") ? "fc-day-disabled" : ""
        }
      />

      <Dialog open={openModal} onClose={resetModalInfo} maxWidth="sm" fullWidth>
        <DialogTitle>Criar novo agendamento</DialogTitle>

        {isLoadingModalInfo && <CircularProgress size={30} />}

        {!isLoadingModalInfo && (
          <>
            <DialogContent>
              <Autocomplete
                options={users}
                getOptionLabel={(option) => option.name}
                value={selectedUser}
                onChange={(event, newValue) => setSelectedUser(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Selecione o morador"
                    fullWidth
                  />
                )}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Espaços</InputLabel>
                <Select
                  value={selectedResource?.id || ""}
                  onChange={handleSelectResource}
                >
                  {resources.map((resource) => (
                    <MenuItem key={resource.id} value={resource.id}>
                      {resource.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {isResourceHourly && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Horários</InputLabel>
                  <Select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                  >
                    {timeSlots.map((slot) => (
                      <MenuItem key={slot} value={slot}>
                        {slot}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={resetModalInfo}>Cancel</Button>
              <Button onClick={handleAddBooking} variant="contained">
                Criar agendamento
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
