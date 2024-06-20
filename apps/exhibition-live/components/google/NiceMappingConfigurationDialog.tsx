import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "next-i18next";
import {
  DeclarativeMatchBasedFlatMapping,
  matchBased2DeclarativeFlatMapping,
} from "@slub/edb-ui-utils";
import { JsonView } from "react-json-view-lite";
import { DeclarativeFlatMapping } from "@slub/edb-ui-utils";
import { parseJSONObject } from "@slub/edb-ui-utils";
import { OwnColumnDesc } from "./types";
import { CachedWorkSheet } from "./useCachedWorkSheet";

type NiceMappingConfigurationDialogProps = {
  mapping: any;
  rawMapping?: DeclarativeMatchBasedFlatMapping;
  fields?: OwnColumnDesc[];
  sourcePath: string | number;
  worksheet?: CachedWorkSheet<any>;
  tablePreview?: (mapping: DeclarativeFlatMapping) => React.ReactElement;
};

export const NiceMappingConfigurationDialog = NiceModal.create(
  ({
    mapping,
    sourcePath,
    rawMapping,
    fields,
    worksheet,
    tablePreview,
  }: NiceMappingConfigurationDialogProps) => {
    const modal = useModal();
    const { t } = useTranslation();

    const [mappingCode, setMappingCode] = useState("");
    useEffect(() => {
      setMappingCode(JSON.stringify(mapping, null, 2));
    }, [mapping]);
    const [rawMappingCode, setRawMappingCode] = useState("");
    useEffect(() => {
      setRawMappingCode(JSON.stringify(rawMapping, null, 2));
    }, [rawMapping]);

    const [newRawMapping, setNewRawMapping] = useState(rawMapping);
    const newMapping = useMemo<DeclarativeFlatMapping | undefined>(() => {
      try {
        return matchBased2DeclarativeFlatMapping(fields, newRawMapping);
      } catch (e) {}
      return undefined;
    }, [fields, newRawMapping]);

    const handleMappingEditChange = (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      setMappingCode(event.target.value);
    };
    const handleRawMappingEditChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setRawMappingCode(value);
        const validJSON = parseJSONObject(value);
        if (validJSON) {
          setNewRawMapping(validJSON);
        }
      },
      [setNewRawMapping, setRawMappingCode],
    );
    const TablePreview = useMemo(
      () => (tablePreview && newMapping ? tablePreview(newMapping) : <></>),
      [tablePreview, newMapping],
    );
    return (
      <Dialog
        open={modal.visible}
        onClose={() => modal.remove()}
        fullWidth={true}
        fullScreen={true}
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
          <Grid container direction={"column"}>
            <Grid item>
              <Grid container direction={"row"} justifyContent={"stretch"}>
                {rawMapping && (
                  <Grid item flex={1}>
                    <TextField
                      multiline
                      fullWidth
                      value={rawMappingCode}
                      onChange={handleRawMappingEditChange}
                    />
                  </Grid>
                )}
                <Grid item flex={1}>
                  <JsonView
                    data={newMapping}
                    shouldInitiallyExpand={(lvl) => lvl < 4}
                  />
                </Grid>
              </Grid>
            </Grid>
            {tablePreview && (
              <Grid
                item
                flex={1}
                sx={{ maxWidth: "100%!important", overflow: "auto" }}
              >
                {TablePreview}
              </Grid>
            )}
            <Grid item flex={1}></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => modal.remove()}>{t("cancel")}</Button>
        </DialogActions>
      </Dialog>
    );
  },
);
