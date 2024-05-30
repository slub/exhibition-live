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
import { useAdbContext, useCRUDWithQueryClient } from "@slub/edb-state-hooks";
import { useCallback, useMemo, useState } from "react";
import { applyToEachField, extractFieldIfString } from "@slub/edb-ui-utils";
import { EntityDetailCard } from "./EntityDetailCard";
import { useTypeIRIFromEntity, useExtendedSchema } from "@slub/edb-state-hooks";
import { useTranslation } from "next-i18next";
import { filterUndefOrNull } from "@slub/edb-ui-utils";
import { PrimaryField, PrimaryFieldResults } from "@slub/edb-core-types";
import { EntityDetailModalProps } from "@slub/edb-global-types";

export const EntityDetailModal = NiceModal.create(
  ({
    typeIRI,
    entityIRI,
    data: defaultData,
    disableLoad,
    readonly,
    disableInlineEditing,
  }: EntityDetailModalProps) => {
    const {
      queryBuildOptions: { primaryFields },
      typeIRIToTypeName,
    } = useAdbContext();
    const modal = useModal();
    const typeIRIs = useTypeIRIFromEntity(entityIRI);
    const classIRI: string | undefined = typeIRI || typeIRIs?.[0];
    const typeName = useMemo(
      () => typeIRIToTypeName(classIRI),
      [classIRI, typeIRIToTypeName],
    );
    const loadedSchema = useExtendedSchema({ typeName });
    const {
      loadQuery: { data: rawData },
    } = useCRUDWithQueryClient({
      entityIRI,
      typeIRI: classIRI,
      schema: loadedSchema,
      queryOptions: {
        enabled: !disableLoad,
        refetchOnWindowFocus: true,
        initialData: defaultData,
      },
      loadQueryKey: "show",
    });
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
    }, [typeName, data, primaryFields]);

    const [aboutToRemove, setAboutToRemove] = useState(false);
    const removeSlowly = useCallback(() => {
      if (aboutToRemove) return;
      setAboutToRemove(true);
      setTimeout(() => modal.remove(), 500);
    }, [modal, setAboutToRemove, aboutToRemove]);

    const fieldDeclaration = useMemo(
      () => primaryFields[typeName] as PrimaryField,
      [typeName, primaryFields],
    );
    const disabledProperties = useMemo(
      () => filterUndefOrNull(Object.values(fieldDeclaration || {})),
      [fieldDeclaration],
    );

    return (
      <Dialog
        open={modal.visible}
        onClose={() => modal.remove()}
        scroll={"paper"}
        disableScrollLock={false}
        maxWidth={false}
        sx={{
          transition: "opacity 0.5s",
          opacity: aboutToRemove ? 0 : 1,
        }}
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
            disableInlineEditing={disableInlineEditing}
            readonly={readonly}
            onEditClicked={removeSlowly}
            tableProps={{ disabledProperties }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => modal.remove()}>{t("cancel")}</Button>
        </DialogActions>
      </Dialog>
    );
  },
);
