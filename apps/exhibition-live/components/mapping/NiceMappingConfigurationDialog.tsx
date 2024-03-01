import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  TextField,
  Toolbar,
  Typography
} from "@mui/material";
import {Close as CloseIcon} from "@mui/icons-material";
import React, {useEffect, useState} from "react";
import {useTranslation} from "next-i18next";

type NiceMappingConfigurationDialogProps = {
  mapping: any
  sourcePath: string | number
}

export const NiceMappingConfigurationDialog = NiceModal.create(({mapping, sourcePath}: NiceMappingConfigurationDialogProps ) => {
  const modal = useModal();
  const { t } = useTranslation();

  const [mappingCode, setMappingCode] = useState('')
  useEffect(() => {
    setMappingCode(JSON.stringify(mapping, null, 2))
  }, [mapping]);

  const handleMappingEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMappingCode(event.target.value)
  }
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
            Mapping Editor
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex" }}>
            <IconButton
              size="large"
              aria-label={t("close")}
              onClick={() => modal.remove()}
              color="inherit"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <TextField multiline fullWidth value={mappingCode} onChange={handleMappingEditChange}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => modal.remove()}>{t("cancel")}</Button>
      </DialogActions>
    </Dialog>
  )
})
