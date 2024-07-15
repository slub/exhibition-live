import { Close as CloseIcon } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { useCallback } from "react";

import type { DeclarativeSimpleMapping } from "@slub/edb-data-mapping";
import { MappingConfiguration } from "./MappingConfiguration";

type MappingConfigurationDialogProps = {
  open?: boolean;
  onClose?: () => void;
  mapping: Partial<DeclarativeSimpleMapping>;
};
export const MappingConfigurationDialog = ({
  open,
  onClose,
}: MappingConfigurationDialogProps) => {
  const handleClose = useCallback(() => {
    onClose && onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Mapping erstellen
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <MappingConfiguration />
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
