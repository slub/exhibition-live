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
  Theme,
  Typography,
} from "@mui/material";
import merge from "lodash/merge";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { AutocompleteSuggestion } from "@slub/edb-core-types";
import { extractFieldIfString } from "@slub/edb-data-mapping";
import {
  useAdbContext,
  useGlobalSearchWithHelper,
  useRightDrawerState,
} from "@slub/edb-state-hooks";
import { makeFormsPath } from "@slub/edb-ui-utils";
import { JSONSchema7 } from "json-schema";
import { PrimaryField } from "@slub/edb-core-types";
import {
  DiscoverAutocompleteInput,
  EntityDetailListItem,
} from "@slub/edb-advanced-components";
import { SearchbarWithFloatingButton } from "@slub/edb-basic-components";

const InlineDropdownSemanticFormsRendererComponent = (props: ControlProps) => {
  const {
    id,
    errors,
    schema,
    uischema,
    visible,
    config,
    data,
    handleChange,
    path,
    rootSchema,
    label,
  } = props;
  const {
    typeIRIToTypeName,
    queryBuildOptions: { primaryFields },
    components: { SimilarityFinder },
  } = useAdbContext();
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const { $ref, typeIRI } = appliedUiSchemaOptions.context || {};
  const typeName = useMemo(
    () => typeIRI && typeIRIToTypeName(typeIRI),
    [typeIRI, typeIRIToTypeName],
  );
  const ctx = useJsonForms();
  const [realLabel, setRealLabel] = useState("");
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

  const { closeDrawer } = useRightDrawerState();
  const handleSelectedChange = useCallback(
    (v: AutocompleteSuggestion) => {
      if (!v) {
        handleChange(path, undefined);
        closeDrawer();
        return;
      }
      if (v.value !== data) handleChange(path, v.value);
      setRealLabel(v.label);
    },
    [path, handleChange, data, setRealLabel, closeDrawer],
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
  }, [data, ctx?.core?.data, path, setRealLabel, primaryFields]);

  const handleExistingEntityAccepted = useCallback(
    (entityIRI: string, data: any) => {
      handleSelectedChange({
        value: entityIRI,
        label: data.label || entityIRI,
      });
      closeDrawer();
    },
    [handleSelectedChange, closeDrawer],
  );

  const searchOnDataPath = useMemo(() => {
    const typeName = typeIRIToTypeName(typeIRI);
    return primaryFields[typeName]?.label;
  }, [typeIRI, typeIRIToTypeName]);

  const labelKey = useMemo(() => {
    const fieldDecl = primaryFields[typeName] as PrimaryField | undefined;
    return fieldDecl?.label || "title";
  }, [typeName]);

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

  const handleMappedDataIntermediate = useCallback(
    (d: any) => {
      handleMappedData(d);
      closeDrawer();
    },
    [handleMappedData, closeDrawer],
  );

  const showAsFocused = useMemo(
    () => isActive && sidebarOpen,
    [isActive, sidebarOpen],
  );

  const handleClear = useCallback(() => {
    handleSelectedChange(null);
  }, [handleSelectedChange]);

  const hasValue = useMemo(
    () => typeof selected.value === "string",
    [selected],
  );

  const detailsData = useMemo(() => {
    if (!selected.value) return;
    return {
      "@id": selected.value,
      [labelKey]: selected.label,
    };
  }, [selected, labelKey]);

  return (
    <Hidden xsUp={!visible}>
      <Box sx={{ position: "relative" }}>
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
      </Box>
      <Box>
        {!hasValue ? (
          <FormControl fullWidth={!appliedUiSchemaOptions.trim} id={id}>
            <DiscoverAutocompleteInput
              loadOnStart={true}
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
          </FormControl>
        ) : (
          <List sx={{ marginTop: "1em" }} dense>
            <EntityDetailListItem
              entityIRI={selected.value}
              typeIRI={typeIRI}
              onClear={!ctx.readOnly && handleClear}
              data={detailsData}
            />
          </List>
        )}
        {!ctx.readonly && globalPath === formsPath && (
          <SearchbarWithFloatingButton>
            <SimilarityFinder
              finderId={`${formsPath}_${path}`}
              search={searchString}
              data={data}
              classIRI={typeIRI}
              jsonSchema={schema as JSONSchema7}
              onExistingEntityAccepted={handleExistingEntityAccepted}
              searchOnDataPath={searchOnDataPath}
              onMappedDataAccepted={handleMappedDataIntermediate}
            />
          </SearchbarWithFloatingButton>
        )}
      </Box>
    </Hidden>
  );
};

export const InlineDropdownSemanticFormsRenderer = withJsonFormsControlProps(
  InlineDropdownSemanticFormsRendererComponent,
);
