import { useEffect, useState } from "react";
import { ResourceService, TResource } from "@/services/resource";
import { useAuthListener } from "@/hooks/useAuth";
import {
  Box,
  TextField,
  Button,
  Typography,
  FormGroup,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { WEEK_DAYS } from "@/constants";

export default function Resources() {
  const authUser = useAuthListener();
  const [resources, setResources] = useState<TResource[]>([]);
  const [form, setForm] = useState<Partial<TResource>>({
    condominium_ids: [authUser?.uid || ""],
    availability: {},
    booking_advance_limit_days: 0,
    name: "",
    period: "daily",
  });

  const getResources = async () => {
    try {
      const resourcesList = await ResourceService.list(authUser!.uid);
      setResources(resourcesList);
    } catch {
      // toast.error("Erro ao buscar recursos");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleAvailabilityChange = (
    day: string,
    start: string,
    end: string
  ) => {
    setForm((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: { start, end },
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      await ResourceService.create(form as TResource);
      // toast.success("Recurso criado com sucesso!");
      getResources();
      setForm({
        condominium_ids: [authUser?.uid || ""],
        availability: {},
        booking_advance_limit_days: 0,
        name: "",
        period: "daily",
      });
    } catch {
      // toast.error("Erro ao criar recurso");
    }
  };

  useEffect(() => {
    if (!authUser?.uid) return;
    getResources();
  }, [authUser]);

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", padding: 4 }}>
      <Typography variant="h4" mb={3}>
        Recursos
      </Typography>

      <Box mb={4}>
        <Typography variant="h6">Recursos Criados:</Typography>
        {resources.length > 0 ? (
          resources.map((resource) => (
            <Box
              key={resource.id}
              sx={{
                mb: 2,
                p: 2,
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <Typography>Nome: {resource.name}</Typography>
              <Typography>
                Limite de Agendamento Antecipado:{" "}
                {resource.booking_advance_limit_days || 30} dias
              </Typography>
              <Typography>Disponibilidade:</Typography>
              {Object.keys(resource.availability).map((day) => (
                <Typography key={day}>
                  {day}: {resource.availability[day].start} -{" "}
                  {resource.availability[day].end}
                </Typography>
              ))}
            </Box>
          ))
        ) : (
          <Typography>Sem recursos cadastrados.</Typography>
        )}
      </Box>

      <Typography variant="h6" mb={2}>
        Criar Novo Recurso
      </Typography>

      <TextField
        label="Nome"
        value={form.name || ""}
        onChange={(e) => handleInputChange("name", e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label="Limite de Agendamento Antecipado (dias)"
        type="number"
        value={form.booking_advance_limit_days || ""}
        onChange={(e) =>
          handleInputChange("booking_advance_limit_days", e.target.value)
        }
        fullWidth
        sx={{ mb: 2 }}
      />

      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend">Tipo de Agendamento</FormLabel>
        <RadioGroup
          row
          value={form.period}
          onChange={(e) => handleInputChange("period", e.target.value)}
        >
          <FormControlLabel value="daily" control={<Radio />} label="Diário" />
          <FormControlLabel
            value="hourly"
            control={<Radio />}
            label="Por Hora"
          />
        </RadioGroup>
      </FormControl>

      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
        Definir Disponibilidade
      </Typography>
      <FormGroup>
        {WEEK_DAYS.map(({ label, value }) => (
          <Box key={value} sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography>{label}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Início"
                type="time"
                value={form.availability?.[value]?.start || ""}
                onChange={(e) =>
                  handleAvailabilityChange(
                    value,
                    e.target.value,
                    form.availability?.[value]?.end || ""
                  )
                }
                fullWidth
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Término"
                type="time"
                value={form.availability?.[value]?.end || ""}
                onChange={(e) =>
                  handleAvailabilityChange(
                    value,
                    form.availability?.[value]?.start || "",
                    e.target.value
                  )
                }
                fullWidth
              />
            </Box>
          </Box>
        ))}
      </FormGroup>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSubmit}
      >
        Criar Recurso
      </Button>
    </Box>
  );
}
