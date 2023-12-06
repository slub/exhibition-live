import { JsonSchema, update } from "@jsonforms/core";
import DeleteIcon from "@mui/icons-material/Delete";
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

import find from "lodash/find";

import { OpenInNew, OpenInNewOff, Save } from "@mui/icons-material";
import { BASE_IRI, primaryFields } from "../config";
import {
  applyToEachField,
  extractFieldIfString,
} from "../utils/mapping/simpleFieldExtractor";
import { SemanticFormsModal } from "./SemanticFormsModal";
import { bringDefinitionToTop } from "../utils/core";
import { JSONSchema7 } from "json-schema";
import { useJsonForms } from "@jsonforms/react";
import dot from "dot";
import { useCRUDWithQueryClient } from "../state/useCRUDWithQueryClient";
import { useGlobalCRUDOptions } from "../state/useGlobalCRUDOptions";
import { defaultJsonldContext, defaultPrefix } from "../form/formConfigs";
import get from "lodash/get";

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
  elementLabelProp?: string;
};
export const SimpleExpandPanelRenderer = (
  props: SimpleExpandPanelRendererProps,
) => {
  const { dispatch } = useJsonForms();
  const {
    data,
    index,
    entityIRI,
    schema,
    rootSchema,
    onRemove,
    onChange,
    count,
    childLabelTemplate,
    elementLabelProp
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
      const label = get(data, elementLabelProp);
      if (label) return label;
    }
    return label || data?.__label;
  }, [childLabelTemplate, elementLabelProp, data, label]);

  const { crudOptions } = useGlobalCRUDOptions();
  const { loadQuery, saveMutation } = useCRUDWithQueryClient(
    entityIRI,
    typeIRI,
    subSchema,
    defaultPrefix,
    crudOptions,
    defaultJsonldContext,
    { enabled: false, initialData: data },
  );
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
  const draft = data?.__draft && !saveMutation.isSuccess;

  return (
    <ListItem
      secondaryAction={
        <Stack direction="row" spacing={1}>
          {draft ? (
            <IconButton onClick={handleSave} aria-label={"Save"} size="large">
              <Save />
            </IconButton>
          ) : (
            <IconButton
              sx={{ padding: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
            >
              {modalIsOpen ? <OpenInNewOff /> : <OpenInNew />}
            </IconButton>
          )}
          <IconButton
            aria-label={"Delete"}
            size="large"
            onClick={() => onRemove && onRemove(entityIRI)}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      }
    >
      <ListItemButton onClick={!draft ? handleToggle : undefined}>
        <ListItemAvatar>
          <Avatar aria-label="Index" src={image}>
            {count + 1}
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={realLabel} />
      </ListItemButton>
      {!draft && (
        <SemanticFormsModal
          schema={subSchema as JsonSchema}
          entityIRI={entityIRI}
          typeIRI={typeIRI}
          label={realLabel}
          open={modalIsOpen}
          askClose={() => setModalIsOpen(false)}
          askCancel={() => setModalIsOpen(false)}
          onChange={onChange}
        />
      )}
    </ListItem>
  );
};
