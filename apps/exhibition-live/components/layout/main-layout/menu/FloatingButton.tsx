import { Button, useTheme } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import React from "react";
import { useSnackbar } from "notistack";

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
        right: drawerOpen ? drawerWidth : "10px",
        borderRadius: "24px 4px 4px 24px",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      onClick={() => {
        toggleDrawer();
        enqueueSnackbar("🦄 Wow so easy!", { variant: "success" });
      }}
    >
      <SearchIcon />
    </Button>
  );
};
