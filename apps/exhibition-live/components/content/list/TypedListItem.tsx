import React, { FunctionComponent, useCallback, useMemo } from "react";
import {
  primaryFieldExtracts,
  typeIRItoTypeName,
} from "../../config";
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
  const typeIRI = data["@type"] as string;
  const entityIRI = data["@id"] as string;
  const typeName = typeIRItoTypeName(typeIRI);
  //const loadedSchema = useExtendedSchema({ typeName, classIRI: typeIRI });
  const primaryFieldDesc = primaryFieldExtracts[typeName];

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
