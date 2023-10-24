import { withJsonFormsContext } from "@jsonforms/react";
import { Avatar, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import React from "react";

import { StatePropsOfMasterItem } from "./ListWithDetailMasterItem";
import { withContextToMasterListItemProps } from "./withContextToMasterListItem";

const SelectListWithDetailMasterItem = ({
  index,
  childLabel,
}: StatePropsOfMasterItem) => {
  return (
    <ListItem>
      <ListItemAvatar>
        <Avatar aria-label="Index">{index + 1}</Avatar>
      </ListItemAvatar>
      <ListItemText primary={childLabel} style={{ overflow: "hidden" }} />
    </ListItem>
  );
};

export default withJsonFormsContext(
  withContextToMasterListItemProps(SelectListWithDetailMasterItem),
);
