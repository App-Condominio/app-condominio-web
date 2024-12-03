import { useEffect, useState } from "react";
import { EventService, TEvent } from "@/services/event";
import { DBService } from "@/services/db";
import { Tables } from "@/constants";
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { where } from "firebase/firestore";
import { useAuthListener } from "@/hooks/useAuth";
import { TResource } from "@/services/resource";

export default function EventsPage() {
  const authUser = useAuthListener();
  const [events, setEvents] = useState<TEvent[]>([]);
  const [resources, setResources] = useState<TResource[]>([]);
  const [form, setForm] = useState<Partial<TEvent>>({
    condominium_id: authUser?.uid || "",
    resource_ids: [],
    type: "daily",
    status: "closed",
    date: "",
    start_time: "",
    end_time: "",
  });

  const isHourlyOrOpenDaily = form.type === "hourly" || form.status === "open";

  const isTimeRequired =
    isHourlyOrOpenDaily && (!form.start_time || !form.end_time);

  const getResourceNames = (resourceIds: string[]) => {
    return resourceIds
      .map((id) => resources.find((res) => res.id === id)?.name || "")
      .join(", ");
  };

  const getResources = async () => {
    try {
      const allResources = (await DBService.readAll({
        table: Tables.Resources,
        queries: [where("condominium_ids", "array-contains", authUser!.uid)],
      })) as TResource[];

      setResources(allResources);
    } catch (error) {
      console.error("Erro ao buscar recursos", error);
    }
  };

  const getEvents = async () => {
    try {
      const eventsList = await EventService.list(authUser!.uid);
      setEvents(eventsList as TEvent[]);
    } catch {
      console.error("Erro ao buscar eventos");
    }
  };

  useEffect(() => {
    if (!authUser?.uid) return;

    getResources();
    getEvents();
  }, [authUser]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setForm({ ...form, [field]: value });
  };

  const handleResourceChange = (resourceId: string) => {
    setForm((prev) => {
      if (!prev.resource_ids) {
        return {
          ...prev,
          resource_ids: [resourceId],
        };
      }

      return {
        ...prev,
        resource_ids: prev.resource_ids.includes(resourceId)
          ? prev.resource_ids.filter((id) => id !== resourceId)
          : [...prev.resource_ids, resourceId],
      };
    });
  };

  const handleSubmit = async () => {
    if (isTimeRequired) {
      console.error("Hora de início e término são obrigatórios.");
      return;
    }

    try {
      await EventService.create(form as TEvent);
      console.log("Evento criado com sucesso!");
      getEvents();
      setForm({
        condominium_id: authUser?.uid || "",
        resource_ids: [],
        type: "daily",
        status: "closed",
        date: "",
        start_time: "",
        end_time: "",
      });
    } catch {
      console.error("Erro ao criar evento");
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", padding: 4 }}>
      <Typography variant="h4" mb={3}>
        Eventos
      </Typography>

      <Box mb={4}>
        <Typography variant="h6">Eventos Criados:</Typography>
        {events.length > 0 ? (
          events.map((event) => (
            <Box
              key={event.id}
              sx={{
                mb: 2,
                p: 2,
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <Typography>Data: {event.date}</Typography>
              <Typography>Tipo: {event.type}</Typography>
              <Typography>Status: {event.status}</Typography>
              <Typography>
                Recursos: {getResourceNames(event.resource_ids)}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography>Sem eventos cadastrados.</Typography>
        )}
      </Box>

      <Typography variant="h6" mb={2}>
        Criar Novo Evento
      </Typography>

      <TextField
        label="Data"
        type="date"
        value={form.date || ""}
        onChange={(e) => handleInputChange("date", e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">Status:</Typography>
        <Select
          value={form.status}
          onChange={(e) => handleInputChange("status", e.target.value)}
          fullWidth
        >
          <MenuItem value="closed">Fechado</MenuItem>
          <MenuItem value="open">Aberto</MenuItem>
        </Select>
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={form.type === "hourly"}
            onChange={() =>
              handleInputChange(
                "type",
                form.type === "hourly" ? "daily" : "hourly"
              )
            }
          />
        }
        label="Evento Horário"
      />

      {isHourlyOrOpenDaily && (
        <>
          <TextField
            label="Hora de Início"
            type="time"
            value={form.start_time || ""}
            onChange={(e) => handleInputChange("start_time", e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Hora de Término"
            type="time"
            value={form.end_time || ""}
            onChange={(e) => handleInputChange("end_time", e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
        </>
      )}

      <Typography variant="h6">Recursos:</Typography>
      {resources.length > 0 ? (
        resources.map((resource) => (
          <FormControlLabel
            key={resource.id}
            control={
              <Checkbox
                checked={form.resource_ids?.includes(resource.id)}
                onChange={() => handleResourceChange(resource.id)}
              />
            }
            label={resource.name}
          />
        ))
      ) : (
        <Typography>Sem recursos disponíveis.</Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSubmit}
      >
        Criar Evento
      </Button>
    </Box>
  );
}
