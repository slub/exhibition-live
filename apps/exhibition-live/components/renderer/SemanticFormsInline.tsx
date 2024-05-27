import { JsonSchema } from "@jsonforms/core";
import { JSONSchema7 } from "json-schema";
import React, { useCallback } from "react";

import { useUISchemaForType } from "../form/uischemaForType";
import { useControlled } from "@mui/material";
import { SemanticJsonFormNoOps } from "../form/SemanticJsonFormNoOps";
import { ErrorObject } from "ajv";
import { SemanticJsonFormProps } from "@slub/edb-global-types";

type SemanticFormsInlineProps = {
  label?: string;
  semanticJsonFormsProps?: Partial<SemanticJsonFormProps>;
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
          }}
          onEntityChange={onChange}
          formsPath={formsPath}
        />
      )}
    </>
  );
};
