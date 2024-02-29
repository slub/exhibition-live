import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
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
import { useTranslation } from "next-i18next";

type EntityDetailModalProps = {
  typeIRI: string | undefined;
  entityIRI: string;
  data: any;
  disableLoad?: boolean;
};

export const EntityDetailModal = NiceModal.create(
  ({ typeIRI, entityIRI, data: defaultData, disableLoad }: EntityDetailModalProps) => {
    const modal = useModal();
    const typeIRIs = useTypeIRIFromEntity(entityIRI);
    const classIRI: string | undefined = typeIRI || typeIRIs?.[0];
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
      { enabled: !disableLoad, refetchOnWindowFocus: true, initialData: defaultData },
      "show",
    );
    const { t } = useTranslation();
    const data = rawData?.document || defaultData;
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
          <EntityDetailCard
            typeIRI={classIRI}
            entityIRI={entityIRI}
            data={data}
            cardInfo={cardInfo}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => modal.remove()}>{t("cancel")}</Button>
        </DialogActions>
      </Dialog>
    );
  },
);
