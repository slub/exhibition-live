import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdbProvider, store } from "@slub/edb-state-hooks";
import { Provider } from "react-redux";
import { envToSparqlEndpoint } from "../components/config/envToSparqlEndpoint";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { schema } from "@slub/exhibition-schema";
import "dayjs/locale/de";
import "dayjs/locale/en";
import {
  createNewIRI,
  defaultJsonldContext,
  defaultPrefix,
  defaultQueryBuilderOptions,
  sladb,
} from "../components/config/formConfigs";
import {
  BASE_IRI,
  declarativeMappings,
  lobidTypemap,
  makeDefaultUiSchemaForAllDefinitions,
  primaryFieldsRegistry,
  PUBLIC_BASE_PATH,
  rendererRegistry,
} from "../components/config";
import { EntityDetailModal } from "../components/form/show";
import { EditEntityModal } from "../components/form/edit/EditEntityModal";
import { SnackbarProvider } from "notistack";
import { useRouterHook } from "./useRouterHook";
import ThemeComponent from "../components/theme/ThemeComponent";
import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import SemanticJsonForm from "../components/form/SemanticJsonForm";
import { JSONSchema7 } from "json-schema";
import { materialCells } from "@jsonforms/material-renderers";

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
                queryBuildOptions={defaultQueryBuilderOptions}
                typeNameToTypeIRI={(name: string) => sladb(name).value}
                propertyNameToIRI={(name: string) => sladb(name).value}
                typeIRIToTypeName={(iri: string) =>
                  iri?.substring(BASE_IRI.length, iri.length)
                }
                propertyIRIToPropertyName={(iri: string) =>
                  iri?.substring(BASE_IRI.length, iri.length)
                }
                createEntityIRI={createNewIRI}
                jsonLDConfig={{
                  defaultPrefix: defaultPrefix,
                  jsonldContext: defaultJsonldContext,
                  allowUnsafeSourceIRIs: false,
                }}
                lockedSPARQLEndpoint={sparqlEndpoint}
                normDataMapping={{
                  gnd: {
                    mapping: declarativeMappings,
                    typeToTypeMap: lobidTypemap,
                  },
                }}
                schema={schema as JSONSchema7}
                uiSchemaDefaultRegistry={makeDefaultUiSchemaForAllDefinitions(
                  schema as JSONSchema7,
                )}
                rendererRegistry={rendererRegistry}
                cellRendererRegistry={materialCells}
                primaryFieldRendererRegistry={(typeIRI: string) =>
                  primaryFieldsRegistry(
                    typeIRI,
                    (name: string) => sladb(name).value,
                  )
                }
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
