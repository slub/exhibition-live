// assets
import { ChevronRight as IconChevronRight } from "@mui/icons-material";
import {
  AppBar,
  Box,
  CssBaseline,
  styled,
  Theme,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useCallback, useState } from "react";

import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";
import { Searchbar } from "./Searchbar";
import { FloatingButton } from "./menu";
import { useDrawerDimensions } from "../../state";

export const gridSpacing = 3;
export const leftDrawerWidth = 260;
export const appDrawerWidth = 320;

type MainProps = {
  theme: Theme;
};

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "theme",
})(({ theme }: MainProps) => {
  const { drawerHeight } = useDrawerDimensions();
  return {
    // @ts-ignore
    ...theme.typography.mainContent,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    flexGrow: 1,
    maxHeight: `calc(100vh - ${drawerHeight + 25}px)`,
    [theme.breakpoints.up("md")]: {
      marginLeft: "0",
      marginRight: "0",
      marginTop: "60px",
      marginBottom: "10px",
      padding: "0",
      width: `calc(100% - ${leftDrawerWidth}px)`,
    },
    [theme.breakpoints.down("md")]: {
      marginLeft: "10px",
      marginRight: "10px",
      marginTop: "60px",
      marginBottom: "10px",
      padding: "16px",
      width: `calc(100% - ${leftDrawerWidth}px)`,
    },
    [theme.breakpoints.down("sm")]: {
      marginLeft: "10px",
      marginRight: "10px",
      marginTop: "60px",
      marginBottom: "10px",
      marginBotom: "10px",
      width: `calc(100% - ${leftDrawerWidth}px)`,
      padding: "16px",
    },
  };
});

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
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
      />
      <Sidebar open={leftDrawerOpened} />

      {/*@ts-ignore */}
      <Main theme={theme}>{children}</Main>
    </Box>
  );
};
