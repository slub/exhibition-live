import { ImportExport, Settings } from "@mui/icons-material";
import { useMediaQuery, useTheme, List, Divider, Toolbar } from "@mui/material";
import { JSONSchema7 } from "json-schema";
import React, { useCallback, useMemo } from "react";

import loadedSchema from "../../../public/schema/Kulinarik.schema.json";
import SettingsModal from "../../content/settings/SettingsModal";
import { useLocalSettings } from "@slub/edb-state-hooks";
import { MenuGroup, NavGroup, NavItem, Drawer } from "./menu";
import menuLists from "./menu/menuLists";
import { useTranslation } from "next-i18next";
import { useModifiedRouter } from "../../basic";
import { useGlobalAuth } from "../../state/useGlobalAuth";

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
  const menuGroup = useMemo<MenuGroup | null>(() => {
    return loadedSchema
      ? menuLists(loadedSchema as JSONSchema7, getPermission, t)
      : (null as MenuGroup);
  }, [getPermission, t]);
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
      <ImportSection open={open} />
      <Options open={open} />
      <Divider />
    </Drawer>
  );
};
