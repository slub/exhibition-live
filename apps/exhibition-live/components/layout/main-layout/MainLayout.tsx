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
      width: `calc(100% - ${drawerWidth}px)`,
    },
    [theme.breakpoints.down("md")]: {
      marginLeft: "20px",
      width: `calc(100% - ${drawerWidth}px)`,
      padding: "16px",
    },
    [theme.breakpoints.down("sm")]: {
      marginLeft: "10px",
      width: `calc(100% - ${drawerWidth}px)`,
      padding: "16px",
      marginRight: "10px",
    },
  }),
);

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down("md"));

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
          <AppHeader />
        </Toolbar>
      </AppBar>

      <Sidebar />

      {/*@ts-ignore */}
      <Main theme={theme}>
        <ContextSection />
        {children}
      </Main>
    </Box>
  );
};
