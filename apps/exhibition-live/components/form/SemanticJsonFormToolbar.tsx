import { IconButton, Toolbar } from "@mui/material";
import {
  DangerousOutlined,
  Delete,
  Edit,
  EditOff,
  OpenInNew,
  Refresh,
  Save,
} from "@mui/icons-material";
import React from "react";

type SemanticJsonFormsToolbarProps = {
  editMode: boolean;
  onEditModeToggle: () => void;
  onSave?: () => void;
  onRemove?: () => void;
  onReload?: () => void;
  onReset?: () => void;
  onShow?: () => void;
  children?: React.ReactNode;
};
export const SemanticJsonFormToolbar = ({
  editMode,
  onEditModeToggle,
  onReset,
  onSave,
  onRemove,
  onReload,
  onShow,
  children,
}: SemanticJsonFormsToolbarProps) => {
  return (
    <Toolbar>
      <IconButton onClick={onShow}>
        <OpenInNew />
      </IconButton>
      <IconButton onClick={onEditModeToggle}>
        {editMode ? <EditOff /> : <Edit />}
      </IconButton>
      {editMode && (
        <>
          {onSave && (
            <IconButton onClick={onSave} aria-label="save">
              <Save />
            </IconButton>
          )}
          {onRemove && (
            <IconButton onClick={onRemove} aria-label="remove">
              <Delete />
            </IconButton>
          )}
          {onReload && (
            <IconButton onClick={onReload} aria-label="reload from server">
              <Refresh />
            </IconButton>
          )}
          {onReset && (
            <IconButton onClick={onReset} aria-label="full reload">
              <DangerousOutlined />
            </IconButton>
          )}
        </>
      )}
      {children || null}
    </Toolbar>
  );
};
