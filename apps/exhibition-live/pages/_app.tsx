import "../styles/globals.css";
import "../styles/jquery.typeahead.min.css";
import "../styles/jquery-ui.min.css";
import "../styles/highlight.min.css";
import "../styles/tooltipster.bundle.min.css";
import "../styles/tooltipster-sideTip-shadow.min.css";
import "../styles/layout.css";
import "../styles/temp.css";
import "leaflet/dist/leaflet.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";

import ThemeComponent from "../components/theme/ThemeComponent";
import NiceModal from "@ebay/nice-modal-react";
import { SnackbarProvider } from "notistack";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { appWithTranslation, UserConfig } from "next-i18next";
import nextI18NextConfig from "../next-i18next.config";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AdbProvider } from "../components/provider/adbContext";
import {LocalizationProvider} from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export const queryClient = new QueryClient();
const QueryClientProviderWrapper = ({
  children,
}: {
  children: React.ReactChild;
}) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProviderWrapper>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeComponent>
          <SnackbarProvider>
            <NiceModal.Provider>
              <GoogleOAuthProvider
                clientId={process.env.NEXT_PUBLIC_GAPI_OAUTH_CLIENT_ID}
              >
                <AdbProvider>{<Component {...pageProps} />}</AdbProvider>
              </GoogleOAuthProvider>
            </NiceModal.Provider>
          </SnackbarProvider>
        </ThemeComponent>
        <ReactQueryDevtools initialIsOpen={false} />
      </LocalizationProvider>
    </QueryClientProviderWrapper>
  );
}

export default appWithTranslation(App, nextI18NextConfig as any as UserConfig);
