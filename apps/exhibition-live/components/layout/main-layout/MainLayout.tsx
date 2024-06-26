import { Box, CssBaseline, styled, Theme, useTheme } from "@mui/material";
import { useCallback, useState } from "react";

import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";

export const gridSpacing = 3;
export const leftDrawerWidth = 260;
export const appDrawerWidth = 320;

type MainProps = {
  theme: Theme;
};

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "theme",
})(({ theme }: MainProps) => {
  return {
    // @ts-ignore
    ...theme.typography.mainContent,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    flexGrow: 1,
    marginTop: "48px",
    width: `calc(100% - ${leftDrawerWidth}px)`,
  };
});

export const MainLayout = ({
  children,
  toolbar,
}: {
  children: React.ReactNode;
  toolbar?: React.ReactNode;
}) => {
  const theme = useTheme();

  const [leftDrawerOpened, setLeftDrawerOpened] = useState<boolean>(true);

  const toggleLeftDrawer = useCallback(() => {
    setLeftDrawerOpened((leftDrawerOpened) => !leftDrawerOpened);
  }, [setLeftDrawerOpened]);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* header */}
      <AppHeader
        drawerOpen={leftDrawerOpened}
        toggleDrawer={toggleLeftDrawer}
        toolbar={toolbar}
      />
      <Sidebar open={leftDrawerOpened} />

      {/*@ts-ignore */}
      <Main theme={theme}>{children}</Main>
    </Box>
  );
};
