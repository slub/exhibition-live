import {
  AdbProvider,
  QueryClient,
  QueryClientProvider,
  store,
} from "@slub/edb-state-hooks";
import { Provider } from "react-redux";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/de";
import "dayjs/locale/en";
import { BASE_IRI, PUBLIC_BASE_PATH } from "../components/config";
import { EditEntityModal } from "../components/form/edit/EditEntityModal";
import { SnackbarProvider } from "notistack";
import { useRouterHook } from "./useRouterHook";
import ThemeComponent from "../components/theme/ThemeComponent";
import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import SemanticJsonForm from "../components/form/SemanticJsonForm";
import { exhibitionConfig } from "../components/config/exhibitionAppConfig";
import { envToSparqlEndpoint } from "@slub/edb-ui-utils";
import { EntityDetailModal } from "@slub/edb-advanced-components";

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
        </Provider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
};
