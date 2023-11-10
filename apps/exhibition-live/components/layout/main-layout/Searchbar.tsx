import { Box, Drawer, Toolbar } from "@mui/material";
import React, { useCallback, useState } from "react";
import { FloatingButton } from "./menu";

type SearchbarWithFloatingButtonProps = {
  children?: React.ReactNode;
};

type SearchbarProps = {
  handleClose: () => void;
  drawerWidth: number;
  open: boolean;
  updateDrawerWidth?: () => {};
} & SearchbarWithFloatingButtonProps;

export const SearchbarWithFloatingButton = ({
  children,
}: SearchbarWithFloatingButtonProps) => {
  const [rightDrawerOpened, setRightDrawerOpened] = useState<boolean>(false);
  const [rightDrawerWidth, setRightDrawerWidth] = useState<number>(500);
  const toggleRightDrawer = useCallback(() => {
    setRightDrawerOpened((rightDrawerOpened) => !rightDrawerOpened);
  }, [setRightDrawerOpened]);
  return (
    <>
      <FloatingButton
        drawerOpen={rightDrawerOpened}
        drawerWidth={rightDrawerWidth}
        toggleDrawer={toggleRightDrawer}
      />
      <Searchbar
        open={rightDrawerOpened}
        drawerWidth={rightDrawerWidth}
        handleClose={toggleRightDrawer}
      >
        {children}
      </Searchbar>
    </>
  );
};
export const Searchbar = ({
  open,
  drawerWidth,
  handleClose,
  updateDrawerWidth,
  children,
}: SearchbarProps) => {
  return (
    <>
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
        <Box>{children}</Box>
      </Drawer>
    </>
  );
};
