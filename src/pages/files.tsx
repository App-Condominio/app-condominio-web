"use client";
import { useEffect, useState } from "react";
import { CondominiumService, TFile } from "@/services/condominium";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { useAuthListener } from "@/hooks/useAuth";

export default function Files() {
  const [files, setFiles] = useState<TFile[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const authUser = useAuthListener();

  const getFiles = async () => {
    if (!authUser?.uid) return;

    try {
      const files = await CondominiumService.listFiles(authUser.uid);
      setFiles(files);
    } catch (error) {
      console.error("Failed to fetch files:", error.message);
    }
  };

  const handleFileUpload = async () => {
    if (!authUser?.uid) return;

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await CondominiumService.createFile(authUser.uid, file);
    } catch (error) {
      setError(error?.message || "An error occurred while uploading the file.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFiles();
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
        backgroundColor="#000000"
        color="#fff"
      >
        {files.map((file) => (
          <div key={file.name}>
            <a href={file.url} target="_blank">
              {file.name}
            </a>
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
        <Typography variant="h4">Upload File</Typography>
        {error && <Typography color="error">{error}</Typography>}

        <Button variant="outlined" component="label" fullWidth>
          Select File
          <input
            type="file"
            hidden
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </Button>

        {file && (
          <Typography variant="body2" color="textSecondary">
            Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </Typography>
        )}

        <Button
          onClick={handleFileUpload}
          variant="contained"
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Upload"}
        </Button>
      </Box>
    </Box>
  );
}
