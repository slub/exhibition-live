import { Close as CloseIcon } from "@mui/icons-material";
import {
  AppBar,
  Backdrop,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  Toolbar,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import React, { useCallback, useState } from "react";
import { useRouter } from "next/router";

import { useModalRouting } from "../../../state/useModalRouting";
import loadedSchema from "../../../../public/schema/Exhibition.schema.json";

export const RoutingModal = (props) => {
  const [forceFullscreen, setForceFullscreen] = useState(false);
  const [value, setValue] = React.useState("");
  const { modalOpen, closeModal } = useModalRouting();
  const theme = useTheme();
  const router = useRouter();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value as string);
  };
  const handleClose = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleSubmit = useCallback(() => {
    closeModal();
    router.push(`/create/${value}`);
  }, [closeModal, value]);

  return (
    <Dialog
      fullScreen={fullScreen || forceFullscreen}
      open={modalOpen}
      onClose={handleClose}
      aria-labelledby="responsive-dialog-title"
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <AppBar position="static">
        <Toolbar variant="dense">
          <Box sx={{ flexGrow: 3 }}>
            <Typography variant="h4" color="inherit" component="div">
              {"Neuen Datensatz anlegen"}
            </Typography>
          </Box>
          <IconButton
            size="large"
            aria-label="cancel"
            onClick={handleClose}
            color="inherit"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <FormControl fullWidth>
          <InputLabel id="select-data-type-label">Datentyp</InputLabel>
          <Select
            labelId="select-data-type-label"
            id="select-data-type"
            value={value}
            label="dataType"
            onChange={handleChange}
          >
            {Object.entries(
              (loadedSchema as any).definitions || loadedSchema["$defs"] || {},
            ).map(([key, value]) => (
              <MenuItem key={key} value={key}>
                {key}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        {
          <Button autoFocus onClick={handleSubmit}>
            Erstellen
          </Button>
        }
      </DialogActions>
    </Dialog>
  );
};
