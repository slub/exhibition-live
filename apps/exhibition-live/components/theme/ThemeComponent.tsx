// ** React Imports
// ** MUI Imports
import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import { ReactNode, useMemo } from "react";

// ** Type Imports
// ** Theme Config
import { Settings } from "../provider/settingsContext";
import { useThemeSettings } from "../state";
import theme from "./berry-theme";
// ** Global Styles
import GlobalStyling from "./globalStyles";
// ** Theme Override Imports
// ** Theme

interface Props {
  children: ReactNode;
}

const ThemeComponent = (props: Props) => {
  const themeSettings = useThemeSettings();
  // ** Props
  const { children } = props;

  const themeFinal = useMemo(() => theme(themeSettings), [themeSettings]);

  return (
    <ThemeProvider theme={themeFinal}>
      <CssBaseline />
      <GlobalStyles styles={() => GlobalStyling(themeFinal) as any} />
      {children}
    </ThemeProvider>
  );
};

export default ThemeComponent;
