import { useTypeIRIFromEntity } from "@slub/edb-state-hooks";
import React, { MouseEvent, useCallback, useMemo, useState } from "react";
import { primaryFieldExtracts, typeIRItoTypeName } from "../../config";
import useExtendedSchema from "../../state/useExtendedSchema";
import { useCRUDWithQueryClient } from "@slub/edb-state-hooks";
import { useTranslation } from "next-i18next";
import { applyToEachField, extractFieldIfString } from "@slub/edb-ui-utils";
import { ellipsis } from "@slub/edb-ui-utils";
import NiceModal from "@ebay/nice-modal-react";
import { EntityDetailModal } from "./EntityDetailModal";
import { Avatar, Chip, ChipProps, Tooltip } from "@mui/material";
import { PrimaryFieldResults } from "@slub/edb-core-types";

type EntityChipProps = {
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
  const typeName = useMemo(() => typeIRItoTypeName(classIRI), [classIRI]);
  const loadedSchema = useExtendedSchema({ typeName, classIRI });
  const {
    loadQuery: { data: rawData },
  } = useCRUDWithQueryClient({
    entityIRI,
    typeIRI: classIRI,
    schema: loadedSchema,
    queryOptions: { enabled: true, refetchOnWindowFocus: true },
    loadQueryKey: "show",
  });
  const { t } = useTranslation();
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
  }, [typeName, data]);
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
    [entityIRI],
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
