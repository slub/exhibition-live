import "../styles/jquery.typeahead.min.css";
import "../styles/jquery-ui.min.css";
import "../styles/highlight.min.css";
import "../styles/tooltipster.bundle.min.css";
import "../styles/tooltipster-sideTip-shadow.min.css";
import "@uiw/react-markdown-preview/markdown.css";
import "@uiw/react-md-editor/markdown-editor.css";
import "@triply/yasgui/build/yasgui.min.css";
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
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/de";
import "dayjs/locale/en";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { OptionalLiveDemoEndpoint } from "../components/state/useOptionalLiveDemoEndpoint";
import {
  createNewIRI,
  defaultJsonldContext,
  defaultPrefix,
  defaultQueryBuilderOptions,
  sladb,
} from "../components/config/formConfigs";
import { envToSparqlEndpoint } from "../components/config/envToSparqlEndpoint";
import getConfig from "next/config";
import {
  BASE_IRI,
  declarativeMappings,
  lobidTypemap,
  makeDefaultUiSchemaForAllDefinitions,
  primaryFieldsRegistry,
  PUBLIC_BASE_PATH,
  rendererRegistry,
  schema,
} from "../components/config";
import { AdbProvider, store } from "@slub/edb-state-hooks";
import { EntityDetailModal } from "../components/form/show";
import { EditEntityModal } from "../components/form/edit/EditEntityModal";
import { useRouter } from "next/router";
import SemanticJsonForm from "../components/form/SemanticJsonForm";
import { JSONSchema7 } from "json-schema";
import { materialCells } from "@jsonforms/material-renderers";

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
                useRouterHook={useRouter}
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

// @ts-ignore
export default appWithTranslation(App, nextI18NextConfig as any as UserConfig);
