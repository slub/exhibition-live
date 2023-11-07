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

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";

import { FormRefsProvider } from "../components/provider/formRefsContext";
import ThemeComponent from "../components/theme/ThemeComponent";
import NiceModal from "@ebay/nice-modal-react";

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
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <QueryClientProviderWrapper>
        <FormRefsProvider>
          <ThemeComponent>
            <NiceModal.Provider>{<Component {...pageProps} />}</NiceModal.Provider>
          </ThemeComponent>
        </FormRefsProvider>
      </QueryClientProviderWrapper>
    </>
  );
}
