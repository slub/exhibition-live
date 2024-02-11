// material-ui
import MenuIcon from "@mui/icons-material/Menu";
import ListIcon from "@mui/icons-material/List";
import {
  ButtonBase,
  useTheme,
  AppBar,
  Toolbar,
  Button,
  Hidden,
  ToggleButton,
} from "@mui/material";
import React from "react";
import { useFormEditor } from "../../state";
import { useSettings } from "../../state/useLocalSettings";

type AppHeaderProps = {
  toggleDrawer: () => void;
  drawerOpen: boolean;
};

export const AppHeader = ({ drawerOpen, toggleDrawer }: AppHeaderProps) => {
  const theme = useTheme();
  const { features } = useSettings();
  const { previewEnabled, togglePreview, formData } = useFormEditor();

  return (
    <AppBar
      enableColorOnDark
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar>
        <ButtonBase
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
          }}
          onClick={toggleDrawer}
        >
          {drawerOpen ? <MenuIcon /> : <ListIcon />}
        </ButtonBase>

        <Hidden xsUp={!features?.enablePreview}>
          <ToggleButton
            value="check"
            selected={previewEnabled}
            onClick={() => togglePreview()}
          >
            Vorschau {previewEnabled ? "ausblenden" : "einblenden"}
          </ToggleButton>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
};
