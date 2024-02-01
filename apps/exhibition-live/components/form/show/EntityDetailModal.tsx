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
import useExtendedSchema from "../../state/useExtendedSchema";
import { useGlobalCRUDOptions } from "../../state/useGlobalCRUDOptions";
import { useCRUDWithQueryClient } from "../../state/useCRUDWithQueryClient";
import { defaultJsonldContext, defaultPrefix } from "../formConfigs";
import { useMemo } from "react";
import { primaryFields, typeIRItoTypeName } from "../../config";
import {
  applyToEachField,
  extractFieldIfString,
} from "../../utils/mapping/simpleFieldExtractor";
import { PrimaryFieldResults } from "../../utils/types";
import { EntityDetailCard } from "./EntityDetailCard";
import { useTypeIRIFromEntity } from "../../state";

type EntityDetailModalProps = {
  typeIRI: string | undefined;
  entityIRI: string;
};

export const EntityDetailModal = NiceModal.create(
  ({ typeIRI, entityIRI }: EntityDetailModalProps) => {
    const modal = useModal();
    const typeIRIs = typeIRI ? [typeIRI] : useTypeIRIFromEntity(entityIRI);
    const classIRI: string | undefined = typeIRIs?.[0];
    const typeName = useMemo(() => typeIRItoTypeName(classIRI), [classIRI]);
    const loadedSchema = useExtendedSchema({ typeName, classIRI });
    const { crudOptions } = useGlobalCRUDOptions();
    const {
      loadQuery: { data: rawData },
    } = useCRUDWithQueryClient(
      entityIRI,
      classIRI,
      loadedSchema,
      defaultPrefix,
      crudOptions,
      defaultJsonldContext,
      { enabled: true, refetchOnWindowFocus: true },
      "show",
    );
    const data = rawData?.document;

    const cardInfo = useMemo<PrimaryFieldResults<string>>(() => {
      const fieldDecl = primaryFields[typeName];
      if (data && fieldDecl)
        return applyToEachField(data, fieldDecl, extractFieldIfString);
      return {
        label: null,
        description: null,
        image: null,
      };
    }, [typeName, data]);

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
              {cardInfo.label}
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
          <EntityDetailCard
            typeIRI={typeIRI}
            entityIRI={entityIRI}
            data={data}
            cardInfo={cardInfo}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => modal.remove()}>Abbrechen</Button>
        </DialogActions>
      </Dialog>
    );
  },
);
