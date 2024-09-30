import { useRightDrawerState } from "@slub/edb-state-hooks";
import React, { useCallback } from "react";
import { FloatingButton } from "./FloatingButton";
import { Searchbar } from "./Searchbar";

export type SearchbarWithFloatingButtonProps = {
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
