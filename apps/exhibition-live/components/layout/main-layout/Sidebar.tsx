import { Settings } from "@mui/icons-material";
import { useMediaQuery, useTheme, List, Divider, Toolbar } from "@mui/material";
import { JSONSchema7 } from "json-schema";
import React, { useMemo } from "react";

import loadedSchema from "../../../public/schema/Exhibition.schema.json";
import SettingsModal from "../../content/settings/SettingsModal";
import { useFormRefsContext } from "../../provider/formRefsContext";
import { useLocalSettings } from "../../state/useLocalSettings";
import { MenuGroup, NavGroup, NavItem, Drawer } from "./menu";
import menuLists from "./menu/menuLists";
import { useGlobalAuth } from "../../state";
import { useTranslation } from "react-i18next";

const MenuList = () => {
  const { t } = useTranslation("translation");
  const { getPermission } = useGlobalAuth();
  const menuGroup = useMemo<MenuGroup | null>(() => {
    return loadedSchema
      ? menuLists(loadedSchema as JSONSchema7, getPermission, t)
      : (null as MenuGroup);
  }, [getPermission, t]);

  return menuGroup && <NavGroup key={menuGroup.id} item={menuGroup} />;
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

const Options = ({ open }) => {
  const { openSettings } = useLocalSettings();

  const items = [
    {
      id: "settings",
      url: "#",
      icon: () => <Settings />,
      title: "settings",
      onClick: openSettings,
    },
  ];

  return (
    <List>
      {items.map(({ id, url, icon, title, onClick }) => (
        <NavItem
          key={id}
          item={{
            id: id,
            type: "item",
            url: url,
            icon: icon,
            title: title,
          }}
          level={0}
          onClick={onClick}
          open={open}
        />
      ))}
      <SettingsModal />
    </List>
  );
};

const Navigation = ({ open }) => {
  const { t } = useTranslation("translation");
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
      <Options open={open} />
      <Divider />
    </Drawer>
  );
};
