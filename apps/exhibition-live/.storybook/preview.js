import theme from "../components/theme/berry-theme";
import {CssBaseline, ThemeProvider} from "@mui/material";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

const finalTheme = theme(
  {
    isOpen: [], // for active default menu
    defaultId: "default",
    fontFamily: "'Roboto', sans-serif",
    borderRadius: 12,
    opened: true,
    navType: "light",
  }
)
const  queryClient = new QueryClient();
export const withMuiTheme = (Story) => (
  <ThemeProvider theme={finalTheme}>
    <QueryClientProvider client={queryClient}>
      <CssBaseline />
      <Story />
    </QueryClientProvider>
  </ThemeProvider>
);

export const decorators = [withMuiTheme];
