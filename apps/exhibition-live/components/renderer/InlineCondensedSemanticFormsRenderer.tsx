import {
  ControlProps,
  findUISchema,
  JsonSchema,
  Resolve,
  resolveSchema,
} from "@jsonforms/core";
import { useJsonForms, withJsonFormsControlProps } from "@jsonforms/react";
import { FormControl, Grid, Hidden, IconButton } from "@mui/material";
import merge from "lodash/merge";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { slent } from "../form/formConfigs";
import { useUISchemaForType } from "../form/uischemaForType";
import { uischemas } from "../form/uischemas";
import { Add, OpenInNew, OpenInNewOff } from "@mui/icons-material";
import DiscoverAutocompleteInput from "../form/discover/DiscoverAutocompleteInput";
import { useGlobalCRUDOptions } from "../state/useGlobalCRUDOptions";
import { InlineSemanticFormsModal } from "./InlineSemanticFormsModal";
import { BASE_IRI, primaryFields } from "../config";
import { AutocompleteSuggestion } from "../form/DebouncedAutoComplete";
import { SemanticFormsModal } from "./SemanticFormsModal";
import { JSONSchema7 } from "json-schema";
import {
  applyToEachField,
  extractFieldIfString,
} from "../utils/mapping/simpleFieldExtractor";
import { PrimaryField } from "../utils/types";

const InlineCondensedSemanticFormsRenderer = (props: ControlProps) => {
  const {
    id,
    errors,
    schema,
    uischema,
    visible,
    required,
    renderers,
    config,
    data,
    handleChange,
    path,
    rootSchema,
    label,
    description,
  } = props;
  const [formData, setFormData] = useState<any>({ "@id": data });
  const [searchString, setSearchString] = useState<string | undefined>("");
  const isValid = errors.length === 0;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const [editMode, setEditMode] = useState(false);
  const ctx = useJsonForms();
  const [realLabel, setRealLabel] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const selected = useMemo(
    () => ({ value: data || null, label: realLabel }),
    [data, realLabel],
  );
  const { $ref, typeIRI } = uischema.options?.context || {};
  const subSchema = useMemo(() => {
    if (!$ref) return;
    const schema2 = {
      ...schema,
      $ref,
    };
    const resolvedSchema = resolveSchema(
      schema2 as JsonSchema,
      "",
      rootSchema as JsonSchema,
    );
    return {
      ...rootSchema,
      ...resolvedSchema,
    };
  }, [$ref, schema, rootSchema]);

  useEffect(() => {
    if (!data) setRealLabel("");
  }, [data, setRealLabel]);

  const handleSelectedChange = useCallback(
    (v: AutocompleteSuggestion) => {
      if (!v) {
        handleChange(path, undefined);
        return;
      }
      if (v.value !== data) handleChange(path, v.value);
      setFormData({ "@id": v.value });
      setRealLabel(v.label);
    },
    [path, handleChange, data, setRealLabel, setFormData],
  );

  useEffect(() => {
    setRealLabel((_old) => {
      if ((_old && _old.length > 0) || !data) return _old;
      const parentData = Resolve.data(
        ctx?.core?.data,
        path.substring(0, path.length - ("@id".length + 1)),
      );
      const fieldDecl = primaryFields[typeName] as PrimaryField | undefined;
      let label = data;
      if (fieldDecl?.label)
        label = extractFieldIfString(parentData, fieldDecl.label);
      if (typeof label === "object") {
        console.warn("label is object", label);
        return JSON.stringify(label);
      }
      return label;
    });
  }, [data, ctx?.core?.data, path, setRealLabel]);

  const newURI = useCallback(() => {
    const prefix = schema.title || slent[""].value;
    const newURI = `${prefix}${uuidv4()}`;
    const fieldDecl = primaryFields[typeName] as PrimaryField | undefined;
    const labelKey = fieldDecl?.label || "title";
    setFormData({ "@id": newURI, [labelKey]: searchString });
  }, [schema, data, searchString, setFormData]);

  const handleEntityIRIChange = useCallback((v: string) => {
    handleSelectedChange({ value: v, label: v });
  }, []);

  const typeName = useMemo(
    () => typeIRI.substring(BASE_IRI.length, typeIRI.length),
    [typeIRI],
  );
  //const uischemaExternal = useUISchemaForType(typeIRI || '')

  /*const subSchema = useMemo(() => {
    if (!$ref) return
    const schema2 = {
      ...schema,
      $ref
    }
    const resolvedSchema = resolveSchema(schema2 as JsonSchema, '', rootSchema as JsonSchema)
    return {
      ...rootSchema,
      ...resolvedSchema
    }
  }, [$ref, schema, rootSchema])

  const foundUISchema = useMemo(
      () =>
          findUISchema(
              uischemas || [],
              schema,
              uischema.scope,
              path,
              undefined,
              uischema,
              rootSchema
          ),
      [uischemas, schema, uischema.scope, path, uischema, rootSchema]
  )*/

  const handleToggle = useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation();
      setModalIsOpen(!modalIsOpen);
    },
    [setModalIsOpen, modalIsOpen],
  );

  const handleAddNew = useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation();
      newURI();
      setModalIsOpen(true);
    },
    [setModalIsOpen, newURI],
  );

  const handleSaveAndClose = useCallback(() => {
    setModalIsOpen(false);
    const id = formData["@id"];
    if (!id) return;
    const fieldDecl = primaryFields[typeName] as PrimaryField | undefined;
    let label = id;
    if (fieldDecl?.label)
      label = extractFieldIfString(formData, fieldDecl.label);
    handleSelectedChange({
      value: id,
      label: typeof label === "string" ? label : id,
    });
  }, [setModalIsOpen, formData, handleSelectedChange]);

  const handleClose = useCallback(() => {
    setModalIsOpen(false);
  }, [setModalIsOpen]);

  const handleFormDataChange = useCallback(
    (data: any) => {
      setFormData(data);
    },
    [setFormData],
  );

  return (
    <Hidden xsUp={!visible}>
      <Grid container alignItems="baseline">
        <Grid item flex={"auto"}>
          <DiscoverAutocompleteInput
            loadOnStart={editMode}
            readonly={Boolean(ctx.readonly)}
            typeIRI={typeIRI}
            title={label || ""}
            typeName={typeName || ""}
            selected={selected}
            onSelectionChange={handleSelectedChange}
            onSearchValueChange={setSearchString}
            searchString={searchString}
          />
        </Grid>
        {!ctx.readonly && (
          <Grid item>
            <Grid container direction="column">
              {typeof data == "string" && data.length > 0 && (
                <Grid item>
                  <IconButton sx={{ padding: 0 }} onClick={handleToggle}>
                    {modalIsOpen ? <OpenInNewOff /> : <OpenInNew />}
                  </IconButton>
                </Grid>
              )}
              <Grid item>
                <IconButton sx={{ padding: 0 }} onClick={handleAddNew}>
                  {<Add />}
                </IconButton>
              </Grid>
            </Grid>
            {
              <SemanticFormsModal
                key={selected.value}
                schema={subSchema as JsonSchema}
                formData={formData}
                entityIRI={formData["@id"]}
                typeIRI={typeIRI}
                label={label}
                open={modalIsOpen}
                askClose={handleSaveAndClose}
                askCancel={handleClose}
                onFormDataChange={handleFormDataChange}
                onChange={handleEntityIRIChange}
              />
            }
          </Grid>
        )}
      </Grid>

      <FormControl
        fullWidth={!appliedUiSchemaOptions.trim}
        id={id}
        variant={"standard"}
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
        className={"inline_object_card"}
      ></FormControl>
    </Hidden>
  );
};

export default withJsonFormsControlProps(InlineCondensedSemanticFormsRenderer);
