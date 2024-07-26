import { ControlProps, Resolve } from "@jsonforms/core";
import { useJsonForms, withJsonFormsControlProps } from "@jsonforms/react";
import { FormControl, Hidden } from "@mui/material";
import merge from "lodash/merge";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { AutocompleteSuggestion } from "@slub/edb-core-types";
import { extractFieldIfString } from "@slub/edb-data-mapping";
import { makeFormsPath } from "@slub/edb-ui-utils";
import { useTranslation } from "next-i18next";
import {
  useAdbContext,
  useDataStore,
  useGlobalCRUDOptions,
} from "@slub/edb-state-hooks";
import { PrimaryField } from "@slub/edb-core-types";
import { PreloadedOptionSelect } from "@slub/edb-advanced-components";
import { JSONSchema7 } from "json-schema";
import get from "lodash/get";

const InlineDropdownRendererComponent = (props: ControlProps) => {
  const {
    id,
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
    typeNameToTypeIRI,
    queryBuildOptions,
    jsonLDConfig: { defaultPrefix },
  } = useAdbContext();
  const { primaryFields } = queryBuildOptions;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
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
  const { $ref, typeIRI } = appliedUiSchemaOptions.context || {};

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
      setRealLabel(v.label);
    },
    [path, handleChange, data, setRealLabel],
  );

  const handleOptionChange = useCallback(
    (e: React.SyntheticEvent, v: AutocompleteSuggestion | null) => {
      e.stopPropagation();
      e.preventDefault();
      handleSelectedChange(v);
    },
    [handleSelectedChange],
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

  const typeName = useMemo(
    () => typeIRI && typeIRIToTypeName(typeIRI),
    [typeIRI, typeIRIToTypeName],
  );

  const limit = useMemo(() => {
    return appliedUiSchemaOptions.limit || 100;
  }, [appliedUiSchemaOptions.limit]);

  const { t } = useTranslation();

  const { crudOptions } = useGlobalCRUDOptions();
  const { dataStore, ready } = useDataStore({
    schema: schema as JSONSchema7,
    crudOptionsPartial: crudOptions,
    typeNameToTypeIRI,
    queryBuildOptions,
  });
  const load = useCallback(
    async (searchString?: string) =>
      typeName && ready && dataStore
        ? (
            await dataStore.findDocuments(
              typeName,
              {
                search: searchString || null,
              },
              limit,
            )
          ).map((item) => {
            const primaryField = primaryFields[typeName];
            console.log(
              "primaryField",
              primaryField,
              item,
              primaryFields,
              typeName,
            );
            const primary = primaryField
              ? get(item, primaryField.label)
              : JSON.stringify(item);
            return {
              label: primary,
              value: item["@id"],
            };
          })
        : [],
    [primaryFields, typeName, ready, dataStore, limit],
  );

  return (
    <Hidden xsUp={!visible}>
      <FormControl
        fullWidth={!appliedUiSchemaOptions.trim}
        id={id}
        variant={"standard"}
        sx={{
          marginTop: (theme) => theme.spacing(1),
          marginBottom: (theme) => theme.spacing(1),
        }}
      >
        <PreloadedOptionSelect
          title={label}
          readOnly={Boolean(ctx.readonly)}
          // @ts-ignore
          load={load}
          typeIRI={typeIRI}
          value={selected}
          onChange={handleOptionChange}
        />
      </FormControl>
    </Hidden>
  );
};

export const InlineDropdownRenderer = withJsonFormsControlProps(
  InlineDropdownRendererComponent,
);
