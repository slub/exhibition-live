import { ImportExport, Settings } from "@mui/icons-material";
import { useMediaQuery, useTheme, List, Divider, Toolbar } from "@mui/material";
import React, { useCallback, useMemo } from "react";

import SettingsModal from "../../content/settings/SettingsModal";
import {
  useAdbContext,
  useLocalSettings,
  useModifiedRouter,
} from "@slub/edb-state-hooks";
import { Drawer } from "./menu";
import { useTranslation } from "next-i18next";
import { useGlobalAuth } from "../../state/useGlobalAuth";
import { createMenuListFromSchema } from "./createMenuListFromSchema";
import { MenuGroup, NavGroup, NavItem } from "@slub/edb-advanced-components";

type SidebarProps = {
  open?: boolean;
  onClose?: () => void;
};

const ImportSection = ({ open }) => {
  const { t } = useTranslation();
  const router = useModifiedRouter();
  const openImport = useCallback(() => {
    router.push("/import");
  }, [router]);

  return (
    <List>
      <NavItem
        key={"import"}
        item={{
          id: "import",
          type: "item",
          icon: () => <ImportExport />,
          title: t("import"),
        }}
        onClick={openImport}
        level={0}
        open={open}
      />
    </List>
  );
};

const Options = ({ open }) => {
  const { t } = useTranslation();
  const { openSettings } = useLocalSettings();

  return (
    <List>
      <NavItem
        key={"settings"}
        item={{
          id: "settings",
          url: "#",
          type: "item",
          icon: () => <Settings />,
          title: t("settings"),
        }}
        level={0}
        onClick={openSettings}
        open={open}
      />
      <SettingsModal />
    </List>
  );
};

const Navigation = ({ open }) => {
  const { t } = useTranslation();
  const { getPermission } = useGlobalAuth();
  const { schema } = useAdbContext();
  const menuGroup = useMemo<MenuGroup | null>(() => {
    return schema ? createMenuListFromSchema(schema, getPermission, t) : null;
  }, [schema, getPermission, t]);
  return (
    menuGroup && (
      <>
        <NavGroup key={menuGroup.id} item={menuGroup} />
      </>
    )
  );
};

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Drawer
      //container={container}
      variant="permanent"
      anchor="left"
      open={open}
      ModalProps={{ keepMounted: true }}
      color="inherit"
    >
      <Toolbar />
      <Navigation open={open} />
      <Options open={open} />
      <Divider />
    </Drawer>
  );
};
