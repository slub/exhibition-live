import * as React from "react";
import { IconButton, Menu } from "@mui/material";
import { FileDownload } from "@mui/icons-material";

export const ExportMenuButton = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  return (
    <>
      <IconButton onClick={handleClick}>
        <FileDownload />
      </IconButton>
      <Menu
        id="export-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "export-button",
          role: "listbox",
        }}
      >
        {children}
      </Menu>
    </>
  );
};
