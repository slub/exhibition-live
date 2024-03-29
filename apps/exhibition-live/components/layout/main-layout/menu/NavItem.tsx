import AddIcon from "@mui/icons-material/Add";
import {
  Avatar,
  Chip,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { useTheme } from "@mui/material/styles";
import { useModifiedRouter } from "../../../basic";
import { useEffect, useCallback } from "react";

import { useThemeSettings } from "../../../state";
import { MenuItem } from "./types";
import { encodeIRI } from "../../../utils/core";
import { slent } from "../../../form/formConfigs";

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
  const router = useModifiedRouter();
  const { pathname } = router;
  const customization = useThemeSettings();
  const matchesSM = useMediaQuery(theme.breakpoints.down("lg"));

  const create = useCallback(
    (typeName: string) => {
      const newEncodedURI = encodeIRI(slent(`${typeName}-${uuidv4()}`).value);
      router.push(`/create/${typeName}?encID=${newEncodedURI}`);
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
  const itemIcon = item?.icon ? <Icon stroke={1.5} size="1.3rem" /> : null;

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
            padding: 0,
          }}
        >
          <ListItemButton
            sx={{
              mb: 0.5,
              alignItems: "flex-start",
              backgroundColor: level > 1 ? "transparent !important" : "inherit",
              px: 2.5,
              pl: level > 1 ? "48px" : "24px",
              py: level > 1 ? 1 : 1.25,
              justifyContent: open ? "initial" : "center",
            }}
            onClick={() => list(item.typeName)}
          >
            {itemIcon && (
              <ListItemIcon
                sx={{ my: "auto", minWidth: !item?.icon ? 18 : 36 }}
              >
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
          </ListItemButton>
          <Divider orientation="vertical" variant="middle" flexItem />
          <ListItemButton
            aria-label="create"
            sx={{
              mb: 0.5,
              marginRight: 0,
              py: level > 1 ? 1 : 1.25,
              width: "fit-content",
              flexGrow: 0,
            }}
            onClick={() => create(item.typeName)}
            disabled={item?.readOnly}
          >
            <AddIcon />
          </ListItemButton>
        </ListItem>
      ) : (
        <ListItemButton
          disabled={item.disabled}
          sx={{
            // borderRadius: `${customization.borderRadius}px`,
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
