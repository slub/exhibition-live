import { useAdbContext, useTypeIRIFromEntity } from "@slub/edb-state-hooks";
import React, { MouseEvent, useCallback, useMemo, useState } from "react";
import {
  useCRUDWithQueryClient,
  useExtendedSchema,
} from "@slub/edb-state-hooks";
import { applyToEachField, extractFieldIfString } from "@slub/edb-data-mapping";
import { ellipsis } from "@slub/edb-ui-utils";
import NiceModal from "@ebay/nice-modal-react";
import { Avatar, Chip, ChipProps, Tooltip } from "@mui/material";
import { PrimaryFieldResults } from "@slub/edb-core-types";

export type EntityChipProps = {
  index?: number;
  entityIRI: string;
  typeIRI?: string;
  data?: any;
} & ChipProps;
export const EntityChip = ({
  index,
  entityIRI,
  typeIRI,
  data: defaultData,
  ...chipProps
}: EntityChipProps) => {
  const typeIRIs = useTypeIRIFromEntity(entityIRI);
  const classIRI: string | undefined = typeIRI || typeIRIs?.[0];
  const {
    queryBuildOptions: { primaryFieldExtracts },
    typeIRIToTypeName,
    components: { EntityDetailModal },
  } = useAdbContext();
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
    const fieldDecl = primaryFieldExtracts[typeName];
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
  }, [typeName, data, primaryFieldExtracts]);
  const { label, image, description } = cardInfo;
  //Sorry for this hack, in future we will have class dependent List items
  const variant = useMemo(
    () => (typeIRI.endsWith("Person") ? "circular" : "rounded"),
    [typeIRI],
  );
  const [tooltipEnabled, setTooltipEnabled] = useState(false);
  const showDetailModal = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      NiceModal.show(EntityDetailModal, {
        entityIRI,
        data: {},
      });
    },
    [entityIRI, EntityDetailModal],
  );
  const handleShouldShow = useCallback(
    (e: MouseEvent<Element>) => {
      setTooltipEnabled(true);
    },
    [setTooltipEnabled],
  );

  return (
    <>
      <Tooltip
        title={description}
        open={Boolean(description && description.length > 0 && tooltipEnabled)}
        onClose={() => setTooltipEnabled(false)}
      >
        <Chip
          {...chipProps}
          avatar={
            image ? (
              <Avatar alt={label} src={image} />
            ) : typeof index !== "undefined" ? (
              <Avatar>{index}</Avatar>
            ) : null
          }
          onMouseEnter={handleShouldShow}
          label={label}
          onClick={showDetailModal}
        />
      </Tooltip>
    </>
  );
};
