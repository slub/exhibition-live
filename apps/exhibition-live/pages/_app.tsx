import "../styles/globals.css";
import "../styles/jquery.typeahead.min.css";
import "../styles/jquery-ui.min.css";
import "../styles/highlight.min.css";
import "../styles/tooltipster.bundle.min.css";
import "../styles/tooltipster-sideTip-shadow.min.css";
import "../styles/layout.css";
import "../styles/temp.css";
import "leaflet/dist/leaflet.css";
import "../components/i18n/i18n";
import { appWithI18Next } from "ni18n";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";

import { FormRefsProvider } from "../components/provider/formRefsContext";
import ThemeComponent from "../components/theme/ThemeComponent";
import { ni18n } from "../components/i18n";
import NiceModal from "@ebay/nice-modal-react";
import { SnackbarProvider } from "notistack";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

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
    <>
      <QueryClientProviderWrapper>
        <>
          <FormRefsProvider>
            <ThemeComponent>
              <SnackbarProvider>
                <NiceModal.Provider>
                  {<Component {...pageProps} />}
                </NiceModal.Provider>
              </SnackbarProvider>
            </ThemeComponent>
          </FormRefsProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </>
      </QueryClientProviderWrapper>
    </>
  );
}

export default appWithI18Next(App, ni18n);
