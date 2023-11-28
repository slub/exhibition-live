import { Button, useTheme } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import React, { useCallback } from "react";
import { useSnackbar } from "notistack";
import { useRouter } from "next/router";

type FloatingButtonProps = {
  drawerOpen: boolean;
  drawerWidth: number;
  toggleDrawer: () => void;
};

export const FloatingButton = ({
  drawerOpen,
  drawerWidth,
  toggleDrawer,
}: FloatingButtonProps) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { pathname } = useRouter();

  const handleClick = useCallback(() => {
    if (!pathname.includes("/create/") && !drawerOpen) {
      enqueueSnackbar("🦄 Noch keine Funktion in dieser Ansicht!", {
        variant: "warning",
      });
      return;
    }
    toggleDrawer();
  }, [toggleDrawer, pathname, drawerOpen, enqueueSnackbar]);

  return (
    <Button
      variant="contained"
      color="primary"
      sx={{
        // visibility: drawerOpen ? 'hidden' :  'visible',
        position: "fixed",
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        bottom: 10,
        minHeight: "36px",
        width: "72px",
        height: "48px",
        top: "10%",
        right: drawerOpen ? drawerWidth : 0,
        borderRadius: "24px 4px 4px 24px",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      onClick={handleClick}
    >
      <SearchIcon />
    </Button>
  );
};
