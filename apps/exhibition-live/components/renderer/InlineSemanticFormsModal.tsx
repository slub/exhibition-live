import { JsonSchema, resolveSchema, UISchemaElement } from "@jsonforms/core";
import { JSONSchema7 } from "json-schema";
import React, { useCallback, useMemo, useState } from "react";

import DiscoverAutocompleteInput from "../form/discover/DiscoverAutocompleteInput";
import { SemanticJsonFormsProps } from "../form/SemanticJsonForm";
import { useUISchemaForType } from "../form/uischemaForType";
import { uischemas } from "../form/uischemas";
import MuiEditDialog from "./MuiEditDialog";
import { BASE_IRI } from "../config";
import { SemanticJsonFormNoOps } from "../form/SemanticJsonFormNoOps";
import { useCRUDWithQueryClient } from "../state/useCRUDWithQueryClient";
import NiceModal from "@ebay/nice-modal-react";
import GenericModal from "../form/GenericModal";
import { useSnackbar } from "notistack";
import { irisToData } from "@slub/edb-ui-utils";

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
  const { $ref, typeIRI } = uischema.options?.context || {};
  const [formData, setFormData] = useState(irisToData(data, typeIRI));
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

  const uischemaExternal = useUISchemaForType(typeIRI);
  const typeName = useMemo(
    () => typeIRI && typeIRI.substring(BASE_IRI.length, typeIRI.length),
    [typeIRI],
  );

  const subSchema: JSONSchema7 = useMemo(() => {
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
    } as JSONSchema7;
  }, [$ref, schema, rootSchema]);

  const handleSearchTextChange = useCallback(
    (searchText: string | undefined) => {
      setSearchText(searchText);
    },
    [setSearchText],
  );

  const { loadQuery, existsQuery, saveMutation, removeMutation } =
    useCRUDWithQueryClient(data, typeIRI, subSchema, { enabled: false });

  const { enqueueSnackbar } = useSnackbar();
  const handleSave = useCallback(async () => {
    saveMutation
      .mutateAsync(data)
      .then(async (skipLoading?: boolean) => {
        enqueueSnackbar("Saved", { variant: "success" });
        !skipLoading && (await loadQuery.refetch());
      })
      .catch((e) => {
        enqueueSnackbar("Error while saving " + e.message, {
          variant: "error",
        });
      });
  }, [enqueueSnackbar, saveMutation, loadQuery, data]);

  const handleRemove = useCallback(async () => {
    NiceModal.show(GenericModal, {
      type: "delete",
    }).then(() => {
      removeMutation.mutate();
    });
  }, [removeMutation]);

  const handleReload = useCallback(async () => {
    NiceModal.show(GenericModal, {
      type: "reload",
    }).then(() => {
      loadQuery.refetch();
    });
  }, [loadQuery]);

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
      onReload={handleReload}
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
          <SemanticJsonFormNoOps
            {...semanticJsonFormsProps}
            data={formData}
            forceEditMode={Boolean(editMode)}
            onChange={setFormData}
            typeIRI={typeIRI}
            schema={subSchema as JSONSchema7}
            jsonFormsProps={{
              uischema: uischemaExternal || undefined,
              uischemas: uischemas,
            }}
            onEntityChange={handleChange_}
            searchText={searchText}
          />
        )}
      </>
    </MuiEditDialog>
  );
};
