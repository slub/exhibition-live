import { Add as AddIcon } from "@mui/icons-material";
import {
  Avatar,
  Chip,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { useEffect, useCallback } from "react";

import { MenuItem } from "./types";
import { encodeIRI } from "@slub/edb-ui-utils";
import { useAdbContext, useModifiedRouter } from "@slub/edb-state-hooks";

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
  const { createEntityIRI } = useAdbContext();
  const { pathname } = router;

  const create = useCallback(
    (typeName: string) => {
      const newEncodedURI = encodeIRI(createEntityIRI(typeName));
      router.push(`/create/${typeName}?encID=${newEncodedURI}`);
    },
    [router, createEntityIRI],
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
                <Typography variant={"body1"} color="inherit">
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
          selected={false}
          onClick={() => (onClick ? onClick() : itemHandler(item.id))}
        >
          {itemIcon && (
            <ListItemIcon sx={{ my: "auto", minWidth: !item?.icon ? 18 : 36 }}>
              {itemIcon}
            </ListItemIcon>
          )}
          <ListItemText
            primary={
              <Typography variant={"body1"} color="inherit">
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
