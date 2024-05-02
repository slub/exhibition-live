import {
  ControlProps,
  JsonSchema,
  Resolve,
  resolveSchema,
} from "@jsonforms/core";
import { useJsonForms, withJsonFormsControlProps } from "@jsonforms/react";
import { FormControl, Hidden } from "@mui/material";
import merge from "lodash/merge";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { primaryFields, typeIRItoTypeName } from "../config";
import { AutocompleteSuggestion } from "../form/DebouncedAutoComplete";
import { extractFieldIfString } from "@slub/edb-ui-utils";
import { makeFormsPath } from "@slub/edb-ui-utils";
import { useTranslation } from "next-i18next";
import { PreloadedOptionSelect } from "../form/PreloadedOptionSelect";
import { useGlobalCRUDOptions } from "@slub/edb-state-hooks";
import { PrimaryField } from "@slub/edb-core-types";
import { findEntityByClass } from "@slub/sparql-schema";

const InlineDropdownRenderer = (props: ControlProps) => {
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
    () => typeIRI && typeIRItoTypeName(typeIRI),
    [typeIRI],
  );

  const limit = useMemo(() => {
    return appliedUiSchemaOptions.limit || 100;
  }, [appliedUiSchemaOptions.limit]);

  const { t } = useTranslation();

  const { crudOptions } = useGlobalCRUDOptions();
  const load = useCallback(
    async (searchString?: string) =>
      typeIRI && crudOptions
        ? (
            await findEntityByClass(
              searchString || null,
              typeIRI,
              crudOptions.selectFetch,
              limit,
            )
          ).map(({ name = "", value }: { name: string; value: any }) => {
            return {
              label: name,
              value,
            };
          })
        : [],
    [typeIRI, crudOptions, limit],
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

export default withJsonFormsControlProps(InlineDropdownRenderer);
