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
import { ContextSection } from "./ContextSection";
import { Sidebar } from "./Sidebar";

export const gridSpacing = 3;
export const drawerWidth = 260;
export const appDrawerWidth = 320;

type MainProps = {
  theme: Theme;
};

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "theme",
})(({ theme }: MainProps) => ({
  // @ts-ignore
  ...theme.typography.mainContent,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  [theme.breakpoints.up("md")]: {
    marginLeft: 0,
    width: `calc(100% - ${drawerWidth}px)`,
  },
  [theme.breakpoints.down("md")]: {
    marginLeft: "20px",
    padding: "16px",
    width: `calc(100% - ${drawerWidth}px)`,
  },
  [theme.breakpoints.down("sm")]: {
    marginLeft: "10px",
    width: `calc(100% - ${drawerWidth}px)`,
    padding: "16px",
    marginRight: "10px",
  },
}));

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();

  const [leftDrawerOpened, setLeftDrawerOpened] = useState<boolean>(false);
  const toggleDrawer = useCallback(() => {
    setLeftDrawerOpened((leftDrawerOpened) => !leftDrawerOpened);
  }, [setLeftDrawerOpened]);
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* header */}
      <AppHeader drawerOpen={leftDrawerOpened} toggleDrawer={toggleDrawer} />

      <Sidebar open={leftDrawerOpened} />

      {/*@ts-ignore */}
      <Main theme={theme}>{children}</Main>
    </Box>
  );
};
