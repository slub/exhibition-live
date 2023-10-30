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

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme }: MainProps) => ({
    // @ts-ignore
    ...theme.typography.mainContent,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    [theme.breakpoints.up("md")]: {
      marginLeft: 0,
    },
    [theme.breakpoints.down("md")]: {
      marginLeft: "20px",
      padding: "16px",
    },
    [theme.breakpoints.down("sm")]: {
      marginLeft: "10px",
      padding: "16px",
      marginRight: "10px",
    },
  }),
);

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();

  const [leftDrawerOpened, setLeftDrawerOpened] = useState<boolean>(false);
  const toggleDrawer = useCallback(() => {
    setLeftDrawerOpened((opened) => !opened);
  }, [setLeftDrawerOpened]);
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* header */}
      <AppBar
        enableColorOnDark
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: theme.palette.background.default,
        }}
      >
        <Toolbar>
          <AppHeader onLeftDrawerToggle={toggleDrawer} />
        </Toolbar>
      </AppBar>

      <Sidebar open={leftDrawerOpened} onClose={toggleDrawer} />

      {/*@ts-ignore */}
      <Main theme={theme}>{children}</Main>
    </Box>
  );
};
