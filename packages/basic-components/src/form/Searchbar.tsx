import { Box, Toolbar } from "@mui/material";
import React from "react";
import MuiDrawer from "@mui/material/Drawer";
import type { SearchbarWithFloatingButtonProps } from "./SearchbarWithFloatingButton";

export type SearchbarProps = {
  drawerWidth: number;
  open: boolean;
} & SearchbarWithFloatingButtonProps;

export const Searchbar = ({ open, drawerWidth, children }: SearchbarProps) => {
  try {
    return (
      <Box sx={{ position: "absolute" }}>
        <MuiDrawer
          variant="persistent"
          anchor="right"
          open={open}
          ModalProps={{ keepMounted: true }}
          sx={{
            width: open ? drawerWidth : 0,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              // boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box>{children}</Box>
        </MuiDrawer>
      </Box>
    );
  } catch (e) {
    console.error(e);
    return null;
  }
};
