import { Box, Drawer, Toolbar } from "@mui/material";
import React from "react";
import { SearchSection } from "./SearchSection";

type SearchbarProps = {
  handleClose: () => void;
  drawerWidth: number;
  open: boolean;
  updateDrawerWidth?: () => {};
};

export const Searchbar = ({
  open,
  drawerWidth,
  handleClose,
  updateDrawerWidth,
}: SearchbarProps) => {
  return (
    <Drawer
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
      <Box>
        <SearchSection />
      </Box>
    </Drawer>
  );
};
