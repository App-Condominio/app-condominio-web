// pages/signin.js
"use client";
import { useState } from "react";
import { AuthService } from "@/services/auth";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useRouter } from "next/router";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await AuthService.signIn(email, password);
      router.replace("/dashboard");
    } catch (error) {
      setError(error?.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        width="100%"
        maxWidth="400px"
        gap={2}
      >
        <Typography variant="h4">Login</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        <Button onClick={handleSignIn} variant="contained">
          Entrar
        </Button>
        <Typography>
          Não possui uma conta? <Link href="/signup">Crie uma agora.</Link>
        </Typography>
      </Box>
    </Box>
  );
}
