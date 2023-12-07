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

import {
  OpenInNew,
  OpenInNewOff,
  Save,
} from "@mui/icons-material";
import { BASE_IRI, primaryFields } from "../config";
import {
  applyToEachField,
  extractFieldIfString,
} from "../utils/mapping/simpleFieldExtractor";
import { SemanticFormsModal } from "./SemanticFormsModal";
import { bringDefinitionToTop, encodeIRI } from "../utils/core";
import { JSONSchema7 } from "json-schema";
import { useJsonForms } from "@jsonforms/react";
import dot from "dot";
import { useCRUDWithQueryClient } from "../state/useCRUDWithQueryClient";
import { useGlobalCRUDOptions } from "../state/useGlobalCRUDOptions";
import { defaultJsonldContext, defaultPrefix } from "../form/formConfigs";
import get from "lodash/get";
import { TabIcon } from "../theme/icons";

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
  formsPath?: string;
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
    elementLabelProp,
    formsPath,
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
    { enabled: !data?.__draft, initialData: data, refetchOnWindowFocus: true },
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

  return (
    <ListItem
      secondaryAction={
        <Stack direction="row" spacing={1}>
          {draft ? (
            <IconButton onClick={handleSave} aria-label={"Save"} size="large">
              <Save />
            </IconButton>
          ) : (
            <>
              <IconButton
                sx={{ padding: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle();
                }}
              >
                {modalIsOpen ? <OpenInNewOff /> : <OpenInNew />}
              </IconButton>
              <IconButton
                component={React.forwardRef<HTMLSpanElement, any>(
                  ({ children, ...props }, ref) => (
                    <span {...props} ref={ref}>
                      <a
                        href={`/de/create/${typeName}?encID=${encodeIRI(
                          entityIRI,
                        )}`}
                        target="_blank"
                        rel="noopener"
                      >
                        {children}
                      </a>
                    </span>
                  ),
                )}
              >
                <TabIcon />
              </IconButton>
            </>
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
