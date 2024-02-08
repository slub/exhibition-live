// @flow
import {
  Avatar,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemButtonProps,
  ListItemText,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import * as React from "react";
import { FunctionComponent, useCallback } from "react";

type OwnProps = {
  id: string;
  onSelected: (id: string) => void;
  avatar?: string;
  label: string;
  secondary?: string;
  altAvatar?: string;
};

type Props = OwnProps & ListItemButtonProps;

const ClassicResultListItem: FunctionComponent<Props> = ({
  id,
  onSelected,
  avatar,
  label,
  secondary,
  altAvatar,
  ...rest
}) => {
  const theme = useTheme();

  const handleSelect = useCallback(() => {
    onSelected(id);
  }, [onSelected, id]);

  return (
    <>
      <ListItem sx={{ p: 0 }} alignItems="flex-start">
        <ListItemButton
          sx={{
            backgroundColor: "transparent",
            "&:hover": { backgroundColor: "transparent" },
          }}
          onClick={handleSelect}
          {...rest}
        >
          <ListItemAvatar>
            <Avatar
              sx={{ width: "32px", height: "32px" }}
              aria-label="Photo"
              src={avatar}
            >
              {!avatar ? altAvatar : ""}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="h5" color="inherit">
                {label}
              </Typography>
            }
            secondary={
              <Typography
                variant="caption"
                sx={{ ...theme.typography.caption }}
              >
                {secondary}
              </Typography>
            }
          />
        </ListItemButton>
      </ListItem>
      <Divider variant="inset" component="li" />
    </>
  );
};

export default ClassicResultListItem;
