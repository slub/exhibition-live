import React, { FunctionComponent, useCallback, useMemo } from "react";
import { primaryFields, typeIRItoTypeName } from "../../config";
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
import { LoadedEntityDetailModal } from "../../form/show/LoadedEntityDetailModal";

interface OwnProps {
  index: number;
  data: any;
}

type Props = OwnProps;

const TypedListItem: FunctionComponent<Props> = ({ index, data }) => {
  const typeIRI = data["@type"] as string;
  const entityIRI = data["@id"] as string;
  const typeName = typeIRItoTypeName(typeIRI);
  //const loadedSchema = useExtendedSchema({ typeName, classIRI: typeIRI });
  const primaryFieldDesc = primaryFields[typeName];

  const { label, description, image } = useMemo(
    () => applyToEachField(data, primaryFieldDesc, extractFieldIfString),
    [data, primaryFieldDesc],
  );

  const showDetailModal = useCallback(() => {
    NiceModal.show(LoadedEntityDetailModal, { typeIRI, entityIRI, data });
  }, [typeIRI, entityIRI, data]);

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
