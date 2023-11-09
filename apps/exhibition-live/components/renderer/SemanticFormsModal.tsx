import { JsonSchema } from "@jsonforms/core";
import { JSONSchema7 } from "json-schema";
import React, { useCallback, useMemo, useState } from "react";

import DiscoverAutocompleteInput from "../form/discover/DiscoverAutocompleteInput";
import {
  defaultJsonldContext,
  defaultPrefix,
  defaultQueryBuilderOptions,
} from "../form/formConfigs";
import SemanticJsonForm, {
  CRUDOpsType,
  SemanticJsonFormsProps,
} from "../form/SemanticJsonForm";
import { useUISchemaForType } from "../form/uischemaForType";
import { uischemas } from "../form/uischemas";
import MuiEditDialog from "./MuiEditDialog";
import { useGlobalCRUDOptions } from "../state/useGlobalCRUDOptions";
import { BASE_IRI } from "../config";
import { useControlled } from "@mui/material";
import { useCRUD } from "../state/useCRUD";

type SemanticFormsModalProps = {
  label?: string;
  open: boolean;
  askClose: () => void;
  askCancel?: () => void;
  semanticJsonFormsProps?: Partial<SemanticJsonFormsProps>;
  schema: JsonSchema;
  entityIRI?: string;
  typeIRI: string;
  onChange?: (data: string | undefined) => void;
  formData?: any;
  onFormDataChange?: (data: any) => void;
};
export const SemanticFormsModal = (props: SemanticFormsModalProps) => {
  const {
    open,
    schema,
    entityIRI,
    onChange,
    typeIRI,
    label,
    askClose,
    askCancel,
    semanticJsonFormsProps,
    formData: formDataProp,
    onFormDataChange,
  } = props;
  const [formData, setFormData] = useControlled({
    name: "FormData",
    controlled: formDataProp,
    default: entityIRI ? { "@id": entityIRI } : {},
  });
  const { save, remove, load } = useCRUD(formData, schema as JSONSchema7);

  const { crudOptions } = useGlobalCRUDOptions();
  const [editMode, setEditMode] = useState(true);
  const [searchText, setSearchText] = useState<string | undefined>();

  const uischemaExternal = typeIRI && useUISchemaForType(typeIRI);
  const typeName = useMemo(
    () => typeIRI && typeIRI.substring(BASE_IRI.length, typeIRI.length),
    [typeIRI],
  );

  const handleSave = useCallback(async () => {
    if (!save) return;
    await save();
    //emitToSubscribers(subscriptionKeys.GLOBAL_DATA_CHANGE, subscriptions)
    askClose && askClose();
  }, [save]);
  const handleRemove = useCallback(async () => {
    if (!remove) return;
    await remove();
  }, [remove]);

  const handleSearchTextChange = useCallback(
    (searchText: string | undefined) => {
      setSearchText(searchText);
    },
    [setSearchText],
  );
  const handleDataChange = useCallback(
    (data_: any) => {
      setFormData(data_);
      onFormDataChange && onFormDataChange(data_);
    },
    [setFormData, onFormDataChange],
  );

  const handleEditToggle = useCallback(() => {
    setEditMode(!editMode);
  }, [editMode, setEditMode]);
  return (
    <MuiEditDialog
      title={label || ""}
      open={open}
      onClose={askCancel}
      onCancel={askCancel}
      onSave={handleSave}
      onReload={load}
      onEdit={handleEditToggle}
      editMode={Boolean(editMode)}
      search={
        <DiscoverAutocompleteInput
          typeIRI={typeIRI}
          title={label || ""}
          typeName={typeName || ""}
          onDebouncedSearchChange={handleSearchTextChange}
          onSelectionChange={(selection) =>
            onChange && onChange(selection?.value)
          }
        />
      }
      onRemove={handleRemove}
    >
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
    </MuiEditDialog>
  );
};
