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
import { useTranslation } from "next-i18next";

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
  const { t } = useTranslation();
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
            <IconButton onClick={onSave} aria-label={t("save")}>
              <Save />
            </IconButton>
          )}
          {onRemove && (
            <IconButton onClick={onRemove} aria-label={t("delete permanently")}>
              <Delete />
            </IconButton>
          )}
          {onReload && (
            <IconButton onClick={onReload} aria-label={t("reload")}>
              <Refresh />
            </IconButton>
          )}
          {onReset && (
            <IconButton onClick={onReset} aria-label={t("reset")}>
              <DangerousOutlined />
            </IconButton>
          )}
        </>
      )}
      {children || null}
    </Toolbar>
  );
};
