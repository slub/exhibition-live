import { Box, Toolbar } from "@mui/material";
import React, { useCallback, useState } from "react";
import { FloatingButton } from "./menu";
import MuiDrawer from "@mui/material/Drawer";
import { useRightDrawerState } from "@slub/edb-state-hooks";

type SearchbarProps = {
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

type SearchbarWithFloatingButtonProps = {
  children?: React.ReactNode;
};

export const SearchbarWithFloatingButton = ({
  children,
}: SearchbarWithFloatingButtonProps) => {
  const {
    open: rightDrawerOpened,
    setOpen: setRightDrawerOpened,
    width: rightDrawerWidth,
    setWidth: setRightDrawerWidth,
  } = useRightDrawerState();
  const toggleRightDrawer = useCallback(() => {
    setRightDrawerOpened((prev: boolean) => !prev);
  }, [setRightDrawerOpened]);
  return (
    <>
      <FloatingButton
        drawerOpen={rightDrawerOpened}
        drawerWidth={rightDrawerWidth}
        toggleDrawer={toggleRightDrawer}
      />
      <Searchbar open={rightDrawerOpened} drawerWidth={rightDrawerWidth}>
        {rightDrawerOpened && children ? children : null}
      </Searchbar>
    </>
  );
};
