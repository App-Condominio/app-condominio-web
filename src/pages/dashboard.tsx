"use client";
import { AuthService } from "@/services/auth";
import { Box, Typography, Button } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
      router.replace("/signin");
    } catch (error) {
      console.error("Sign-out error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <Typography variant="h4">Dashboard</Typography>
      <Button variant="contained" onClick={handleSignOut} disabled={loading}>
        {loading ? "Signing out..." : "Sign Out"}
      </Button>
    </Box>
  );
}
