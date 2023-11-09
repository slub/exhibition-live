import { JsonSchema } from "@jsonforms/core";
import { JSONSchema7 } from "json-schema";
import React, { useCallback, useState } from "react";

import {
  defaultJsonldContext,
  defaultPrefix,
  defaultQueryBuilderOptions,
} from "../form/formConfigs";
import SemanticJsonForm, {
  SemanticJsonFormsProps,
} from "../form/SemanticJsonForm";
import { useUISchemaForType } from "../form/uischemaForType";
import { uischemas } from "../form/uischemas";
import { useGlobalCRUDOptions } from "../state/useGlobalCRUDOptions";
import { useControlled } from "@mui/material";

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

  const { crudOptions } = useGlobalCRUDOptions();
  const [editMode, setEditMode] = useState(true);
  const [searchText, setSearchText] = useState<string | undefined>();

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
        <SemanticJsonForm
          {...semanticJsonFormsProps}
          data={formData}
          forceEditMode={Boolean(editMode)}
          hideToolbar={true}
          entityIRI={entityIRI}
          setData={handleDataChange}
          shouldLoadInitially
          typeIRI={typeIRI}
          crudOptions={crudOptions}
          defaultPrefix={defaultPrefix}
          jsonldContext={defaultJsonldContext}
          queryBuildOptions={defaultQueryBuilderOptions}
          schema={schema as JSONSchema7}
          jsonFormsProps={{
            uischema: uischemaExternal || undefined,
            uischemas: uischemas,
          }}
          onEntityChange={onChange}
          searchText={searchText}
        />
      )}
    </>
  );
};
