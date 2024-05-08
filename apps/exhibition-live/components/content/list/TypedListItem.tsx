import React, { FunctionComponent, useCallback, useMemo } from "react";
import { applyToEachField, extractFieldIfString } from "@slub/edb-ui-utils";
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import NiceModal from "@ebay/nice-modal-react";
import { EntityDetailModal } from "../../form/show/EntityDetailModal";
import { useAdbContext } from "@slub/edb-state-hooks";

interface OwnProps {
  index: number;
  data: any;
  disableLoad?: boolean;
}

type Props = OwnProps;

const TypedListItem: FunctionComponent<Props> = ({
  index,
  data,
  disableLoad,
}) => {
  const {
    typeIRIToTypeName,
    queryBuildOptions: { primaryFieldExtracts },
  } = useAdbContext();
  const typeIRI = data["@type"] as string;
  const entityIRI = data["@id"] as string;
  const typeName = useMemo(
    () => typeIRIToTypeName(typeIRI),
    [typeIRI, typeIRIToTypeName],
  );
  const primaryFieldDesc = useMemo(
    () => primaryFieldExtracts[typeName],
    [primaryFieldExtracts, typeName],
  );

  const { label, description, image } = useMemo(
    () => applyToEachField(data, primaryFieldDesc, extractFieldIfString),
    [data, primaryFieldDesc],
  );

  const showDetailModal = useCallback(() => {
    NiceModal.show(EntityDetailModal, {
      typeIRI,
      entityIRI,
      data,
      disableLoad,
      disableInlineEditing: true,
    });
  }, [typeIRI, entityIRI, data, disableLoad]);

  return (
    <ListItem>
      <ListItemButton onClick={showDetailModal}>
        <ListItemAvatar>
          <Avatar aria-label="Index" src={image}>
            {index + 1}
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={label} secondary={description} />
      </ListItemButton>
    </ListItem>
  );
};

export default TypedListItem;
