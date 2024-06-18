import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useGoogleSpreadSheet } from "./useGoogleSpreadSheet";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Skeleton,
  Toolbar,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import React from "react";
import { GoogleSpreadSheetView } from "./GoogleSpreadSheetView";

export type SpreadSheetViewModalProps = {
  sheetId: string;
};
export const SpreadSheetViewModal = NiceModal.create(
  ({ sheetId }: SpreadSheetViewModalProps) => {
    const modal = useModal();
    const { spreadSheet, loaded, title } = useGoogleSpreadSheet(sheetId);

    return (
      <Dialog
        open={modal.visible}
        onClose={() => modal.remove()}
        fullWidth={true}
        scroll={"paper"}
        disableScrollLock={false}
      >
        <AppBar position="static">
          <Toolbar variant="dense">
            <Typography variant="h6" color="inherit" component="div">
              {loaded ? title : "loading Spreadsheet ..."}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: "flex" }}>
              <IconButton
                size="large"
                aria-label="close"
                onClick={() => modal.remove()}
                color="inherit"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <DialogContent>
          {loaded ? (
            <GoogleSpreadSheetView spreadSheet={spreadSheet} />
          ) : (
            <Skeleton height={"300px"} width={"100%"} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => modal.remove()}>Abbrechen</Button>
        </DialogActions>
      </Dialog>
    );
  },
);
