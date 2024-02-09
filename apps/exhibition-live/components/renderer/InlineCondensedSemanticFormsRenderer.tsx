import {
  ControlProps,
  JsonSchema,
  Resolve,
  resolveSchema,
} from "@jsonforms/core";
import { useJsonForms, withJsonFormsControlProps } from "@jsonforms/react";
import {
  Box,
  FormControl,
  Hidden,
  List,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import merge from "lodash/merge";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { slent } from "../form/formConfigs";
import DiscoverAutocompleteInput from "../form/discover/DiscoverAutocompleteInput";
import { primaryFields, PUBLIC_BASE_PATH, typeIRItoTypeName } from "../config";
import { AutocompleteSuggestion } from "../form/DebouncedAutoComplete";
import { extractFieldIfString } from "../utils/mapping/simpleFieldExtractor";
import { PrimaryField } from "../utils/types";
import {
  useGlobalSearchWithHelper,
  useRightDrawerState,
  useSimilarityFinderState,
} from "../state";
import { encodeIRI, makeFormsPath } from "../utils/core";
import { SearchbarWithFloatingButton } from "../layout/main-layout/Searchbar";
import SimilarityFinder from "../form/SimilarityFinder";
import { JSONSchema7 } from "json-schema";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { EntityDetailListItem } from "../form/show";

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
    () =>
      data
        ? { value: data || null, label: realLabel }
        : { value: null, label: null },
    [data, realLabel],
  );
  const { $ref, typeIRI } = appliedUiSchemaOptions.context || {};
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
      let label = "";
      if (fieldDecl?.label)
        label = extractFieldIfString(parentData, fieldDecl.label);
      if (typeof label === "object") {
        return "";
      }
      return label;
    });
  }, [data, ctx?.core?.data, path, setRealLabel]);

  const handleExistingEntityAccepted = useCallback(
    (entityIRI: string, data: any) => {
      handleSelectedChange({
        value: entityIRI,
        label: data.label || entityIRI,
      });
    },
    [handleSelectedChange],
  );

  const typeName = useMemo(
    () => typeIRI && typeIRItoTypeName(typeIRI),
    [typeIRI],
  );

  const router = useRouter();
  const locale = router.query.locale || "";
  const handleToggle = useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation();
      //open new tab if middle mouse click
      if (event?.button === 1) {
        window.open(
          `/${locale}/create/${typeName}?encID=${encodeIRI(data)}`,
          "_blank",
        );
        return;
      }
      setModalIsOpen(!modalIsOpen);
    },
    [setModalIsOpen, modalIsOpen, locale, typeName],
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
    [setFormData],
  );

  const handleMappedDataAccepted = useCallback(
    (newData: any) => {
      const newIRI = newData["@id"];
      if (!newIRI) return;
      handleSelectedChange({
        value: newIRI,
        label: newData.__label || newIRI,
      });
    },
    [handleSelectedChange],
  );
  const { open: sidebarOpen } = useRightDrawerState();
  const {
    path: globalPath,
    searchString,
    handleSearchStringChange,
    handleMappedData,
    handleFocus,
    isActive,
  } = useGlobalSearchWithHelper(
    typeName,
    typeIRI,
    subSchema as JSONSchema7,
    formsPath,
    handleMappedDataAccepted,
  );

  const newURI = useCallback(() => {
    const prefix = schema.title || slent[""].value;
    const iri = `${prefix}${uuidv4()}`;
    const fieldDecl = primaryFields[typeName] as PrimaryField | undefined;
    const labelKey = fieldDecl?.label || "title";
    setFormData({ "@id": iri, [labelKey]: searchString });
    return iri;
  }, [schema, data, searchString, setFormData]);

  const handleAddNew = useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation();
      newURI();
      setModalIsOpen(true);
    },
    [setModalIsOpen, newURI],
  );

  const { t } = useTranslation();

  const handleAddNewWithinNewTab = useCallback(
    (event: React.MouseEvent) => {
      if (event.button !== 1) return;
      event?.stopPropagation();
      const newIRI = newURI();
      handleSelectedChange({
        value: newIRI,
        label: `${t(typeName)} neu (${newIRI.substring(
          newIRI.lastIndexOf("/") + 1,
          newIRI.length,
        )})`,
      });
      window.open(
        `${PUBLIC_BASE_PATH}/${locale}/create/${typeName}?encID=${encodeIRI(
          newIRI,
        )}`,
        "_blank",
      );
    },
    [setModalIsOpen, newURI, typeName, locale],
  );

  const showAsFocused = useMemo(
    () => isActive && sidebarOpen,
    [isActive, sidebarOpen],
  );
  const isValid = errors.length === 0;

  const { cycleThroughElements } = useSimilarityFinderState();

  const handleKeyUp = useCallback(
    (ev: React.KeyboardEvent<HTMLInputElement>) => {
      if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
        cycleThroughElements(ev.key === "ArrowDown" ? 1 : -1);
        ev.preventDefault();
      }
    },
    [cycleThroughElements],
  );

  const handleClear = useCallback(() => {
    handleSelectedChange(null);
  }, [handleSelectedChange]);

  const hasValue = useMemo(
    () => typeof selected.value === "string",
    [selected],
  );
  return (
    <Hidden xsUp={!visible}>
      <Typography
        variant={"h5"}
        sx={{
          transform: !hasValue ? "translateY(2.9em)" : "translateY(0)",
          position: "absolute",
          opacity: hasValue ? 1.0 : 0.0,
          transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
          color: (theme: Theme) => theme.palette.grey[500],
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          height: "4em",
        }}
      >
        {!hasValue ? (
          <FormControl
            fullWidth={!appliedUiSchemaOptions.trim}
            id={id}
            variant={"standard"}
          >
            {!sidebarOpen ? (
              <DiscoverAutocompleteInput
                loadOnStart={editMode}
                readonly={Boolean(ctx.readonly)}
                typeIRI={typeIRI}
                typeName={typeName || ""}
                selected={selected}
                title={label || ""}
                onSelectionChange={handleSelectedChange}
                onSearchValueChange={handleSearchStringChange}
                searchString={searchString || ""}
                inputProps={{
                  onFocus: handleFocus,
                  ...(showAsFocused && { focused: true }),
                }}
              />
            ) : (
              <TextField
                fullWidth
                disabled={Boolean(ctx.readonly)}
                variant="standard"
                error={!isValid}
                onChange={(ev) => handleSearchStringChange(ev.target.value)}
                value={searchString || ""}
                label={label}
                sx={(theme) => ({
                  marginTop: theme.spacing(1),
                  marginBottom: theme.spacing(1),
                })}
                inputProps={{
                  onFocus: handleFocus,
                  onKeyUp: handleKeyUp,
                }}
              />
            )}
          </FormControl>
        ) : (
          <List sx={{ marginTop: "1em" }}>
            <EntityDetailListItem
              entityIRI={selected.value}
              typeIRI={typeIRI}
              onClear={!ctx.readOnly && handleClear}
            />
          </List>
        )}
        {!ctx.readonly && globalPath === formsPath && (
          <SearchbarWithFloatingButton>
            <SimilarityFinder
              search={searchString}
              data={data}
              classIRI={typeIRI}
              jsonSchema={schema as JSONSchema7}
              onExistingEntityAccepted={handleExistingEntityAccepted}
              searchOnDataPath={searchOnDataPath}
              onMappedDataAccepted={handleMappedData}
            />
          </SearchbarWithFloatingButton>
        )}
      </Box>
    </Hidden>
  );
};

export default withJsonFormsControlProps(InlineCondensedSemanticFormsRenderer);
