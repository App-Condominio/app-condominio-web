// pages/signup.js
"use client";
import { useState } from "react";
import { AuthService } from "@/services/auth";
import { Box, TextField, Button, Typography } from "@mui/material";
import { CondominiumService } from "@/services/condominium";
import { useRouter } from "next/router";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      const user = await AuthService.signUp(email, password);
      await CondominiumService.createOrUpdate({ name }, user.user.uid);
      router.replace("/dashboard");
    } catch (error) {
      setError(error.message);
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
        <Typography variant="h4">Cadastrar condominio</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <TextField
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <TextField
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        <Button onClick={handleSignUp} variant="contained">
          Criar conta
        </Button>
      </Box>
    </Box>
  );
}
