import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdbProvider, store } from "@slub/edb-state-hooks";
import { Provider } from "react-redux";
import { envToSparqlEndpoint } from "../components/config/envToSparqlEndpoint";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/de";
import "dayjs/locale/en";
import { BASE_IRI, PUBLIC_BASE_PATH } from "../components/config";
import { EntityDetailModal } from "../components/form/show";
import { EditEntityModal } from "../components/form/edit/EditEntityModal";
import { SnackbarProvider } from "notistack";
import { useRouterHook } from "./useRouterHook";
import ThemeComponent from "../components/theme/ThemeComponent";
import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import SemanticJsonForm from "../components/form/SemanticJsonForm";
import { exhibitionConfig } from "../components/config/exhibitionAppConfig";

export const queryClient = new QueryClient();

const sparqlEndpoint = envToSparqlEndpoint(import.meta.env, "VITE");
export const App = ({ children }: { children?: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Provider store={store}>
          <ThemeComponent>
            <SnackbarProvider>
              <AdbProvider
                {...exhibitionConfig}
                lockedSPARQLEndpoint={sparqlEndpoint}
                env={{
                  publicBasePath: PUBLIC_BASE_PATH,
                  baseIRI: BASE_IRI,
                }}
                components={{
                  EntityDetailModal: EntityDetailModal,
                  EditEntityModal: EditEntityModal,
                  SemanticJsonForm: SemanticJsonForm,
                }}
                useRouterHook={useRouterHook}
              >
                {children}
              </AdbProvider>
            </SnackbarProvider>
          </ThemeComponent>
          <ReactQueryDevtools initialIsOpen={false} />
        </Provider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
};
