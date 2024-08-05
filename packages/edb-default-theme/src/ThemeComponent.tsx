// ** React Imports
// ** MUI Imports
import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import { ReactNode, useMemo } from "react";

// ** Type Imports
// ** Theme Config
import theme from "./berry-theme";
// ** Global Styles
import GlobalStyling from "./globalStyles";
// ** Theme Override Imports
// ** Theme

interface Props {
  children: ReactNode;
}

const themeSettings = {
  isOpen: [], // for active default menu
  defaultId: "default",
  fontFamily: "sans-serif",
  borderRadius: 12,
  opened: true,
  navType: "light",
} as const;

const themeFinal = theme(themeSettings);
export const ThemeComponent = (props: Props) => {
  // ** Props
  const { children } = props;

  return (
    <ThemeProvider theme={themeFinal}>
      <CssBaseline />
      <GlobalStyles styles={() => GlobalStyling(themeFinal) as any} />
      {children}
    </ThemeProvider>
  );
};
