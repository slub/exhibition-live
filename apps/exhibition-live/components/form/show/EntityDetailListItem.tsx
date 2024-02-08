import {
  Avatar,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
import React, { useCallback, useMemo } from "react";
import { useTypeIRIFromEntity } from "../../state";
import { primaryFields, typeIRItoTypeName } from "../../config";
import useExtendedSchema from "../../state/useExtendedSchema";
import { useGlobalCRUDOptions } from "../../state/useGlobalCRUDOptions";
import { useCRUDWithQueryClient } from "../../state/useCRUDWithQueryClient";
import { defaultJsonldContext, defaultPrefix } from "../formConfigs";
import { useTranslation } from "react-i18next";
import { PrimaryFieldResults } from "../../utils/types";
import {
  applyToEachField,
  extractFieldIfString,
} from "../../utils/mapping/simpleFieldExtractor";
import NiceModal from "@ebay/nice-modal-react";
import { EntityDetailModal } from "./EntityDetailModal";
import { Clear, HideImage } from "@mui/icons-material";

type EntityDetailListItemProps = {
  entityIRI: string;
  typeIRI?: string;
  onClear?: () => void;
};
export const EntityDetailListItem = ({
  entityIRI,
  typeIRI,
  onClear,
}: EntityDetailListItemProps) => {
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
    { enabled: true, refetchOnWindowFocus: true },
    "show",
  );
  const { t } = useTranslation();
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
  const { label, image, description } = cardInfo;
  const showDetailModal = useCallback(() => {
    NiceModal.show(EntityDetailModal, { typeIRI, entityIRI, data });
  }, [typeIRI, entityIRI, data]);
  //Sorry for this hack, in future we will have class dependent List items
  const variant = useMemo(
    () => (typeIRI.endsWith("Person") ? "circular" : "rounded"),
    [typeIRI],
  );

  return (
    <ListItem
      dense
      sx={{ paddingLeft: 0 }}
      secondaryAction={
        onClear && (
          <Stack>
            <IconButton onClick={onClear}>
              <Clear />
            </IconButton>
          </Stack>
        )
      }
    >
      <ListItemButton onClick={showDetailModal}>
        <ListItemAvatar>
          <Avatar variant={variant} aria-label="image" src={image}>
            <HideImage />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={label} secondary={description} />
      </ListItemButton>
    </ListItem>
  );
};
