"use client";
import { useEffect, useState } from "react";
import { NewsletterService, TNewsletter } from "@/services/newsletter";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Skeleton,
  CardMedia,
} from "@mui/material";

import { useAuthListener } from "@/hooks/useAuth";
import { sendPushNotification } from "@/utils/sendPushNotification";
import { v4 as uuidv4 } from "uuid";

export default function Newsletters() {
  const authUser = useAuthListener();
  const [newsletters, setNewsletters] = useState<TNewsletter[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isLoadingNewsletters, setIsLoadingNewsletters] = useState(true);
  const [isCreatingNewsletters, setIsCreatingNewsletters] = useState(false);

  const getNewsletters = async () => {
    if (!authUser?.uid) return;

    try {
      const newsletters = await NewsletterService.list(authUser.uid);
      setNewsletters(newsletters);
    } catch (error) {
      console.error("Failed to fetch files:", error.message);
    } finally {
      setIsLoadingNewsletters(false);
    }
  };

  const handleCreateNewsletter = async () => {
    if (!authUser?.uid) return;

    if (!title || !description) {
      setError("Required fields are missing!");
      return;
    }

    try {
      setIsCreatingNewsletters(true);
      setError("");

      const payload = await NewsletterService.create(authUser.uid, imageFile, {
        title,
        description,
      });

      setNewsletters((prev) => [...prev, { ...payload, id: uuidv4() }]);

      await sendPushNotification({
        token: "ExponentPushToken[iccr-DFkR16Trz1eL8DMhc]",
        title,
        description,
        urlToNavigate: `/newsletters/${authUser.uid}`,
      });
    } catch (error) {
      setError(
        error?.message || "An error occurred while creating the newsletter."
      );
    } finally {
      setIsCreatingNewsletters(false);
    }
  };

  useEffect(() => {
    getNewsletters();
  }, [authUser]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        height: "100vh",
        width: "100vw",
      }}
    >
      <Box>
        <Typography>Minhas notícias</Typography>

        <Box
          style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
        >
          {isLoadingNewsletters && (
            <Skeleton variant="rectangular" width="100%" height={118} />
          )}

          {!isLoadingNewsletters && (
            <>
              {newsletters.map((newsletter) => (
                <Card
                  key={newsletter.id}
                  sx={{
                    background: "none",
                    border: "1px solid #ddd",
                    width: 275,
                  }}
                >
                  {newsletter.image_url && (
                    <CardMedia
                      sx={{ height: 140, width: "100%" }}
                      image={newsletter.image_url}
                      title="Newsletter image"
                    />
                  )}

                  <CardContent>
                    <Typography color="#000000" fontSize="14">
                      {newsletter.title}
                    </Typography>

                    <Typography fontSize="12" color="#000000">
                      {newsletter.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </Box>
      </Box>

      <Box>
        <Typography>Criar nova notícia</Typography>

        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          width="100%"
          maxWidth="400px"
          gap={2}
        >
          {error && <Typography color="error">{error}</Typography>}

          <TextField
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />

          <TextField
            label="Descrição"
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
            variant="contained"
            fullWidth
            disabled={isCreatingNewsletters}
            onClick={handleCreateNewsletter}
          >
            {isCreatingNewsletters ? (
              <CircularProgress size={24} />
            ) : (
              "Cria notícia"
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
