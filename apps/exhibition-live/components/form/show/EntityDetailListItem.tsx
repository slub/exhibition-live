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
import { useAdbContext, useTypeIRIFromEntity } from "@slub/edb-state-hooks";
import {
  useCRUDWithQueryClient,
  useExtendedSchema,
} from "@slub/edb-state-hooks";
import { applyToEachField, extractFieldIfString } from "@slub/edb-ui-utils";
import NiceModal from "@ebay/nice-modal-react";
import { Clear, HideImage } from "@mui/icons-material";
import { ellipsis } from "@slub/edb-ui-utils";
import { PrimaryFieldResults } from "@slub/edb-core-types";

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
  const {
    queryBuildOptions: { primaryFields },
    typeIRIToTypeName,
    components: { EntityDetailModal },
  } = useAdbContext();
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
    queryOptions: { enabled: true, refetchOnWindowFocus: true },
    loadQueryKey: "show",
  });
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
  }, [typeName, data, primaryFields]);
  const { label, image, description } = cardInfo;
  const showDetailModal = useCallback(() => {
    NiceModal.show(EntityDetailModal, {
      typeIRI,
      entityIRI,
      data,
    });
  }, [typeIRI, entityIRI, data, EntityDetailModal]);
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
