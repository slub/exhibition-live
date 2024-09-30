import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useTranslation } from "next-i18next";

type OptionsModalProps = {
  type: string;
  id?: string;
  message?: string;
  content: {
    title: string;
    text: string;
  };
  options: {
    title: string;
    value: string;
  }[];
};
export const OptionsModal = NiceModal.create<OptionsModalProps>(
  ({ type, id, content, message, options }) => {
    const modal = useModal();
    const { t } = useTranslation();
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
              {content.title}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: "flex" }}>
              <IconButton
                size="large"
                aria-label="close without saving"
                onClick={() => modal.remove()}
                color="inherit"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <DialogContentText>{content.text}</DialogContentText>
          {message && <DialogContentText>{message}</DialogContentText>}
        </DialogContent>
        <DialogActions>
          {options.map((option, index) => (
            <Button
              key={index}
              onClick={() => {
                modal.resolve(option.value);
                modal.remove();
              }}
            >
              {option.title}
            </Button>
          ))}
          <Button onClick={() => modal.remove()}>{t("cancel")}</Button>
        </DialogActions>
      </Dialog>
    );
  },
);
