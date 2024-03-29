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
  toolbar?: React.ReactNode;
};

export const AppHeader = ({
  drawerOpen,
  toggleDrawer,
  toolbar,
}: AppHeaderProps) => {
  const theme = useTheme();

  return (
    <AppBar
      enableColorOnDark
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <ButtonBase
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
          }}
          onClick={toggleDrawer}
        >
          {drawerOpen ? <MenuIcon /> : <ListIcon />}
        </ButtonBase>
        {toolbar}
      </Toolbar>
    </AppBar>
  );
};
