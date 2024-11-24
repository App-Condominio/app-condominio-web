"use client";
import { sendPushNotification } from "@/utils/sendPushNotification";
import { Box, Button, Typography } from "@mui/material";

export default function Settings() {
  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <Typography variant="h4">Configurações</Typography>
      <Button
        onClick={() =>
          sendPushNotification({
            token: "ExponentPushToken[iccr-DFkR16Trz1eL8DMhc]",
          })
        }
      >
        Enviar notificação
      </Button>
    </Box>
  );
}
