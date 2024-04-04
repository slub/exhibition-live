import { useTypeIRIFromEntity } from "../../state";
import React, { MouseEvent, useCallback, useMemo, useState } from "react";
import { primaryFieldExtracts, typeIRItoTypeName } from "../../config";
import useExtendedSchema from "../../state/useExtendedSchema";
import { useCRUDWithQueryClient } from "../../state/useCRUDWithQueryClient";
import { useTranslation } from "next-i18next";
import { PrimaryFieldResults } from "../../utils/types";
import {
  applyToEachField,
  extractFieldIfString,
} from "../../utils/mapping/simpleFieldExtractor";
import { ellipsis } from "../../utils/core";
import NiceModal from "@ebay/nice-modal-react";
import { EntityDetailModal } from "./EntityDetailModal";
import { Avatar, Chip, ChipProps, Tooltip } from "@mui/material";
import { useRootFormContext } from "../../provider";

type EntityChipProps = {
  index?: number;
  entityIRI: string;
  typeIRI?: string;
  data?: any;
  inlineEditing?: boolean;
} & ChipProps;
export const EntityChip = ({
  index,
  entityIRI,
  typeIRI,
  data: defaultData,
  inlineEditing,
  ...chipProps
}: EntityChipProps) => {
  const typeIRIs = useTypeIRIFromEntity(entityIRI);
  const classIRI: string | undefined = typeIRI || typeIRIs?.[0];
  const typeName = useMemo(() => typeIRItoTypeName(classIRI), [classIRI]);
  const loadedSchema = useExtendedSchema({ typeName, classIRI });
  const {
    loadQuery: { data: rawData },
  } = useCRUDWithQueryClient(
    entityIRI,
    classIRI,
    loadedSchema,
    { enabled: true, refetchOnWindowFocus: true },
    "show",
  );
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
  const { isWithinRootForm } = useRootFormContext();
  const showDetailModal = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      NiceModal.show(EntityDetailModal, {
        entityIRI,
        data: {},
        inlineEditing:
          inlineEditing === undefined ? isWithinRootForm : inlineEditing,
      });
    },
    [entityIRI, isWithinRootForm, inlineEditing],
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
