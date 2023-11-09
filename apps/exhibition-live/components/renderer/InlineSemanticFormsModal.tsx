import { JsonSchema, resolveSchema, UISchemaElement } from "@jsonforms/core";
import { JSONSchema7 } from "json-schema";
import merge from "lodash/merge";
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

type InlineSemanticFormsModalProps = {
  label?: string;
  path: string;
  open: boolean;
  askClose: () => void;
  semanticJsonFormsProps?: Partial<SemanticJsonFormsProps>;
  schema: JsonSchema;
  rootSchema: JsonSchema;
  uischema: UISchemaElement;
  data: any;
  handleChange: (path: string, value: any) => void;
};
export const InlineSemanticFormsModal = (
  props: InlineSemanticFormsModalProps,
) => {
  const {
    open,
    schema,
    uischema,
    data,
    handleChange,
    path,
    rootSchema,
    label,
    askClose,
    semanticJsonFormsProps,
  } = props;
  const [formData, setFormData] = useState({ "@id": data });
  const [CRUDOps, setCRUDOps] = useState<CRUDOpsType | undefined>();
  const { load, save, remove } = CRUDOps || {};
  const { crudOptions } = useGlobalCRUDOptions();
  const [editMode, setEditMode] = useState(true);
  const [searchText, setSearchText] = useState<string | undefined>();

  const handleChange_ = useCallback(
    (v?: string) => {
      //FIXME: this is a workaround for a bug, that causes this to be called with the same value eternally
      if (v === data) return;
      handleChange(path, v);
    },
    [path, handleChange, data],
  );

  const { $ref, typeIRI } = uischema.options?.context || {};
  const uischemaExternal = useUISchemaForType(typeIRI);
  const typeName = useMemo(
    () => typeIRI && typeIRI.substring(BASE_IRI.length, typeIRI.length),
    [typeIRI],
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

  const handleSave = useCallback(async () => {
    console.log("handleSave");
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

  const handleCRUDOpsChange = useCallback(
    (crudOps) => setCRUDOps(crudOps),
    [setCRUDOps],
  );

  const handleEditToggle = useCallback(() => {
    setEditMode(!editMode);
  }, [editMode, setEditMode]);
  return (
    <MuiEditDialog
      title={label || ""}
      open={open}
      onClose={askClose}
      onCancel={askClose}
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
          onSelectionChange={(selection) => handleChange_(selection?.value)}
        />
      }
      onRemove={handleRemove}
    >
      <>
        {subSchema && (
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
            schema={subSchema as JSONSchema7}
            jsonFormsProps={{
              uischema: uischemaExternal || undefined,
              uischemas: uischemas,
            }}
            onEntityChange={handleChange_}
            onInit={handleCRUDOpsChange}
            searchText={searchText}
          />
        )}
      </>
    </MuiEditDialog>
  );
};
