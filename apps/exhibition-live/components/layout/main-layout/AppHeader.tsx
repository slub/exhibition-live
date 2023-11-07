// material-ui
import MenuIcon from "@mui/icons-material/Menu";
import ListIcon from "@mui/icons-material/List";
import { ButtonBase, useTheme, AppBar, Toolbar } from "@mui/material";
import React from "react";

type AppHeaderProps = {
  toggleDrawer: () => void;
  drawerOpen: boolean;
};

export const AppHeader = ({ drawerOpen, toggleDrawer }: AppHeaderProps) => {
  const theme = useTheme();

  return (
    <AppBar
      enableColorOnDark
      position="fixed"
      elevation={1}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        {/*<ButtonBase
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
          }}
          onClick={toggleDrawer}
        >
          {drawerOpen ? <MenuIcon /> : <ListIcon />}
        </ButtonBase>*/}
      </Toolbar>
    </AppBar>
  );
};
