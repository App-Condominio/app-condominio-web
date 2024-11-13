import { useAuthListener } from "@/hooks/useAuth";
import type { AppProps } from "next/app";

export default function MyApp({ Component, pageProps }: AppProps) {
  useAuthListener();

  return <Component {...pageProps} />;
}
