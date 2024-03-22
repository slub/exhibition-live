import { JsonSchema, update } from "@jsonforms/core";
import {
  Avatar,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Clear, Save } from "@mui/icons-material";
import { BASE_IRI, primaryFields } from "../config";
import {
  applyToEachField,
  extractFieldIfString,
} from "../utils/mapping/simpleFieldExtractor";
import { JSONSchema7 } from "json-schema";
import { useJsonForms } from "@jsonforms/react";
import dot from "dot";
import { useCRUDWithQueryClient } from "../state/useCRUDWithQueryClient";
import { useGlobalCRUDOptions } from "../state/useGlobalCRUDOptions";
import { defaultJsonldContext, defaultPrefix } from "../form/formConfigs";
import get from "lodash/get";
import NiceModal from "@ebay/nice-modal-react";
import { EntityDetailModal } from "../form/show";
import {bringDefinitionToTop} from "@slub/json-schema-utils";
import {withEllipsis} from "../utils/typography";

type SimpleExpandPanelRendererProps = {
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
  elementDetailItemPath?: string;
  elementLabelProp?: string;
  formsPath?: string;
};
export const SimpleExpandPanelRenderer = (
  props: SimpleExpandPanelRendererProps,
) => {
  const { dispatch } = useJsonForms();
  const {
    data,
    entityIRI,
    schema,
    rootSchema,
    onRemove,
    count,
    childLabelTemplate,
    elementLabelProp,
    elementDetailItemPath
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
    const fieldDecl = primaryFields[typeName];
    if (data && fieldDecl)
      return applyToEachField(data, fieldDecl, extractFieldIfString);
    return {};
  }, [data, typeName, entityIRI]);

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

  const elementDetailItem = useMemo(() => elementDetailItemPath ?  get(data, elementDetailItemPath) : null, [elementDetailItemPath, data]);

  const { crudOptions } = useGlobalCRUDOptions();
  const { loadQuery, saveMutation } = useCRUDWithQueryClient(
    entityIRI,
    typeIRI,
    subSchema,
    defaultPrefix,
    crudOptions,
    defaultJsonldContext,
    {
      enabled: !data?.__draft && !data?.__label,
      initialData: data,
      refetchOnWindowFocus: true,
    },
  );
  const draft = data?.__draft && !saveMutation.isSuccess;
  const { data: loadedData } = loadQuery;
  useEffect(() => {
    if (loadedData?.document) {
      onData(loadedData.document);
    }
  }, [loadedData, onData]);

  const handleSave = useCallback(async () => {
    console.log({ saveMutation });
    if (!saveMutation) return;
    saveMutation.mutate(data);
  }, [saveMutation, data]);

  const showDetailModal = useCallback(() => {
    if(elementDetailItem?.["@id"] && elementDetailItem?.["@type"]) {
        NiceModal.show(EntityDetailModal, { typeIRI: elementDetailItem["@type"], entityIRI: elementDetailItem["@id"], data: elementDetailItem, inlineEditing: true  });
    } else {
      NiceModal.show(EntityDetailModal, {typeIRI, entityIRI, data, inlineEditing: true });
    }
  }, [typeIRI, entityIRI, data, elementDetailItem]);

  return (
    <ListItem
      secondaryAction={
        <Stack direction="row" spacing={1}>
          {draft && (
            <IconButton onClick={handleSave} aria-label={"Save"} size="large">
              <Save />
            </IconButton>
          )}
          <IconButton
            aria-label={"Delete"}
            size="large"
            onClick={() => onRemove && onRemove(entityIRI)}
          >
            <Clear />
          </IconButton>
        </Stack>
      }
    >
      <ListItemButton onClick={!draft ? showDetailModal : undefined}>
        <ListItemAvatar>
          <Avatar aria-label="Index" src={image}>
            {count + 1}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primaryTypographyProps={{ style: { whiteSpace: "normal" } }}
          secondaryTypographyProps={{ style: { whiteSpace: "normal" } }}
          primary={withEllipsis(realLabel, 80)}
          secondary={withEllipsis(description, 100)}
        />
      </ListItemButton>
    </ListItem>
  );
};
