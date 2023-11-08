import { Box, ButtonBase, Drawer, useTheme, AppBar, Toolbar, Typography, Grid, } from "@mui/material";
import { Search as SearchIcon } from '@mui/icons-material';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SearchSection } from "./SearchSection";

type SearchbarProps = {
  handleClose: () => void,
  drawerWidth: number,
  open: boolean,
  updateDrawerWidth?: () => {},
}

export const Searchbar = ({ open, drawerWidth, handleClose, updateDrawerWidth }: SearchbarProps) => {

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={open}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
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
  )

}
