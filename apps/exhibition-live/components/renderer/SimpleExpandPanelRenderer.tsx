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
import React, { useCallback, useMemo, useState } from "react";

import find from "lodash/find";
import { useSPARQL_CRUD } from "../state/useSPARQL_CRUD";
import { defaultPrefix, defaultQueryBuilderOptions } from "../form/formConfigs";
import { useGlobalCRUDOptions } from "../state/useGlobalCRUDOptions";

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
  const draft = data?.__draft;
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
    }
    return label;
  }, [childLabelTemplate, data, label]);

  const { crudOptions } = useGlobalCRUDOptions();
  useSPARQL_CRUD(
    entityIRI,
    typeIRI,
    subSchema,
    //@ts-ignore
    {
      ...crudOptions,
      defaultPrefix,
      setData: onData,
      queryBuildOptions: defaultQueryBuilderOptions,
      queryOptions: {
        enabled: !Boolean(data?.__draft),
      },
      queryKey: "load",
    },
  );
  return (
    <ListItem
      secondaryAction={
        <Stack direction="row" spacing={1}>
          {draft ? (
            <IconButton onClick={() => {}} aria-label={"Save"} size="large">
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
      <ListItemButton onClick={handleToggle}>
        <ListItemAvatar>
          <Avatar aria-label="Index" src={image}>
            {count + 1}
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={realLabel} />
      </ListItemButton>
      {typeIRI && (
        <SemanticFormsModal
          schema={subSchema as JsonSchema}
          entityIRI={entityIRI}
          typeIRI={typeIRI}
          label={label}
          open={modalIsOpen}
          askClose={() => setModalIsOpen(false)}
          askCancel={() => setModalIsOpen(false)}
          onChange={onChange}
        />
      )}
    </ListItem>
  );
};

export const getFirstPrimitivePropExceptJsonLD = (schema: any) => {
  if (schema.properties) {
    return find(Object.keys(schema.properties), (propName) => {
      const prop = schema.properties[propName];
      return (
        (prop.type === "string" ||
          prop.type === "number" ||
          prop.type === "integer") &&
        !propName.startsWith("@")
      );
    });
  }
  return undefined;
};
