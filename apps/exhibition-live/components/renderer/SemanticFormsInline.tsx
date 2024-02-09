import { JsonFormsCore, JsonSchema } from "@jsonforms/core";
import { JSONSchema7 } from "json-schema";
import React, { useCallback, useState } from "react";

import { useUISchemaForType } from "../form/uischemaForType";
import { uischemas } from "../form/uischemas";
import {Typography, useControlled} from "@mui/material";
import { SemanticJsonFormNoOps } from "../form/SemanticJsonFormNoOps";
import { SemanticJsonFormsProps } from "../form/SemanticJsonForm";
import { ErrorObject } from "ajv";

type SemanticFormsInlineProps = {
  label?: string;
  semanticJsonFormsProps?: Partial<SemanticJsonFormsProps>;
  schema: JsonSchema;
  entityIRI?: string;
  typeIRI: string;
  onChange?: (data: string | undefined) => void;
  onError?: (error: ErrorObject[]) => void;
  formData?: any;
  onFormDataChange?: (data: any) => void;
  formsPath?: string;
};
export const SemanticFormsInline = (props: SemanticFormsInlineProps) => {
  const {
    schema,
    entityIRI,
    onChange,
    onError,
    typeIRI,
    label,
    semanticJsonFormsProps,
    formData: formDataProp,
    onFormDataChange,
    formsPath,
  } = props;
  const [formData, setFormData] = useControlled({
    name: "FormData",
    controlled: formDataProp,
    default: entityIRI ? { "@id": entityIRI } : {},
  });

  const uischemaExternal = typeIRI && useUISchemaForType(typeIRI);

  const handleDataChange = useCallback(
    (data_: any) => {
      setFormData(data_);
      onFormDataChange && onFormDataChange(data_);
    },
    [setFormData, onFormDataChange],
  );

  return (
    <>
      <Typography variant="h6">{typeIRI}</Typography>
      {schema && (
        <SemanticJsonFormNoOps
          {...semanticJsonFormsProps}
          data={formData}
          forceEditMode={true}
          onChange={handleDataChange}
          onError={onError}
          typeIRI={typeIRI}
          schema={schema as JSONSchema7}
          jsonFormsProps={{
            uischema: uischemaExternal || undefined,
            uischemas: uischemas,
          }}
          onEntityChange={onChange}
          formsPath={formsPath}
        />
      )}
    </>
  );
};
