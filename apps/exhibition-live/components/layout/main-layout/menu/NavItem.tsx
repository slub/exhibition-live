import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import {
  Avatar,
  Chip,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { useRouter } from "next/router";
import { forwardRef, useEffect, useCallback } from "react";

import { useThemeSettings } from "../../../state";
import { MenuItem } from "./types";

type NavItemProps = {
  item: MenuItem;
  level: number;
  onClick?: () => void;
  open?: boolean;
};
export const NavItem = ({
  item,
  level,
  onClick,
  open = true,
}: NavItemProps) => {
  const theme = useTheme();
  const { pathname } = useRouter();
  const router = useRouter();
  const customization = useThemeSettings();
  const matchesSM = useMediaQuery(theme.breakpoints.down("lg"));

  const create = useCallback(
    (typeName: any) => {
      router.push(`/create/${typeName}`);
    },
    [router],
  );
  const list = useCallback(
    (typeName: any) => {
      router.push(`/list/${typeName}`);
    },
    [router],
  );

  const Icon = item.icon as React.FC<{ stroke: number; size: string }>;
  const itemIcon = item?.icon ? (
    <Icon stroke={1.5} size="1.3rem" />
  ) : (
    <FiberManualRecordIcon
      sx={{
        width:
          customization.isOpen.findIndex((id) => id === item?.id) > -1 ? 8 : 6,
        height:
          customization.isOpen.findIndex((id) => id === item?.id) > -1 ? 8 : 6,
      }}
      fontSize={level > 0 ? "inherit" : "medium"}
    />
  );

  let itemTarget = "_self";
  if (item.target) {
    itemTarget = "_blank";
  }

  /*
  let listItemProps = {
    component: forwardRef<>((props, ref) => <Link {...props} to={item.url} target={itemTarget} />)
  }
  if (item?.external) {
    listItemProps = {  href: item.url, target: itemTarget }
  }*/

  const itemHandler = (id) => {
    //dispatch({ type: MENU_OPEN, id })
    //if (matchesSM) dispatch({ type: SET_MENU, opened: false })
  };

  // active menu item on page load
  useEffect(() => {
    const currentIndex = document.location.pathname
      .toString()
      .split("/")
      .findIndex((id) => id === item.id);
    if (currentIndex > -1) {
      //dispatch({ type: MENU_OPEN, id: item.id })
    }
    // eslint-disable-next-line
  }, [pathname]);

  return (
    <>
      {item.typeName ? (
        <ListItem
          sx={{
            borderRadius: `${customization.borderRadius}px`,
            mb: 0.5,
            alignItems: "flex-start",
            backgroundColor: level > 1 ? "transparent !important" : "inherit",
            px: 2.5,
            pl: level > 1 ? "48px" : "24px",
            py: level > 1 ? 1 : 1.25,
            justifyContent: open ? "initial" : "center",
          }}
          secondaryAction={
            <>
              <IconButton
                size="small"
                edge="end"
                aria-label="list"
                onClick={() => list(item.typeName)}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                edge="end"
                aria-label="create"
                onClick={() => create(item.typeName)}
                disabled={item?.readOnly}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </>
          }
        >
          {itemIcon && (
            <ListItemIcon sx={{ my: "auto", minWidth: !item?.icon ? 18 : 36 }}>
              {itemIcon}
            </ListItemIcon>
          )}
          <ListItemText
            primary={
              <Typography
                variant={
                  customization.isOpen.findIndex((id) => id === item.id) > -1
                    ? "h5"
                    : "body1"
                }
                color="inherit"
              >
                {item.title}
              </Typography>
            }
            secondary={
              typeof item.caption === "string" && (
                <Typography
                  variant="caption"
                  sx={{ ...theme.typography.caption }}
                  display="block"
                  gutterBottom
                >
                  {item.caption}
                </Typography>
              )
            }
            sx={{
              opacity: open ? 1 : 0,
              transition: theme.transitions.create("opacity", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }}
          />
        </ListItem>
      ) : (
        <ListItemButton
          component={(props) =>
            item.url ? (
              <Link {...props} href={item.url} target={itemTarget} />
            ) : (
              <div />
            )
          }
          disabled={item.disabled}
          sx={{
            borderRadius: `${customization.borderRadius}px`,
            mb: 0.5,
            alignItems: "flex-start",
            backgroundColor: level > 1 ? "transparent !important" : "inherit",
            px: 2.5,
            py: level > 1 ? 1 : 1.25,
            justifyContent: open ? "initial" : "center",
          }}
          selected={customization.isOpen.findIndex((id) => id === item.id) > -1}
          onClick={() => (onClick ? onClick() : itemHandler(item.id))}
        >
          {itemIcon && (
            <ListItemIcon sx={{ my: "auto", minWidth: !item?.icon ? 18 : 36 }}>
              {itemIcon}
            </ListItemIcon>
          )}
          <ListItemText
            primary={
              <Typography
                variant={
                  customization.isOpen.findIndex((id) => id === item.id) > -1
                    ? "h5"
                    : "body1"
                }
                color="inherit"
              >
                {item.title}
              </Typography>
            }
            secondary={
              typeof item.caption === "string" && (
                <Typography
                  variant="caption"
                  sx={{ ...theme.typography.caption }}
                  display="block"
                  gutterBottom
                >
                  {item.caption}
                </Typography>
              )
            }
            sx={{
              opacity: open ? 1 : 0,
              transition: theme.transitions.create("opacity", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }}
          />
          {item.chip && (
            // @ts-ignore
            <Chip
              color={item.chip.color}
              variant={item.chip.variant}
              size={item.chip.size}
              label={item.chip.label}
              avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
            />
          )}
        </ListItemButton>
      )}
    </>
  );
};
