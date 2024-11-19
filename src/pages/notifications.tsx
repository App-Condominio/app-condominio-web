"use client";
import { Box, Button, Typography } from "@mui/material";

export default function Dashboard() {
  const sendPushNotification = async (token: string) => {
    await fetch("/api/pushNotifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  };
  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <Typography variant="h4">Notificações</Typography>
      <Button
        onClick={() =>
          sendPushNotification("ExponentPushToken[iccr-DFkR16Trz1eL8DMhc]")
        }
      >
        Enviar notificação
      </Button>
    </Box>
  );
}
