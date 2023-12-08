import {
  ControlProps,
  JsonSchema,
  Resolve,
  resolveSchema,
} from "@jsonforms/core";
import { useJsonForms, withJsonFormsControlProps } from "@jsonforms/react";
import { FormControl, Grid, Hidden, IconButton } from "@mui/material";
import merge from "lodash/merge";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import {defaultJsonldContext, defaultPrefix, slent} from "../form/formConfigs";
import { Add, OpenInNew, OpenInNewOff } from "@mui/icons-material";
import DiscoverAutocompleteInput from "../form/discover/DiscoverAutocompleteInput";
import { primaryFields } from "../config";
import { AutocompleteSuggestion } from "../form/DebouncedAutoComplete";
import { SemanticFormsModal } from "./SemanticFormsModal";
import { extractFieldIfString } from "../utils/mapping/simpleFieldExtractor";
import { PrimaryField } from "../utils/types";
import { typeIRItoTypeName } from "../content/main/Dashboard";
import { useGlobalSearch } from "../state";
import { TabIcon } from "../theme/icons";
import { makeFormsPath } from "../utils/core";
import { SearchbarWithFloatingButton } from "../layout/main-layout/Searchbar";
import SimilarityFinder from "../form/SimilarityFinder";
import NiceModal from "@ebay/nice-modal-react";
import GenericModal from "../form/GenericModal";
import { JSONSchema7 } from "json-schema";
import {useCRUDWithQueryClient} from "../state/useCRUDWithQueryClient";
import {useGlobalCRUDOptions} from "../state/useGlobalCRUDOptions";
import get from "lodash/get";

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
  const enableDrawer = true;
  const [formData, setFormData] = useState<any>({ "@id": data });
  const [searchString, setSearchString] = useState<string | undefined>("");
  const {
    setTypeName,
    setSearch,
    setPath,
    path: globalPath,
  } = useGlobalSearch();
  const isValid = errors.length === 0;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const [editMode, setEditMode] = useState(false);
  const ctx = useJsonForms();
  const [realLabel, setRealLabel] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const formsPath = useMemo(
    () => makeFormsPath(config?.formsPath, path),
    [config?.formsPath, path],
  );
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
    () => typeIRI && typeIRItoTypeName(typeIRI),
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

  const searchOnDataPath = useMemo(() => {
    const typeName = typeIRItoTypeName(typeIRI);
    return primaryFields[typeName]?.label;
  }, [typeIRI]);

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
    [setFormData, setPath],
  );

  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTypeName(typeName);
      setPath(formsPath);
    },
    [setTypeName, typeName, setPath, formsPath],
  );

  const handleSearchValueChange = useCallback(
    (v: string) => {
      setSearch(v);
      setSearchString(v);
    },
    [setSearch, setSearchString],
  );

  const { crudOptions } = useGlobalCRUDOptions();
  const { saveMutation } = useCRUDWithQueryClient(
    data,
    typeIRI,
    subSchema as JSONSchema7,
    defaultPrefix,
    crudOptions,
    defaultJsonldContext,
    { enabled: false},
    undefined,
    true
  );

  const handleMappedData = useCallback(
    (newData: any) => {
      if (!newData) return;
      //avoid overriding of id and type by mapped data
      NiceModal.show(GenericModal, {
        type:
          newData["@type"] !== typeIRI
            ? "confirm save mapping"
            : "confirm mapping",
      }).then(() => {
        const prefix = schema.title || slent[""].value;
        const newIRI = `${prefix}${uuidv4()}`;
        saveMutation.mutate({
          ...newData,
          "@id": newIRI,
          "@type": typeIRI
        })
        const label = get(newData, primaryFields[typeName]?.label);
        handleSelectedChange({
          value: newIRI,
          label: typeof label === "string" ? label : newIRI,
        });
      });
    },
    [saveMutation, handleSelectedChange, schema,  path, typeIRI, data],
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
            onSearchValueChange={handleSearchValueChange}
            searchString={searchString}
            inputProps={{
              onFocus: handleFocus,
            }}
          />
        </Grid>
        {!ctx.readonly && (
          <Grid item>
            <Grid container direction="column">
              {typeof data == "string" && data.length > 0 && (
                <>
                  <Grid item>
                    <IconButton sx={{ padding: 0 }} onClick={handleToggle}>
                      {modalIsOpen ? <OpenInNewOff /> : <OpenInNew />}
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <IconButton
                      component={React.forwardRef<HTMLSpanElement, any>(
                        ({ children, ...props }, ref) => (
                          <span {...props} ref={ref}>
                            <a
                              href={`/de/create/${typeName}`}
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
                  </Grid>
                </>
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
                formsPath={formsPath}
              />
            }
            {globalPath === formsPath && (
              <SearchbarWithFloatingButton>
                <>
                  <SimilarityFinder
                    search={searchString}
                    data={data}
                    classIRI={typeIRI}
                    jsonSchema={schema as JSONSchema7}
                    onEntityIRIChange={handleEntityIRIChange}
                    searchOnDataPath={searchOnDataPath}
                    onMappedDataAccepted={handleMappedData}
                  />
                </>
              </SearchbarWithFloatingButton>
            )}
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
