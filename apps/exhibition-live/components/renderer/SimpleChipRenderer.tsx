import { JsonSchema, update } from "@jsonforms/core";
import { Avatar, Chip, ChipProps, Tooltip } from "@mui/material";
import React, {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { BASE_IRI, primaryFieldExtracts } from "../config";
import { applyToEachField, extractFieldIfString } from "@slub/edb-ui-utils";
import { JSONSchema7 } from "json-schema";
import { useJsonForms } from "@jsonforms/react";
import dot from "dot";
import { useCRUDWithQueryClient } from "@slub/edb-state-hooks";
import get from "lodash/get";
import NiceModal from "@ebay/nice-modal-react";
import { EntityDetailModal } from "../form/show/EntityDetailModal";
import { bringDefinitionToTop } from "@slub/json-schema-utils";

type SimpleChipRendererProps = {
  data: any;
  entityIRI: string;
  index: number;
  count: number;
  schema: JsonSchema;
  rootSchema: JsonSchema;
  onRemove: (entityIRI: string) => void;
  onChange: (data: any) => void;
  path: string;
  childLabelTemplate?: string;
  elementLabelProp?: string;
  formsPath?: string;
};
export const SimpleChipRenderer = (
  props: SimpleChipRendererProps & ChipProps,
) => {
  const { dispatch } = useJsonForms();
  const {
    data,
    index,
    entityIRI,
    schema,
    rootSchema,
    onRemove,
    count,
    childLabelTemplate,
    elementLabelProp,
    formsPath,
    ...chipProps
  } = props;
  const typeIRI = schema.properties?.["@type"]?.const;
  const typeName = useMemo(
    () => typeIRI && typeIRI.substring(BASE_IRI.length, typeIRI.length),
    [typeIRI],
  );
  const onData = useCallback((_data) => {
    dispatch(update(props.path, () => _data));
  }, []);
  // @ts-ignore
  const { label, description, image } = useMemo(() => {
    if (!typeName) return {};
    const fieldDecl = primaryFieldExtracts[typeName];
    if (data && fieldDecl)
      return applyToEachField(data, fieldDecl, extractFieldIfString);
    return {};
  }, [data, typeName, entityIRI]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const handleToggle = useCallback(() => {
    setModalIsOpen(!modalIsOpen);
  }, [setModalIsOpen, modalIsOpen]);
  const subSchema = useMemo(
    () =>
      bringDefinitionToTop(rootSchema as JSONSchema7, typeName) as JSONSchema7,
    [rootSchema, typeName],
  );
  const realLabel = useMemo(() => {
    if (childLabelTemplate) {
      try {
        const template = dot.template(childLabelTemplate);
        return template(data);
      } catch (e) {
        console.warn("could not render childLabelTemplate", e);
      }
    } else if (elementLabelProp) {
      const label_ = get(data, elementLabelProp);
      if (label_) return label_;
    }
    return label || data?.__label;
  }, [childLabelTemplate, elementLabelProp, data, label]);

  const { loadQuery } = useCRUDWithQueryClient({
    entityIRI,
    typeIRI,
    schema: subSchema,
    queryOptions: {
      enabled: !data?.__draft && !data?.__label,
      initialData: data,
      refetchOnWindowFocus: true,
    },
  });
  //const draft = data?.__draft && !saveMutation.isSuccess;
  const { data: loadedData } = loadQuery;
  useEffect(() => {
    if (loadedData?.document) {
      onData(loadedData.document);
    }
  }, [loadedData, onData]);

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
    [setTooltipEnabled, showDetailModal],
  );
  return (
    <Tooltip
      title={description}
      open={description && description.length > 0 && tooltipEnabled}
      onClose={() => setTooltipEnabled(false)}
    >
      <Chip
        {...chipProps}
        data-testid={`chip-${formsPath}-${index}`}
        avatar={
          image ? (
            <Avatar alt={realLabel} src={image} />
          ) : (
            <Avatar>{count + 1}</Avatar>
          )
        }
        onMouseEnter={handleShouldShow}
        label={realLabel}
        onClick={showDetailModal}
        onDelete={() => onRemove && onRemove(entityIRI)}
      />
    </Tooltip>
  );
};
