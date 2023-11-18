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
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar>
        {
          <ButtonBase
            sx={{
              borderRadius: "12px",
              overflow: "hidden",
            }}
            onClick={toggleDrawer}
          >
            {drawerOpen ? <MenuIcon /> : <ListIcon />}
          </ButtonBase>
        }
      </Toolbar>
    </AppBar>
  );
};
