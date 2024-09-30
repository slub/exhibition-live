import { ListItemRendererProps } from "./types";
import {
  useAdbContext,
  useCRUDWithQueryClient,
  useExtendedSchema,
  useSimilarityFinderState,
} from "@slub/edb-state-hooks";
import * as React from "react";
import { useCallback, useEffect, useMemo } from "react";
import { ClassicResultListItem } from "@slub/edb-basic-components";
import { IconButton, Stack } from "@mui/material";
import { Check } from "@mui/icons-material";
import { EntityDetailElement } from "@slub/edb-advanced-components";

export const KBListItemRenderer = ({
  data,
  idx,
  typeIRI,
  selected,
  onSelect,
  onAccept,
}: ListItemRendererProps) => {
  const { id, label, avatar, secondary } = data;
  const {
    jsonLDConfig: { defaultPrefix },
    typeIRIToTypeName,
  } = useAdbContext();

  const typeName = useMemo(
    () => typeIRIToTypeName(typeIRI),
    [typeIRI, typeIRIToTypeName],
  );
  const loadedSchema = useExtendedSchema({ typeName });
  const { loadEntity } = useCRUDWithQueryClient({
    entityIRI: id,
    typeIRI,
    schema: loadedSchema,
    queryOptions: { enabled: false },
    loadQueryKey: "load",
  });
  const { resetElementIndex } = useSimilarityFinderState();
  const handleAccept = useCallback(async () => {
    const finalData = (await loadEntity(id, typeIRI))?.document;
    if (!finalData) {
      console.warn("could not load entity");
      return;
    }
    resetElementIndex();
    onAccept && onAccept(id, finalData);
  }, [onAccept, id, loadEntity, typeIRI, loadedSchema, resetElementIndex]);
  const { acceptWishPending, setAcceptWishPending } =
    useSimilarityFinderState();
  useEffect(() => {
    if (selected && handleAccept && acceptWishPending) {
      setAcceptWishPending(false);
      handleAccept();
    }
  }, [handleAccept, selected, acceptWishPending, setAcceptWishPending]);

  return (
    <ClassicResultListItem
      key={id}
      id={id}
      index={idx}
      onSelected={onSelect}
      label={label}
      secondary={secondary}
      avatar={avatar}
      altAvatar={String(idx)}
      selected={selected}
      onEnter={handleAccept}
      listItemProps={{
        secondaryAction: (
          <Stack direction="row" spacing={1}>
            <IconButton onClick={handleAccept}>
              <Check />
            </IconButton>
          </Stack>
        ),
      }}
      popperChildren={
        <EntityDetailElement
          sx={{
            maxWidth: "30em",
            maxHeight: "80vh",
            overflow: "auto",
          }}
          entityIRI={id}
          typeIRI={typeIRI}
          data={undefined}
          cardActionChildren={null}
          readonly
        />
      }
    />
  );
};
