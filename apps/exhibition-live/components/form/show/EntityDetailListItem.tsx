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
import { useTranslation } from "next-i18next";
import { PrimaryFieldResults } from "../../utils/types";
import {
  applyToEachField,
  extractFieldIfString,
} from "../../utils/mapping/simpleFieldExtractor";
import NiceModal from "@ebay/nice-modal-react";
import { EntityDetailModal } from "./EntityDetailModal";
import { Clear, HideImage } from "@mui/icons-material";
import { ellipsis } from "../../utils/core";
import { useRootFormContext } from "../../provider";

type EntityDetailListItemProps = {
  entityIRI: string;
  typeIRI?: string;
  onClear?: () => void;
  data?: any;
};
export const EntityDetailListItem = ({
  entityIRI,
  typeIRI,
  onClear,
  data: defaultData,
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
  const data = rawData?.document?.["@type"] ? rawData?.document : defaultData;
  const cardInfo = useMemo<PrimaryFieldResults<string>>(() => {
    const fieldDecl = primaryFields[typeName];
    if (data && fieldDecl) {
      const { label, image, description } = applyToEachField(
        data,
        fieldDecl,
        extractFieldIfString,
      );
      return {
        label: ellipsis(label, 50),
        description: ellipsis(description, 50),
        image,
      };
    }
    return {
      label: null,
      description: null,
      image: null,
    };
  }, [typeName, data]);
  const { label, image, description } = cardInfo;
  const { isWithinRootForm } = useRootFormContext();
  const showDetailModal = useCallback(() => {
    NiceModal.show(EntityDetailModal, {
      typeIRI,
      entityIRI,
      data,
      inlineEditing: isWithinRootForm,
    });
  }, [typeIRI, entityIRI, data, isWithinRootForm]);
  //Sorry for this hack, in future we will have class dependent List items
  const variant = useMemo(
    () => (typeIRI.endsWith("Person") ? "circular" : "rounded"),
    [typeIRI],
  );

  return (
    <ListItem
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
        <ListItemText
          primaryTypographyProps={{ style: { whiteSpace: "normal" } }}
          secondaryTypographyProps={{ style: { whiteSpace: "normal" } }}
          primary={label}
          secondary={description}
        />
      </ListItemButton>
    </ListItem>
  );
};
