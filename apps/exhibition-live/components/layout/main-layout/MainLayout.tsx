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

export const gridSpacing = 3;
export const leftDrawerWidth = 260;
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
  flexGrow: 1,
  [theme.breakpoints.up("md")]: {
    marginLeft: 0,
    width: `calc(100% - ${leftDrawerWidth}px)`,
  },
  [theme.breakpoints.down("md")]: {
    marginLeft: "20px",
    padding: "16px",
    width: `calc(100% - ${leftDrawerWidth}px)`,
  },
  [theme.breakpoints.down("sm")]: {
    marginLeft: "10px",
    width: `calc(100% - ${leftDrawerWidth}px)`,
    padding: "16px",
    marginRight: "10px",
  },
}));

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();

  const [leftDrawerOpened, setLeftDrawerOpened] = useState<boolean>(true);
  const [rightDrawerOpened, setRightDrawerOpened] = useState<boolean>(false);
  const [rightDrawerWidth, setRightDrawerWidth] = useState<number>(240);

  const toggleLeftDrawer = useCallback(() => {
    setLeftDrawerOpened((leftDrawerOpened) => !leftDrawerOpened);
  }, [setLeftDrawerOpened]);
  const toggleRightDrawer = useCallback(() => {
    setRightDrawerOpened((rightDrawerOpened) => !rightDrawerOpened);
  }, [setRightDrawerOpened]);
  const updateRightDrawerWidth = useCallback(
    (newDrawerWidth: number) => {
      setRightDrawerWidth(newDrawerWidth);
    },
    [setRightDrawerWidth],
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* header */}
      <AppHeader
        drawerOpen={leftDrawerOpened}
        toggleDrawer={toggleLeftDrawer}
      />
      <Sidebar open={leftDrawerOpened} />
      <FloatingButton
        drawerOpen={rightDrawerOpened}
        drawerWidth={rightDrawerWidth}
        toggleDrawer={toggleRightDrawer}
      />

      {/*@ts-ignore */}
      <Main theme={theme}>{children}</Main>
      <Searchbar
        open={rightDrawerOpened}
        drawerWidth={rightDrawerWidth}
        handleClose={toggleRightDrawer}
      />
    </Box>
  );
};
