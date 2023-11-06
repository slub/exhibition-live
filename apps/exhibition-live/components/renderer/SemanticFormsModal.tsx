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

type SemanticFormsModalProps = {
  label?: string;
  open: boolean;
  askClose: () => void;
  askCancel?: () => void;
  semanticJsonFormsProps?: Partial<SemanticJsonFormsProps>;
  schema: JsonSchema;
  data: any;
  typeIRI: string;
  onChange: (data: any) => void;
};
export const SemanticFormsModal = (props: SemanticFormsModalProps) => {
  const {
    open,
    schema,
    data,
    onChange,
    typeIRI,
    label,
    askClose,
    askCancel,
    semanticJsonFormsProps,
  } = props;
  const [formData, setFormData] = useState({ "@id": data });
  const [CRUDOps, setCRUDOps] = useState<CRUDOpsType | undefined>();
  const { load, save, remove } = CRUDOps || {};
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
          onSelectionChange={(selection) => onChange(selection?.value)}
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
            entityIRI={data}
            setData={(_data) => setFormData(_data)}
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
            onInit={(crudOps) => setCRUDOps(crudOps)}
            searchText={searchText}
          />
        )}
      </>
    </MuiEditDialog>
  );
};
