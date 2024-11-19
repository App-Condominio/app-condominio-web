"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { CondominiumService, TNewsletter } from "@/services/condominium";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useAuthListener } from "@/hooks/useAuth";

export default function Newsletters() {
  const [newsletters, setNewsletters] = useState<TNewsletter[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const authUser = useAuthListener();

  const getNewsletters = async () => {
    if (!authUser?.uid) return;

    try {
      const newsletters = await CondominiumService.listNewsletters(
        authUser.uid
      );
      setNewsletters(newsletters);
    } catch (error) {
      console.error("Failed to fetch files:", error.message);
    }
  };

  const handleCreateNewsletter = async () => {
    if (!authUser?.uid) return;

    if (!title || !description || !imageFile) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await CondominiumService.createNewsletter(authUser.uid, imageFile, {
        title,
        description,
      });
    } catch (error) {
      setError(
        error?.message || "An error occurred while creating the newsletter."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNewsletters();
  }, [authUser]);

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
        {newsletters.map((newsletter) => (
          <div key={newsletter.title}>
            <Image
              src={newsletter.url}
              alt="Newsletter image"
              width={200}
              height={200}
            />
            <span style={{ color: "#000000" }}>{newsletter.title}</span>
          </div>
        ))}
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        width="100%"
        maxWidth="400px"
        gap={2}
      >
        <Typography variant="h4">Create Newsletter</Typography>
        {error && <Typography color="error">{error}</Typography>}

        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={4}
          fullWidth
        />
        <Button variant="outlined" component="label" fullWidth>
          Upload Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </Button>
        {imageFile && (
          <Typography variant="body2" color="textSecondary">
            Selected file: {imageFile.name}
          </Typography>
        )}

        <Button
          onClick={handleCreateNewsletter}
          variant="contained"
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Create"}
        </Button>
      </Box>
    </Box>
  );
}
