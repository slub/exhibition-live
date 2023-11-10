import {
  AppBar,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import NiceModal, { useModal } from "@ebay/nice-modal-react";

type GenericModalProps = {
  type: string;
  id?: string;
};

const modalContent = [
  {
    modalType: "delete",
    title: "Eintrag Löschen",
    text: "Eintrag dauerthaft löschen?",
    action: "Löschen",
  },
  {
    modalType: "reset",
    title: "Daten zurücksetzen",
    text: "Daten zurücksetzen? Nicht gespeicherte Einstellungen gehen verlorgen.",
    action: "Zurücksetzen",
  },
  {
    modalType: "reload",
    title: "Daten neuladen",
    text: "Eintrag aus Datenbank neuladen? Nicht gespeicherte Einstellungen gehen verlorgen.",
    action: "Neuladen",
  },
];

const GenericModal = NiceModal.create(({ type, id }: GenericModalProps) => {
  const modal = useModal();

  const content = modalContent
    .filter(({ modalType }) => modalType == type)
    .shift();

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
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            modal.resolve();
            modal.remove();
          }}
        >
          {content.action}
        </Button>
        <Button onClick={() => modal.remove()}>Abbrechen</Button>
      </DialogActions>
    </Dialog>
  );
});

export default GenericModal;
