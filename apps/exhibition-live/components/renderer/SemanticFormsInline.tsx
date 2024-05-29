import { JsonSchema } from "@jsonforms/core";
import { JSONSchema7 } from "json-schema";
import React, { useCallback, useMemo } from "react";

import { useControlled } from "@mui/material";
import { SemanticJsonFormNoOps } from "../form/SemanticJsonFormNoOps";
import { ErrorObject } from "ajv";
import { SemanticJsonFormProps } from "@slub/edb-global-types";
import { useAdbContext } from "@slub/edb-state-hooks";

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

  const { typeIRIToTypeName, uischemata } = useAdbContext();
  const uischema = useMemo(
    () => uischemata?.[typeIRIToTypeName(typeIRI)],
    [typeIRI, typeIRIToTypeName],
  );

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
            uischema: uischema,
          }}
          onEntityChange={onChange}
          formsPath={formsPath}
        />
      )}
    </>
  );
};
