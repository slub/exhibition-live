import { JsonSchema } from "@jsonforms/core";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionSummary,
  Avatar,
  Grid,
  IconButton,
} from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";

import find from "lodash/find";
import { useSPARQL_CRUD } from "../state/useSPARQL_CRUD";
import { defaultPrefix, defaultQueryBuilderOptions } from "../form/formConfigs";
import { useGlobalCRUDOptions } from "../state/useGlobalCRUDOptions";

const iconStyle: any = { float: "right" };

import { OpenInNew, OpenInNewOff, Save } from "@mui/icons-material";
import { BASE_IRI, primaryFields } from "../config";
import {
  applyToEachField,
  extractFieldIfString,
} from "../utils/mapping/simpleFieldExtractor";
import { SemanticFormsModal } from "./SemanticFormsModal";
import { bringDefinitionToTop } from "../utils/core";
import { JSONSchema7 } from "json-schema";

type SimpleExpandPanelRendererProps = {
  data: any;
  entityIRI: string;
  index: number;
  schema: JsonSchema;
  rootSchema: JsonSchema;
  onRemove: (entityIRI: string) => void;
  onChange: (data: any) => void;
};
export const SimpleExpandPanelRenderer = (
  props: SimpleExpandPanelRendererProps,
) => {
  const { data, index, entityIRI, schema, rootSchema, onRemove, onChange } =
    props;
  const typeIRI = schema.properties?.["@type"]?.const;
  const typeName = useMemo(
    () => typeIRI && typeIRI.substring(BASE_IRI.length, typeIRI.length),
    [typeIRI],
  );
  const onData = useCallback((_data) => {
    console.log({ _data });
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

  const { crudOptions, doLocalQuery } = useGlobalCRUDOptions();
  const { load, save, ready, isLoading } = useSPARQL_CRUD(
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
        enabled: !data.__draft,
      },
    },
  );
  return (
    <Accordion expanded={false} className={"inline_object_card"}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Grid container alignItems={"center"}>
          <Grid item xs={7} md={9}>
            <Grid container alignItems={"center"}>
              <Grid item xs={2} md={1}>
                <Avatar aria-label="Index" src={image}>
                  {index + 1}
                </Avatar>
              </Grid>
              <Grid item xs={10} md={11}>
                <span>{label}</span>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={5} md={3}>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Grid
                  container
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Grid item style={{ paddingTop: "1rem" }}>
                    {draft ? (
                      <IconButton
                        onClick={() => {}}
                        style={iconStyle}
                        aria-label={"Save"}
                        size="large"
                      >
                        <Save />
                      </IconButton>
                    ) : (
                      <Grid item>
                        <IconButton
                          sx={{ padding: 0 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggle();
                          }}
                        >
                          {modalIsOpen ? <OpenInNewOff /> : <OpenInNew />}
                        </IconButton>
                      </Grid>
                    )}
                  </Grid>
                  <Grid item>
                    <IconButton
                      style={iconStyle}
                      aria-label={"Delete"}
                      size="large"
                      onClick={() => onRemove && onRemove(entityIRI)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </AccordionSummary>
      {typeIRI && (
        <SemanticFormsModal
          schema={subSchema as JsonSchema}
          data={entityIRI}
          typeIRI={typeIRI}
          label={label}
          open={modalIsOpen}
          askClose={() => setModalIsOpen(false)}
          askCancel={() => setModalIsOpen(false)}
          onChange={onChange}
        />
      )}
    </Accordion>
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
