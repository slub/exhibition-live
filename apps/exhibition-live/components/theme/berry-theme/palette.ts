/**
 * Color intention that you want to used in your theme
 * @param {JsonObject} theme Theme customization object
 */
import { Theme } from "@mui/material";

import { ThemeExtended } from "./themeType";

export default function themePalette(theme: ThemeExtended): Theme["palette"] {
  return {
    mode: theme?.customization?.navType,
    // @ts-ignore
    common: {
      black: theme.colors?.darkPaper,
    },
    primary: {
      light: theme.colors?.primaryLight,
      main: theme.colors?.primaryMain,
      dark: theme.colors?.primaryDark,
      // @ts-ignore
      200: theme.colors?.primary200,
      800: theme.colors?.primary800,
    },
    secondary: {
      light: theme.colors?.secondaryLight,
      main: theme.colors?.secondaryMain,
      dark: theme.colors?.secondaryDark,
      // @ts-ignore
      200: theme.colors?.secondary200,
      800: theme.colors?.secondary800,
    },
    // @ts-ignore
    error: {
      light: theme.colors?.errorLight,
      main: theme.colors?.errorMain,
      dark: theme.colors?.errorDark,
    },
    orange: {
      light: theme.colors?.orangeLight,
      main: theme.colors?.orangeMain,
      dark: theme.colors?.orangeDark,
    },
    // @ts-ignore
    warning: {
      light: theme.colors?.warningLight,
      main: theme.colors?.warningMain,
      dark: theme.colors?.warningDark,
    },
    success: {
      light: theme.colors?.successLight,
      // @ts-ignore
      200: theme.colors?.success200,
      main: theme.colors?.successMain,
      dark: theme.colors?.successDark,
    },
    // @ts-ignore
    grey: {
      50: theme.colors?.grey50,
      100: theme.colors?.grey100,
      500: theme.darkTextSecondary,
      600: theme.heading,
      700: theme.darkTextPrimary,
      900: theme.textDark,
    },
    dark: {
      light: theme.colors?.darkTextPrimary,
      main: theme.colors?.darkLevel1,
      dark: theme.colors?.darkLevel2,
      800: theme.colors?.darkBackground,
      900: theme.colors?.darkPaper,
    },
    text: {
      primary: theme.darkTextPrimary,
      secondary: theme.darkTextSecondary,
      // @ts-ignore
      dark: theme.textDark,
      hint: theme.colors?.grey100,
    },
    background: {
      paper: theme.paper,
      default: theme.backgroundDefault,
    },
  };
}
