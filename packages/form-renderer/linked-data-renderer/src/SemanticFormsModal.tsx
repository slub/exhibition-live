import { JsonSchema } from "@jsonforms/core";
import { JSONSchema7 } from "json-schema";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useControlled } from "@mui/material";
import { useAdbContext, useCRUDWithQueryClient } from "@slub/edb-state-hooks";
import { useSnackbar } from "notistack";
import NiceModal from "@ebay/nice-modal-react";
import { irisToData } from "@slub/edb-ui-utils";
import { SemanticJsonFormProps } from "@slub/edb-global-types";
import { GenericModal, MuiEditDialog } from "@slub/edb-basic-components";

type SemanticFormsModalProps = {
  label?: string;
  open: boolean;
  askClose: () => void;
  askCancel?: () => void;
  semanticJsonFormsProps?: Partial<SemanticJsonFormProps>;
  schema: JsonSchema;
  entityIRI?: string;
  typeIRI: string;
  onChange?: (data: string | undefined) => void;
  formData?: any;
  onFormDataChange?: (data: any) => void;
  children?: React.ReactNode;
  formsPath?: string;
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
    children,
    formsPath,
  } = props;
  const [formData, setFormData] = useControlled({
    name: "FormData",
    controlled: formDataProp,
    default: irisToData(entityIRI, typeIRI),
  });

  const [editMode, setEditMode] = useState(true);

  const {
    typeIRIToTypeName,
    uischemata,
    components: { SemanticJsonForm },
  } = useAdbContext();
  const uischema = useMemo(
    () => uischemata?.[typeIRIToTypeName(typeIRI)],
    [typeIRI, typeIRIToTypeName],
  );

  const { loadQuery, saveMutation, removeMutation } = useCRUDWithQueryClient({
    entityIRI,
    typeIRI,
    schema: schema as JSONSchema7,
    queryOptions: { enabled: true },
  });
  const { data: remoteData } = loadQuery;

  useEffect(() => {
    if (remoteData) {
      const data = remoteData.document;
      if (!data || !data["@id"] || !data["@type"]) return;
      setFormData(data);
      onFormDataChange && onFormDataChange(data);
    }
  }, [remoteData, setFormData, onFormDataChange]);

  const { enqueueSnackbar } = useSnackbar();
  const handleSave = useCallback(async () => {
    saveMutation
      .mutateAsync(formData)
      .then(async (skipLoading?: boolean) => {
        enqueueSnackbar("Saved", { variant: "success" });
        !skipLoading && (await loadQuery.refetch());
        askClose();
      })
      .catch((e) => {
        enqueueSnackbar("Error while saving " + e.message, {
          variant: "error",
        });
      });
  }, [enqueueSnackbar, saveMutation, loadQuery, formData, askClose]);

  const handleRemove = useCallback(async () => {
    NiceModal.show(GenericModal, {
      type: "delete",
    }).then(() => {
      removeMutation.mutate();
      enqueueSnackbar("Removed", { variant: "success" });
      askClose();
    });
  }, [removeMutation]);

  const handleReload = useCallback(async () => {
    NiceModal.show(GenericModal, {
      type: "reload",
    }).then(() => {
      loadQuery.refetch();
    });
  }, [loadQuery]);

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
      onReload={handleReload}
      onEdit={handleEditToggle}
      editMode={editMode}
      actions={children}
      onRemove={handleRemove}
    >
      <>
        {schema && (
          <SemanticJsonForm
            {...semanticJsonFormsProps}
            data={formData}
            forceEditMode={Boolean(editMode)}
            onChange={handleDataChange}
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
    </MuiEditDialog>
  );
};
