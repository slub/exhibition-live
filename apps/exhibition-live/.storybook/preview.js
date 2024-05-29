import theme from "../components/theme/berry-theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BASE_IRI, PUBLIC_BASE_PATH } from "../components/config";
import { AdbProvider, store } from "@slub/edb-state-hooks";
import { EntityDetailModal } from "../components/form/show";
import { EditEntityModal } from "../components/form/edit/EditEntityModal";
import { Provider } from "react-redux";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import SemanticJsonForm from "../components/form/SemanticJsonForm";
import { exhibitionConfig } from "../components/config/exhibitionAppConfig";

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
        {...exhibitionConfig}
        env={{
          publicBasePath: PUBLIC_BASE_PATH,
          baseIRI: BASE_IRI,
        }}
        components={{
          EntityDetailModal: EntityDetailModal,
          EditEntityModal: EditEntityModal,
          SemanticJsonForm: SemanticJsonForm,
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
