import { AdbProvider, store } from "@slub/edb-state-hooks";
import { Provider } from "react-redux";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/de";
import "dayjs/locale/en";
import { BASE_IRI, PUBLIC_BASE_PATH } from "../components/config";
import { EditEntityModal } from "../components/form/edit/EditEntityModal";
import { SnackbarProvider } from "notistack";
import { useRouterHook } from "./useRouterHook";
import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { exhibitionConfig } from "../components/config/exhibitionAppConfig";
import { kulinarikAppConfig } from "../components/config/kulinarikAppConfig";
import { envToSparqlEndpoint } from "@slub/edb-ui-utils";
import { EntityDetailModal } from "@slub/edb-advanced-components";
import { SimilarityFinder } from "../components/form/similarity-finder";
import { SemanticJsonFormNoOps } from "@slub/edb-linked-data-renderer";
import { GoogleOAuthProvider } from "@react-oauth/google";
import NiceModal from "@ebay/nice-modal-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeComponent } from "@slub/edb-default-theme";

import "react-json-view-lite/dist/index.css";
import { availableAuthorityMappings } from "@slub/exhibition-schema";

export const queryClient = new QueryClient();

const sparqlEndpoint = envToSparqlEndpoint(import.meta.env, "VITE");
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const appConfig =
  import.meta.env.VITE_APP_MANIFESTATION === "kulinarik"
    ? kulinarikAppConfig
    : exhibitionConfig;

export const App = ({ children }: { children?: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient} contextSharing={true}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Provider store={store}>
          <ThemeComponent>
            <SnackbarProvider>
              <AdbProvider
                {...appConfig}
                lockedSPARQLEndpoint={sparqlEndpoint}
                env={{
                  publicBasePath: PUBLIC_BASE_PATH,
                  baseIRI: BASE_IRI,
                }}
                components={{
                  EntityDetailModal: EntityDetailModal,
                  EditEntityModal: EditEntityModal,
                  SemanticJsonForm: SemanticJsonFormNoOps,
                  SimilarityFinder: SimilarityFinder,
                }}
                useRouterHook={useRouterHook}
                normDataMapping={availableAuthorityMappings}
              >
                <GoogleOAuthProvider clientId={googleClientId}>
                  <NiceModal.Provider>{children}</NiceModal.Provider>
                </GoogleOAuthProvider>
              </AdbProvider>
            </SnackbarProvider>
          </ThemeComponent>
        </Provider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
};
