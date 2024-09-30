import { TextFieldProps, ThemeOptions } from "@mui/material";
import { createTheme, Theme } from "@mui/material/styles";

// assets
// @ts-ignore
import colors from "./themes-vars.module.scss";
// project imports
import componentStyleOverrides from "./compStyleOverride";
import themePalette from "./palette";
import { ThemeExtended } from "./themeType";
import themeTypography from "./typography";

let variant: "outlined" | "standard" | "filled" = "outlined";
export const theme = (customization: ThemeExtended["customization"]) => {
  const color = colors;

  const themeOption: ThemeExtended = {
    colors: color,
    heading: color.grey900,
    paper: color.paper,
    backgroundDefault: color.paper,
    background: color.primaryLight,
    darkTextPrimary: color.grey700,
    darkTextSecondary: color.grey500,
    textDark: color.grey900,
    menuSelected: color.secondaryDark,
    menuSelectedBack: color.secondaryLight,
    divider: color.grey200,
    variant,
    customization,
  };

  // @ts-ignore
  const themeOptions: ThemeOptions = {
    direction: "ltr",
    palette: themePalette(themeOption),
    mixins: {
      toolbar: {
        minHeight: "48px",
        "@media (min-width: 600px)": {
          minHeight: "48px",
        },
      },
    },
    typography: themeTypography(themeOption),
  };

  const themes = createTheme(themeOptions);
  themes.components = componentStyleOverrides(themeOption);

  return themes;
};

export default theme;
