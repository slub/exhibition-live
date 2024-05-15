import theme from "../components/theme/berry-theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  createNewIRI,
  defaultJsonldContext,
  defaultPrefix,
  defaultQueryBuilderOptions,
  sladb,
} from "../components/form/formConfigs";
import {
  BASE_IRI,
  declarativeMappings,
  lobidTypemap,
  PUBLIC_BASE_PATH,
} from "../components/config";
import { AdbProvider, store } from "@slub/edb-state-hooks";
import { EntityDetailModal } from "../components/form/show";
import { EditEntityModal } from "../components/form/edit/EditEntityModal";
import { Provider } from "react-redux";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const parameters = {
  nextRouter: {
    Provider: AppRouterContext.Provider, // next 13 next 13 (using next/navigation)
  },
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

const finalTheme = theme({
  isOpen: [], // for active default menu
  defaultId: "default",
  fontFamily: "'Roboto', sans-serif",
  borderRadius: 12,
  opened: true,
  navType: "light",
});
const queryClient = new QueryClient();

export const useRouterMock = () => {
  return {
    push: async (url) => {
      console.log("push", url);
    },
    replace: async (url) => {
      console.log("replace", url);
    },
    asPath: "",
    pathname: "",
    query: {},
  };
};

export const withMuiTheme = (Story) => {
  return (
    <Provider store={store}>
      <AdbProvider
        queryBuildOptions={defaultQueryBuilderOptions}
        typeNameToTypeIRI={(name) => sladb(name).value}
        propertyNameToIRI={(name) => sladb(name).value}
        typeIRIToTypeName={(iri) => iri?.substring(BASE_IRI.length, iri.length)}
        propertyIRIToPropertyName={(iri) =>
          iri?.substring(BASE_IRI.length, iri.length)
        }
        createEntityIRI={createNewIRI}
        jsonLDConfig={{
          defaultPrefix: defaultPrefix,
          jsonldContext: defaultJsonldContext,
          allowUnsafeSourceIRIs: false,
        }}
        normDataMapping={{
          gnd: {
            mapping: declarativeMappings,
            typeToTypeMap: lobidTypemap,
          },
        }}
        env={{
          publicBasePath: PUBLIC_BASE_PATH,
          baseIRI: BASE_IRI,
        }}
        components={{
          EntityDetailModal: EntityDetailModal,
          EditEntityModal: EditEntityModal,
        }}
        useRouterHook={useRouterMock}
      >
        <ThemeProvider theme={finalTheme}>
          <QueryClientProvider client={queryClient}>
            <CssBaseline />
            <Story />
          </QueryClientProvider>
        </ThemeProvider>
      </AdbProvider>
    </Provider>
  );
};

export const decorators = [withMuiTheme];
