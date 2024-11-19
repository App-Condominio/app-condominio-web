import Layout from "@/component/layout";
import { useAuthListener } from "@/hooks/useAuth";
import type { AppProps } from "next/app";
import { PaletteMode, ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useState } from "react";

export default function MyApp({ Component, pageProps }: AppProps) {
  const user = useAuthListener();
  const [theme, setTheme] = useState<PaletteMode | undefined>(() => {
    if (typeof window !== "undefined") {
      const storageTheme = localStorage.getItem("theme");
      return (storageTheme as PaletteMode) || "dark";
    }
  });

  const darkTheme = createTheme({
    palette: {
      mode: theme,
    },
  });

  const handleThemeChange = (theme: PaletteMode) => {
    setTheme(theme);
    localStorage.setItem("theme", theme);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Layout
        user={user}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
      >
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
