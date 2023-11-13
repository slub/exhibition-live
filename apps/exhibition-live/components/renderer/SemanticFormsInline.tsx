import { JsonSchema } from "@jsonforms/core";
import { JSONSchema7 } from "json-schema";
import React, { useCallback, useState } from "react";

import { useUISchemaForType } from "../form/uischemaForType";
import { uischemas } from "../form/uischemas";
import { useControlled } from "@mui/material";
import { SemanticJsonFormNoOps } from "../form/SemanticJsonFormNoOps";
import { SemanticJsonFormsProps } from "../form/SemanticJsonForm";

type SemanticFormsInlineProps = {
  label?: string;
  semanticJsonFormsProps?: Partial<SemanticJsonFormsProps>;
  schema: JsonSchema;
  entityIRI?: string;
  typeIRI: string;
  onChange?: (data: string | undefined) => void;
  formData?: any;
  onFormDataChange?: (data: any) => void;
};
export const SemanticFormsInline = (props: SemanticFormsInlineProps) => {
  const {
    schema,
    entityIRI,
    onChange,
    typeIRI,
    label,
    semanticJsonFormsProps,
    formData: formDataProp,
    onFormDataChange,
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
      {schema && (
        <SemanticJsonFormNoOps
          {...semanticJsonFormsProps}
          data={formData}
          forceEditMode={true}
          onChange={handleDataChange}
          typeIRI={typeIRI}
          schema={schema as JSONSchema7}
          jsonFormsProps={{
            uischema: uischemaExternal || undefined,
            uischemas: uischemas,
          }}
          onEntityChange={onChange}
        />
      )}
    </>
  );
};
