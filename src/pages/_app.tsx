import Layout from "@/component/layout";
import { useAuthListener } from "@/hooks/useAuth";
import type { AppProps } from "next/app";
import { PaletteMode, ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useState } from "react";

export default function MyApp({ Component, pageProps }: AppProps) {
  const user = useAuthListener();
  const [theme, setTheme] = useState<PaletteMode | undefined>("light");
  const darkTheme = createTheme({
    palette: {
      mode: theme,
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Layout user={user} setTheme={setTheme} currentTheme={theme}>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
