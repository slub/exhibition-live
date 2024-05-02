import "../styles/jquery.typeahead.min.css";
import "../styles/jquery-ui.min.css";
import "../styles/highlight.min.css";
import "../styles/tooltipster.bundle.min.css";
import "../styles/tooltipster-sideTip-shadow.min.css";
import "@uiw/react-markdown-preview/markdown.css";
import "@uiw/react-md-editor/markdown-editor.css";
import "leaflet/dist/leaflet.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";

import ThemeComponent from "../components/theme/ThemeComponent";
import NiceModal from "@ebay/nice-modal-react";
import { SnackbarProvider } from "notistack";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { appWithTranslation, UserConfig, useTranslation } from "next-i18next";
import nextI18NextConfig from "../next-i18next.config";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AdbProvider } from "../components/state/provider/adbContext";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/de";
import "dayjs/locale/en";
import { useEffect } from "react";
import { Provider } from "react-redux";
import store from "../components/state/reducer/formStore";
import { OptionalLiveDemoEndpoint } from "../components/state/useOptionalLiveDemoEndpoint";
import {
  createNewIRI,
  defaultJsonldContext,
  defaultPrefix,
  defaultQueryBuilderOptions,
  sladb,
} from "../components/form/formConfigs";
import { envToSparqlEndpoint } from "../components/config/envToSparqlEndpoint";
import getConfig from "next/config";
import { BASE_IRI, PUBLIC_BASE_PATH } from "../components/config";

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

const sparqlEndpoint = envToSparqlEndpoint(getConfig().publicRuntimeConfig);

function App({ Component, pageProps }: AppProps) {
  const { i18n } = useTranslation();
  useEffect(() => {
    dayjs.locale(i18n.language in ["en", "de"] ? i18n.language : "en");
  }, [i18n.language]);
  return (
    <QueryClientProviderWrapper>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Provider store={store}>
          <ThemeComponent>
            <SnackbarProvider>
              <AdbProvider
                queryBuildOptions={defaultQueryBuilderOptions}
                typeNameToTypeIRI={(name: string) => sladb(name).value}
                createEntityIRI={createNewIRI}
                lockedSPARQLEndpoint={sparqlEndpoint}
                jsonLDConfig={{
                  defaultPrefix: defaultPrefix,
                  jsonldContext: defaultJsonldContext,
                  allowUnsafeSourceIRIs: false,
                }}
                env={{
                  publicBasePath: PUBLIC_BASE_PATH,
                  baseIRI: BASE_IRI,
                }}
              >
                <NiceModal.Provider>
                  <GoogleOAuthProvider
                    clientId={process.env.NEXT_PUBLIC_GAPI_OAUTH_CLIENT_ID}
                  >
                    <OptionalLiveDemoEndpoint>
                      {<Component {...pageProps} />}
                    </OptionalLiveDemoEndpoint>
                  </GoogleOAuthProvider>
                </NiceModal.Provider>
              </AdbProvider>
            </SnackbarProvider>
          </ThemeComponent>
          <ReactQueryDevtools initialIsOpen={false} />
        </Provider>
      </LocalizationProvider>
    </QueryClientProviderWrapper>
  );
}

export default appWithTranslation(App, nextI18NextConfig as any as UserConfig);
