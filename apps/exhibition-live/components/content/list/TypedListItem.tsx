import React, { FunctionComponent, useCallback, useMemo } from "react";
import {
  primaryFieldExtracts,
  primaryFields,
  typeIRItoTypeName,
} from "../../config";
import {
  applyToEachField,
  extractFieldIfString,
} from "../../utils/mapping/simpleFieldExtractor";
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import NiceModal from "@ebay/nice-modal-react";
import { EntityDetailModal } from "../../form/show/EntityDetailModal";
import { useRootFormContext } from "../../provider";

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

  const { isWithinRootForm } = useRootFormContext();
  const showDetailModal = useCallback(() => {
    NiceModal.show(EntityDetailModal, {
      typeIRI,
      entityIRI,
      data,
      disableLoad,
      inlineEditing: isWithinRootForm,
    });
  }, [typeIRI, entityIRI, data, disableLoad, isWithinRootForm]);

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
