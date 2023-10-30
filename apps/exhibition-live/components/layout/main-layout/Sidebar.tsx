import { Settings } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Drawer,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { JSONSchema7 } from "json-schema";
import React, { ForwardedRef, useMemo } from "react";
import { BrowserView, MobileView } from "react-device-detect";

import loadedSchema from "../../../public/schema/Exhibition.schema.json";
import SettingsModal from "../../content/settings/SettingsModal";
import { sladb } from "../../form/formConfigs";
import { useFormRefsContext } from "../../provider/formRefsContext";
import { useLocalSettings } from "../../state/useLocalSettings";
import { Logo } from "./Logo";
import { drawerWidth } from "./MainLayout";
import { MenuGroup, NavGroup, NavItem } from "./menu";
import menuLists from "./menu/menuLists";

const MenuList = () => {
  const menuGroup = useMemo<MenuGroup | null>(() => {
    return loadedSchema
      ? menuLists(loadedSchema as JSONSchema7)
      : (null as MenuGroup);
  }, [loadedSchema]);
  return (
    menuGroup && (
      <>
        <NavGroup key={menuGroup.id} item={menuGroup} />
      </>
    )
  );
};
const MenuCard = () => {
  const { stepperRef } = useFormRefsContext();

  // @ts-ignore
  return <div ref={stepperRef}></div>;
};

type SidebarProps = {
  open?: boolean;
  onClose?: () => void;
};

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up("md"));
  const { openSettings } = useLocalSettings();

  const drawer = (
    <>
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <Box sx={{ display: "flex", p: 2, mx: "auto" }}>
          <Logo />
        </Box>
      </Box>
      <BrowserView>
        <MenuCard />
        <MenuList />
        <NavItem
          item={{
            id: "setttings",
            type: "item",
            url: "#",
            icon: () => <Settings />,
            title: "Einstellungen",
          }}
          level={0}
          onClick={openSettings}
        />
        <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
          <Chip
            label={"Version 1.3.122"}
            disabled
            color="secondary"
            size="small"
            sx={{ cursor: "pointer" }}
          />
        </Stack>
      </BrowserView>
      <SettingsModal />
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ flexShrink: { md: 0 }, width: matchUpMd ? drawerWidth : "auto" }}
      aria-label="menu"
    >
      <Drawer
        //container={container}
        variant={matchUpMd ? "persistent" : "temporary"}
        onClose={onClose}
        anchor="left"
        open={open}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            padding: "0 16px",
            background: theme.palette.background.default,
            color: theme.palette.text.primary,
            borderRight: "none",
            [theme.breakpoints.up("md")]: {
              top: "88px",
            },
          },
        }}
        ModalProps={{ keepMounted: false }}
        color="inherit"
      >
        {drawer}
      </Drawer>
    </Box>
  );
};
